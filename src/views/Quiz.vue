<template>
  <div class="quiz" v-if="currentQuestion" ref="quizContainer">
    <LoadingSpinner v-if="isLoading" isOverlay />
    <header class="quiz-header">
      <button class="back-btn" @click="showConfirmDialog">返回</button>
      <div class="mode-badge" :class="`mode-${state.mode}`">
        {{ state.mode === 'memorize' ? '📝 背题模式' : '✏️ 练习模式' }}
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
      <span class="progress-text">{{ progress.current }} / {{ progress.total }}</span>
    </header>

    <div class="layout">
      <div class="main">
        <div class="question-card">
          <div class="question-meta">
            <span class="tag" :class="`tag-${currentQuestion.category}`">
              {{ currentQuestion.category }}
            </span>
            <span class="tag" :class="`tag-${currentQuestion.difficulty}`">
              {{ difficultyMap[currentQuestion.difficulty] }}
            </span>
            <span class="type">{{ typeLabel }}</span>
          </div>

          <h2 class="question-title">{{ currentQuestion.question }}</h2>

          <div v-if="currentQuestion.type === 'single' || currentQuestion.type === 'multiple'" class="options">
            <QuestionOption v-for="(option, index) in currentQuestion.options" :key="index" :index="index"
              :text="option" :type="currentQuestion.type" :isSelected="isSelected(index)"
              :isCorrect="isCorrectOption(index)" :showResult="showResult || isMemorizeMode"
              :disabled="showResult || isMemorizeMode" @select="handleOptionSelect(index)" />
          </div>
          <div v-else class="text-answer">
            <textarea v-if="currentQuestion.type === 'short'" class="short-input" v-model="textAnswer"
              :disabled="showResult || isMemorizeMode" rows="4" placeholder="请输入答案"></textarea>
            <input v-else class="fill-input" v-model="textAnswer" :disabled="showResult || isMemorizeMode"
              placeholder="请输入填空答案" />
          </div>

          <div class="actions">
            <button class="btn btn-secondary" @click="handlePrev" :disabled="isFirstQuestion">
              上一题
            </button>

            <template v-if="isMemorizeMode">
              <!-- 背题模式：直接显示下一题按钮 -->
              <button class="btn btn-primary" @click="handleNext">
                {{ isLastQuestion ? '查看结果' : '下一题' }}
              </button>
            </template>

            <template v-else-if="!showResult">
              <!-- 练习模式：未提交时显示提交和跳过 -->
              <button class="btn btn-primary" @click="handleSubmit" :disabled="!hasAnswer">
                提交答案
              </button>
              <button class="btn btn-secondary" @click="handleReveal">显示答案</button>
              <button class="btn btn-secondary" @click="handleSkip" :disabled="isLastQuestion">
                跳过
              </button>
            </template>

            <button v-else class="btn btn-primary" @click="handleNext">
              {{ isLastQuestion ? '查看结果' : '下一题' }}
            </button>
          </div>

          <div v-if="showResult || isMemorizeMode" class="explanation">
            <div v-if="!isMemorizeMode" class="result" :class="{ correct: isAnswerCorrect, wrong: !isAnswerCorrect }">
              {{ isAnswerCorrect ? '✓ 回答正确' : '✗ 回答错误' }}
            </div>
            <div class="explanation-content">
              <h4>{{ isMemorizeMode ? '答案与解析' : '解析' }}</h4>
              <p>{{ currentQuestion.explanation }}</p>
            </div>
            <div v-if="currentQuestion.type === 'short' || currentQuestion.type === 'fill'" class="answer-block">
              <h4>正确答案</h4>
              <p>{{ formatTextAnswer(currentQuestion.answer) }}</p>
            </div>
          </div>
        </div>
      </div>
      <aside class="sidebar">
        <div class="sidebar-panel">
          <div class="sidebar-title">题号</div>
          <div class="pager">
            <div class="pager-col">
              <button class="pager-btn" @click="toFirstPage" :disabled="pageIndex === 0">首页</button>
              <button class="pager-btn" @click="toPrevPage" :disabled="pageIndex === 0">上一页</button>
            </div>
            <span class="pager-info">第 {{ pageIndex + 1 }} / {{ totalPages }} 页</span>
            <div class="pager-col">
              <button class="pager-btn" @click="toLastPage" :disabled="pageIndex >= totalPages - 1">末页</button>
              <button class="pager-btn" @click="toNextPage" :disabled="pageIndex >= totalPages - 1">下一页</button>
            </div>
          </div>
          <div class="page-list">
            <button v-for="p in pageRange" :key="p" class="page-num" :class="{ active: p === pageIndex }"
              @click="setPage(p)">{{
                p + 1 }}</button>
          </div>
          <div class="jump">
            <input class="jump-input" v-model="pageInput" type="number" min="1" :max="totalPages" placeholder="页码" />
            <button class="pager-btn" @click="gotoInputPage" :disabled="!pageInput">跳转</button>
          </div>
          <div class="number-grid">
            <button v-for="i in pageItems" :key="i" class="number-item"
              :class="{ current: i === state.currentIndex, answered: isAnswered(i), correct: isCorrect(i), wrong: isWrong(i), peeked: isPeeked(i) }"
              @click="jumpTo(i)">{{ i + 1 }}</button>
          </div>
          <div class="legend">
            <span class="legend-item correct">正确</span>
            <span class="legend-item wrong">错误</span>
            <span class="legend-item peeked">已查看</span>
            <span class="legend-item unanswered">未查看</span>
          </div>
        </div>
      </aside>
    </div>
  </div>

  <!-- 自定义确认对话框 -->
  <ConfirmDialog ref="confirmDialogRef" :title="exitTitle" :message="exitMessage" :confirm-text="exitConfirm"
    :cancel-text="exitCancel" @confirm="handleBack" />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuiz } from '@/composables/useQuiz'
import { useSwipe } from '@/composables/useSwipe'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import QuestionOption from '@/components/QuestionOption.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const router = useRouter()
const { currentQuestion, progress, submitAnswer, nextQuestion, prevQuestion, finishQuiz, state, goToQuestion, revealAnswer, resumeQuiz } = useQuiz()

// 确认对话框引用
const confirmDialogRef = ref<InstanceType<typeof ConfirmDialog> | null>(null)

// 答题容器引用
const quizContainer = ref<HTMLElement | null>(null)

// 设置手势支持
useSwipe(quizContainer, {
  onSwipeLeft: () => {
    // 向左滑动 - 下一题
    if (!isLastQuestion.value) {
      if (isMemorizeMode.value || showResult.value) {
        handleNext()
      }
    }
  },
  onSwipeRight: () => {
    // 向右滑动 - 上一题
    if (!isFirstQuestion.value) {
      handlePrev()
    }
  }
})

// 用户选择的答案
const selectedAnswer = ref<number | null>(null)
const selectedAnswers = ref<number[]>([])
const textAnswer = ref('')
const showResult = ref(false)
const isAnswerCorrect = ref(false)
const isLoading = ref(false)

// 难度映射
const difficultyMap = {
  easy: '简单',
  medium: '中等',
  hard: '困难'
}

// 进度百分比
const progressPercent = computed(() => (progress.value.current / progress.value.total) * 100)
const typeLabel = computed(() => currentQuestion.value?.type === 'single' ? '单选' : currentQuestion.value?.type === 'multiple' ? '多选' : currentQuestion.value?.type === 'short' ? '简答' : '填空')

// 是否为第一题
const isFirstQuestion = computed(() => state.value.currentIndex === 0)

// 是否为最后一题
const isLastQuestion = computed(() => progress.value.current === progress.value.total)

// 是否为背题模式
const isMemorizeMode = computed(() => state.value.mode === 'memorize')

// 是否已选择答案
const hasAnswer = computed(() => {
  if (currentQuestion.value?.type === 'single') return selectedAnswer.value !== null
  if (currentQuestion.value?.type === 'multiple') return selectedAnswers.value.length > 0
  return textAnswer.value.trim().length > 0
})

// 题号分页
const pageSize = ref(20)
const pageIndex = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(state.value.questions.length / pageSize.value)))
const pageStart = computed(() => pageIndex.value * pageSize.value)
const pageItems = computed(() => Array.from({ length: Math.max(0, Math.min(pageSize.value, state.value.questions.length - pageStart.value)) }, (_, k) => pageStart.value + k))
const toPrevPage = () => { if (pageIndex.value > 0) pageIndex.value-- }
const toNextPage = () => { if (pageIndex.value < totalPages.value - 1) pageIndex.value++ }
const setPage = (p: number) => { if (p >= 0 && p < totalPages.value) pageIndex.value = p }
const toFirstPage = () => { setPage(0) }
const toLastPage = () => { setPage(totalPages.value - 1) }
watch(() => state.value.currentIndex, (idx) => { const p = Math.floor(idx / pageSize.value); if (p !== pageIndex.value) pageIndex.value = p })
const pageWindow = ref(7)
const pageRange = computed(() => {
  const total = totalPages.value
  const win = pageWindow.value
  if (total <= win) return Array.from({ length: total }, (_, i) => i)
  const half = Math.floor(win / 2)
  let start = Math.max(0, pageIndex.value - half)
  if (start + win > total) start = total - win
  return Array.from({ length: win }, (_, k) => start + k)
})
const pageInput = ref('')
const gotoInputPage = () => {
  const n = parseInt(pageInput.value, 10)
  if (!isNaN(n)) {
    setPage(n - 1)
    pageInput.value = ''
  }
}

// 判断选项是否被选中
const isSelected = (index: number) => {
  return currentQuestion.value?.type === 'single'
    ? selectedAnswer.value === index
    : selectedAnswers.value.includes(index)
}

// 处理选项选择
const handleOptionSelect = (index: number) => {
  if (currentQuestion.value?.type === 'single') {
    selectedAnswer.value = index
  } else {
    const position = selectedAnswers.value.indexOf(index)
    if (position === -1) {
      selectedAnswers.value.push(index)
    } else {
      selectedAnswers.value.splice(position, 1)
    }
  }
}

// 判断选项是否为正确答案
const isCorrectOption = (index: number) => {
  const answer = currentQuestion.value?.answer
  if (Array.isArray(answer)) {
    return typeof answer[0] === 'number' ? (answer as number[]).includes(index) : false
  }
  return answer === index
}

// 提交答案
const handleSubmit = () => {
  const answer = currentQuestion.value?.type === 'single' ? selectedAnswer.value! : currentQuestion.value?.type === 'multiple' ? selectedAnswers.value : textAnswer.value

  submitAnswer(answer)

  // 判断答案是否正确
  const correctAnswer = currentQuestion.value?.answer
  if (currentQuestion.value?.type === 'single' || currentQuestion.value?.type === 'multiple') {
    isAnswerCorrect.value = Array.isArray(answer)
      ? JSON.stringify((answer as number[]).slice().sort()) === JSON.stringify((correctAnswer as number[]).slice().sort())
      : answer === correctAnswer
  } else {
    const norm = (v: unknown) => typeof v === 'string' ? v.trim().toLowerCase() : v
    if (Array.isArray(correctAnswer)) {
      isAnswerCorrect.value = (correctAnswer as string[]).map(norm).includes(norm(answer))
    } else {
      isAnswerCorrect.value = norm(answer) === norm(correctAnswer as string)
    }
  }

  showResult.value = true
}
const handleReveal = () => {
  const ans = currentQuestion.value?.answer
  if (Array.isArray(ans)) {
    if (typeof ans[0] === 'number') {
      selectedAnswers.value = [...(ans as number[])]
    } else {
      textAnswer.value = (ans as (string | number)[]).map(a => String(a)).join(', ')
    }
  } else {
    if (typeof ans === 'number') {
      selectedAnswer.value = ans
    } else {
      textAnswer.value = String(ans)
    }
  }
  revealAnswer()
  showResult.value = true
}

// 上一题
const handlePrev = () => {
  prevQuestion()
  resetAnswer()
  loadCurrentAnswer()
}

// 跳过当前题（未作答时切换）
const handleSkip = () => {
  if (!isLastQuestion.value) {
    nextQuestion()
    resetAnswer()
    loadCurrentAnswer()
  }
}

// 下一题或查看结果（已作答后）
const handleNext = () => {
  if (isLastQuestion.value) {
    finishQuiz()
    router.push('/result')
  } else {
    nextQuestion()
    resetAnswer()
    loadCurrentAnswer()
  }
}

// 重置答案状态
const resetAnswer = () => {
  selectedAnswer.value = null
  selectedAnswers.value = []
  textAnswer.value = ''
  showResult.value = false
}

// 加载当前答案
const loadCurrentAnswer = () => {
  isLoading.value = true

  setTimeout(() => {
    const currentIndex = state.value.currentIndex
    const userAnswer = state.value.userAnswers.find(a => a.questionIndex === currentIndex)

    if (userAnswer) {
      if (Array.isArray(userAnswer.answer)) {
        if (typeof userAnswer.answer[0] === 'number') {
          selectedAnswers.value = [...(userAnswer.answer as number[])]
        } else {
          textAnswer.value = String((userAnswer.answer as string[])[0] ?? '')
        }
      } else {
        if (typeof userAnswer.answer === 'number') {
          selectedAnswer.value = userAnswer.answer
        } else {
          textAnswer.value = String(userAnswer.answer)
        }
      }
      showResult.value = true
      isAnswerCorrect.value = userAnswer.isCorrect
    } else if (isMemorizeMode.value && currentQuestion.value) {
      const correctAnswer = currentQuestion.value.answer
      if (Array.isArray(correctAnswer)) {
        if (typeof correctAnswer[0] === 'number') {
          selectedAnswers.value = [...(correctAnswer as number[])]
        } else {
          textAnswer.value = String((correctAnswer as string[])[0] ?? '')
        }
      } else {
        if (typeof correctAnswer === 'number') {
          selectedAnswer.value = correctAnswer
        } else {
          textAnswer.value = String(correctAnswer)
        }
      }
    } else {
      selectedAnswer.value = null
      selectedAnswers.value = []
      textAnswer.value = ''
      showResult.value = false
    }

    isLoading.value = false
  }, 300)
}

const isAnswered = (i: number) => {
  return !!state.value.userAnswers.find(a => a.questionIndex === i)
}
const isPeeked = (i: number) => {
  const a = state.value.userAnswers.find(u => u.questionIndex === i)
  return !!a && !!a.peeked
}

onMounted(() => {
  resumeQuiz()
  loadCurrentAnswer()
})

const jumpTo = (i: number) => {
  goToQuestion(i)
  resetAnswer()
  loadCurrentAnswer()
}

const isCorrect = (i: number) => {
  const a = state.value.userAnswers.find(u => u.questionIndex === i)
  return !!a && a.isCorrect === true
}

const isWrong = (i: number) => {
  const a = state.value.userAnswers.find(u => u.questionIndex === i)
  return !!a && a.isCorrect === false
}

const formatTextAnswer = (ans: number | number[] | string | string[]) => {
  if (Array.isArray(ans)) {
    return (ans as (string | number)[]).map(a => String(a)).join(', ')
  }
  return String(ans)
}

const exitTitle = computed(() => state.value.mode === 'memorize' ? '退出背题' : '退出练习')
const exitMessage = computed(() => state.value.mode === 'memorize' ? '确定要退出背题吗？进度已保存，下次可继续。' : '确定要退出练习吗？进度已保存，下次可继续。')
const exitConfirm = '退出'
const exitCancel = computed(() => state.value.mode === 'memorize' ? '继续背题' : '继续练习')

// 显示确认对话框
const showConfirmDialog = () => {
  confirmDialogRef.value?.show()
}

// 返回首页
const handleBack = () => {
  router.push('/')
}
</script>
<style scoped>
.layout {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 20px;
}

.main {
  width: 100%;
}

.sidebar {
  width: 100%;
  padding-left: 0;
  position: sticky;
  top: 20px;
  align-self: start;
}

.sidebar-panel {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.sidebar-title {
  font-weight: 600;
  margin-bottom: 8px;
}

.pager {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.pager-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pager-btn {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
}

.pager-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pager-info {
  font-size: 13px;
  color: #666;
}

.page-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.page-num {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
}

.page-num.active {
  border-color: #111;
}

.jump {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.jump-input {
  width: 90px;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.number-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(42px, 1fr));
  gap: 8px;
}

.number-item {
  padding: 10px 0;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  transition: all 0.15s ease;
}

.number-item.current {
  border-color: #111827;
  background: #f3f4f6;
}

.number-item.answered {
  background: #f8f9fa;
  border-color: #ddd;
}

.number-item.correct {
  background: #f0fdf4;
  border-color: #22c55e;
}

.number-item.wrong {
  background: #fef2f2;
  border-color: #ef4444;
}

.number-item.peeked {
  background: #fef3c7;
  border-color: #f59e0b;
}

.number-item:hover {
  border-color: #9ca3af;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.legend {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  font-size: 12px;
  background: #fff;
}

.legend-item.correct {
  border-color: #22c55e;
  background: #f0fdf4;
}

.legend-item.wrong {
  border-color: #ef4444;
  background: #fef2f2;
}

.legend-item.peeked {
  border-color: #f59e0b;
  background: #fef3c7;
}

.legend-item.unanswered {
  border-color: #e5e7eb;
  background: #f8f9fa;
}

.text-answer {
  margin: 16px 0;
}

.short-input {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 10px;
}

.fill-input {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 10px;
}

@media (max-width: 992px) {
  .layout {
    grid-template-columns: 1fr 220px;
  }
}

@media (max-width: 768px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    padding-top: 0;
  }
}
</style>
