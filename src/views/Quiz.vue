<template>
  <div class="quiz" v-if="currentQuestion" ref="quizContainer">
    <LoadingSpinner v-if="isLoading" isOverlay />
    <header class="quiz-header">
      <button class="back-btn" @click="showConfirmDialog">← 返回</button>
      <div class="mode-badge" :class="`mode-${state.mode}`">
        {{ state.mode === 'memorize' ? '📝 背题模式' : '✏️ 练习模式' }}
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
      <span class="progress-text">{{ progress.current }} / {{ progress.total }}</span>
    </header>

    <div class="container">
      <div class="question-card">
        <div class="question-meta">
          <span class="tag" :class="`tag-${currentQuestion.category}`">
            {{ currentQuestion.category }}
          </span>
          <span class="tag" :class="`tag-${currentQuestion.difficulty}`">
            {{ difficultyMap[currentQuestion.difficulty] }}
          </span>
          <span class="type">{{ currentQuestion.type === 'single' ? '单选' : '多选' }}</span>
        </div>

        <h2 class="question-title">{{ currentQuestion.question }}</h2>

        <div class="options">
          <QuestionOption v-for="(option, index) in currentQuestion.options" :key="index" :index="index" :text="option"
            :type="currentQuestion.type" :isSelected="isSelected(index)" :isCorrect="isCorrectOption(index)"
            :showResult="showResult || isMemorizeMode" :disabled="showResult || isMemorizeMode"
            @select="handleOptionSelect(index)" />
        </div>

        <div class="actions">
          <button class="btn btn-secondary" @click="handlePrev" :disabled="isFirstQuestion">
            ← 上一题
          </button>

          <template v-if="isMemorizeMode">
            <!-- 背题模式：直接显示下一题按钮 -->
            <button class="btn btn-primary" @click="handleNext">
              {{ isLastQuestion ? '查看结果' : '下一题 →' }}
            </button>
          </template>

          <template v-else-if="!showResult">
            <!-- 练习模式：未提交时显示提交和跳过 -->
            <button class="btn btn-primary" @click="handleSubmit" :disabled="!hasAnswer">
              提交答案
            </button>
            <button class="btn btn-secondary" @click="handleSkip" :disabled="isLastQuestion">
              跳过 →
            </button>
          </template>

          <button v-else class="btn btn-primary" @click="handleNext">
            {{ isLastQuestion ? '查看结果' : '下一题 →' }}
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
        </div>
      </div>
    </div>
  </div>

  <!-- 自定义确认对话框 -->
  <ConfirmDialog ref="confirmDialogRef" title="退出答题" message="确定要退出答题吗？当前进度已自动保存，下次可以继续。" confirm-text="退出"
    cancel-text="继续答题" @confirm="handleBack" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuiz } from '@/composables/useQuiz'
import { useSwipe } from '@/composables/useSwipe'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import QuestionOption from '@/components/QuestionOption.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const router = useRouter()
const { currentQuestion, progress, submitAnswer, nextQuestion, prevQuestion, finishQuiz, state } = useQuiz()

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
const selectedAnswer = ref<number | null>(null) // 单选答案
const selectedAnswers = ref<number[]>([]) // 多选答案
const showResult = ref(false) // 是否显示答案解析
const isAnswerCorrect = ref(false) // 答案是否正确
const isLoading = ref(false) // 加载状态

// 难度映射
const difficultyMap = {
  easy: '简单',
  medium: '中等',
  hard: '困难'
}

// 进度百分比
const progressPercent = computed(() => (progress.value.current / progress.value.total) * 100)

// 是否为第一题
const isFirstQuestion = computed(() => state.value.currentIndex === 0)

// 是否为最后一题
const isLastQuestion = computed(() => progress.value.current === progress.value.total)

// 是否为背题模式
const isMemorizeMode = computed(() => state.value.mode === 'memorize')

// 是否已选择答案
const hasAnswer = computed(() => {
  return currentQuestion.value?.type === 'single'
    ? selectedAnswer.value !== null
    : selectedAnswers.value.length > 0
})

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
  return Array.isArray(answer) ? answer.includes(index) : answer === index
}

// 提交答案
const handleSubmit = () => {
  const answer = currentQuestion.value?.type === 'single'
    ? selectedAnswer.value!
    : selectedAnswers.value

  submitAnswer(answer)

  // 判断答案是否正确
  const correctAnswer = currentQuestion.value?.answer
  isAnswerCorrect.value = Array.isArray(answer)
    ? JSON.stringify(answer.sort()) === JSON.stringify((correctAnswer as number[]).sort())
    : answer === correctAnswer

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
  showResult.value = false
}

// 加载当前答案
const loadCurrentAnswer = () => {
  isLoading.value = true

  setTimeout(() => {
    const currentIndex = state.value.currentIndex
    const userAnswer = state.value.userAnswers.find(a => a.questionIndex === currentIndex)

    if (userAnswer) {
      // 显示之前答案
      if (Array.isArray(userAnswer.answer)) {
        selectedAnswers.value = [...userAnswer.answer]
      } else {
        selectedAnswer.value = userAnswer.answer
      }
      showResult.value = true
      isAnswerCorrect.value = userAnswer.isCorrect
    } else if (isMemorizeMode.value && currentQuestion.value) {
      // 背题模式自动选中正确答案
      const correctAnswer = currentQuestion.value.answer
      if (Array.isArray(correctAnswer)) {
        selectedAnswers.value = [...correctAnswer]
      } else {
        selectedAnswer.value = correctAnswer
      }
    } else {
      // 重置答案
      selectedAnswer.value = null
      selectedAnswers.value = []
      showResult.value = false
    }

    isLoading.value = false
  }, 300) // 模拟加载时间
}

// 显示确认对话框
const showConfirmDialog = () => {
  confirmDialogRef.value?.show()
}

// 返回首页
const handleBack = () => {
  router.push('/')
}
</script>