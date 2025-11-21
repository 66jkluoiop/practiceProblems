<<<<<<< HEAD
<template>
  <div class="result">
    <div class="container">
      <div class="result-card">
        <h1>答题完成</h1>

        <div class="score-display">
          <div class="score-circle">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" class="circle-bg" />
              <circle cx="50" cy="50" r="45" class="circle-progress" :style="{ strokeDashoffset: circleOffset }" />
            </svg>
            <div class="score-text">
              <div class="percentage">{{ score.percentage }}%</div>
              <div class="label">正确率</div>
            </div>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ score.correct }}</div>
            <div class="stat-label">答对</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ score.total - score.correct }}</div>
            <div class="stat-label">答错</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ score.total }}</div>
            <div class="stat-label">总题数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ timeSpent }}</div>
            <div class="stat-label">用时</div>
          </div>
        </div>

        <div class="wrong-questions" v-if="wrongQuestions.length > 0">
          <h3>错题回顾</h3>
          <div class="wrong-list">
            <div v-for="(item, index) in wrongQuestions" :key="index" class="wrong-item">
              <div class="wrong-header">
                <span class="wrong-number">第 {{ item.questionIndex + 1 }} 题</span>
                <span class="tag" :class="`tag-${item.question.category}`">
                  {{ item.question.category }}
                </span>
              </div>
              <div class="wrong-question">{{ item.question.question }}</div>
              <div class="wrong-answer">
                <span class="label">你的答案：</span>
                <span class="value wrong">{{ formatAnswer(item.userAnswer, item.question.options) }}</span>
              </div>
              <div class="correct-answer">
                <span class="label">正确答案：</span>
                <span class="value correct">{{ formatAnswer(item.question.answer, item.question.options) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="actions">
          <button class="btn btn-secondary" @click="router.push('/')">返回首页</button>
          <button class="btn btn-primary" @click="handleRetry">再来一次</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuiz } from '@/composables/useQuiz'
import { useWrongQuestions } from '@/composables/useWrongQuestions'
import { useStudyStats } from '@/composables/useStudyStats'

const router = useRouter()
const { state, score, startQuiz } = useQuiz()
const { addWrongQuestion } = useWrongQuestions()
const { recordQuiz } = useStudyStats()

// 进入结果页面时清除保存的进度并记录数据
onMounted(() => {
  // 保存错题
  state.value.userAnswers.forEach(answer => {
    if (!answer.isCorrect) {
      const question = state.value.questions[answer.questionIndex]
      addWrongQuestion(question, answer.answer)
    }
  })

  // 记录统计数据
  const timeSpent = state.value.endTime && state.value.startTime
    ? Math.floor((state.value.endTime - state.value.startTime) / 1000)
    : 0

  recordQuiz(
    state.value.questions,
    state.value.userAnswers,
    state.value.mode || 'practice',
    state.value.questions[0]?.bank || '未分类',
    timeSpent
  )

  // 清除 localStorage 中的进度
  localStorage.removeItem('quiz_progress')
})

// 计算圆形进度条的偏移量
const circleOffset = computed(() => {
  const circumference = 2 * Math.PI * 45 // 圆周长
  return circumference - (score.value.percentage / 100) * circumference
})

// 计算答题用时
const timeSpent = computed(() => {
  if (!state.value.endTime) return '0秒'
  const seconds = Math.floor((state.value.endTime - state.value.startTime) / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return minutes > 0 ? `${minutes}分${remainingSeconds}秒` : `${seconds}秒`
})

// 获取错题列表
const wrongQuestions = computed(() => {
  return state.value.userAnswers
    .filter(a => !a.isCorrect)
    .map(a => ({
      questionIndex: a.questionIndex,
      question: state.value.questions[a.questionIndex],
      userAnswer: a.answer
    }))
})

// 格式化答案显示
const formatAnswer = (answer: number | number[], options: string[]) => {
  if (Array.isArray(answer)) {
    return answer.map(i => `${String.fromCharCode(65 + i)}. ${options[i]}`).join(', ')
  }
  return `${String.fromCharCode(65 + answer)}. ${options[answer]}`
}

// 重新开始答题
const handleRetry = () => {
  startQuiz(state.value.questions)
  router.push('/quiz')
}
</script>
=======
<template>
  <div class="result">
    <div class="container">
      <div class="result-card">
        <h1>答题完成</h1>

        <div class="score-display">
          <div class="score-circle">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" class="circle-bg" />
              <circle cx="50" cy="50" r="45" class="circle-progress" :style="{ strokeDashoffset: circleOffset }" />
            </svg>
            <div class="score-text">
              <div class="percentage">{{ score.percentage }}%</div>
              <div class="label">正确率</div>
            </div>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ score.correct }}</div>
            <div class="stat-label">答对</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ score.total - score.correct }}</div>
            <div class="stat-label">答错</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ score.total }}</div>
            <div class="stat-label">总题数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ timeSpent }}</div>
            <div class="stat-label">用时</div>
          </div>
        </div>

        <div class="wrong-questions" v-if="wrongQuestions.length > 0">
          <h3>错题回顾</h3>
          <div class="wrong-list">
            <div v-for="(item, index) in wrongQuestions" :key="index" class="wrong-item">
              <div class="wrong-header">
                <span class="wrong-number">第 {{ item.questionIndex + 1 }} 题</span>
                <span class="tag" :class="`tag-${item.question.category}`">
                  {{ item.question.category }}
                </span>
              </div>
              <div class="wrong-question">{{ item.question.question }}</div>
              <div class="wrong-answer">
                <span class="label">你的答案：</span>
                <span class="value wrong">{{ formatAnswer(item.userAnswer, item.question.options) }}</span>
              </div>
              <div class="correct-answer">
                <span class="label">正确答案：</span>
                <span class="value correct">{{ formatAnswer(item.question.answer, item.question.options) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="actions">
          <button class="btn btn-secondary" @click="router.push('/')">返回首页</button>
          <button class="btn btn-primary" @click="handleRetry">再来一次</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuiz } from '@/composables/useQuiz'
import { useWrongQuestions } from '@/composables/useWrongQuestions'
import { useStudyStats } from '@/composables/useStudyStats'

const router = useRouter()
const { state, score, startQuiz } = useQuiz()
const { addWrongQuestion } = useWrongQuestions()
const { recordQuiz } = useStudyStats()

// 进入结果页面时清除保存的进度并记录数据
onMounted(() => {
  // 保存错题
  state.value.userAnswers.forEach(answer => {
    if (!answer.isCorrect) {
      const question = state.value.questions[answer.questionIndex]
      addWrongQuestion(question, answer.answer)
    }
  })

  // 记录统计数据
  const timeSpent = state.value.endTime && state.value.startTime
    ? Math.floor((state.value.endTime - state.value.startTime) / 1000)
    : 0

  recordQuiz(
    state.value.questions,
    state.value.userAnswers,
    state.value.mode || 'practice',
    state.value.questions[0]?.bank || '未分类',
    timeSpent
  )

  // 清除 localStorage 中的进度
  localStorage.removeItem('quiz_progress')
})

// 计算圆形进度条的偏移量
const circleOffset = computed(() => {
  const circumference = 2 * Math.PI * 45 // 圆周长
  return circumference - (score.value.percentage / 100) * circumference
})

// 计算答题用时
const timeSpent = computed(() => {
  if (!state.value.endTime) return '0秒'
  const seconds = Math.floor((state.value.endTime - state.value.startTime) / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return minutes > 0 ? `${minutes}分${remainingSeconds}秒` : `${seconds}秒`
})

// 获取错题列表
const wrongQuestions = computed(() => {
  return state.value.userAnswers
    .filter(a => !a.isCorrect)
    .map(a => ({
      questionIndex: a.questionIndex,
      question: state.value.questions[a.questionIndex],
      userAnswer: a.answer
    }))
})

// 格式化答案显示
const formatAnswer = (answer: number | number[], options: string[]) => {
  if (Array.isArray(answer)) {
    return answer.map(i => `${String.fromCharCode(65 + i)}. ${options[i]}`).join(', ')
  }
  return `${String.fromCharCode(65 + answer)}. ${options[answer]}`
}

// 重新开始答题
const handleRetry = () => {
  startQuiz(state.value.questions)
  router.push('/quiz')
}
</script>
>>>>>>> f465a0dd86651586e2c3629377edbabf79b9810b
