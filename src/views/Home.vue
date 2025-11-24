<template>
  <div class="page">
    <LoadingSpinner v-if="isLoading" isOverlay />
    <div class="wrapper" :class="{ 'content-loading': isLoading }">
      <!-- 头部 -->
      <div class="header">
        <div class="header-content">
          <h1 class="title">在线刷题</h1>
          <p class="desc">精选 {{ filteredQuestions.length }} 道题目，助你提升技能</p>
        </div>
        <div class="header-actions">
          <button class="icon-btn" @click="router.push('/wrong-questions')" title="错题本">
            📝 <span class="badge" v-if="wrongQuestions.length > 0">{{ wrongQuestions.length }}</span>
          </button>
          <button class="icon-btn" @click="router.push('/statistics')" title="学习统计">
            📊
          </button>
          <button class="icon-btn" @click="toggleDarkMode" title="切换主题">
            {{ isDark ? '🌙' : '☀️' }}
          </button>
        </div>
      </div>
      <div class="resume-grid" :class="{ two: practiceSaved && memorizeSaved }">
      <!-- 继续练习 -->
      <div v-if="practiceSaved" class="resume-card">
        <div class="resume-left">
          <div>
            <h3>继续练习</h3>
            <p>练习模式进度已保存</p>
            <div class="resume-progress">
              <div class="resume-progress-bar">
                <div class="resume-progress-fill" :style="{ width: practicePercent + '%' }"></div>
              </div>
              <div class="resume-progress-text">已完成 {{ practiceCompleted }} / {{ practiceTotal }}</div>
            </div>
          </div>
        </div>
        <div class="resume-right">
          <button class="text-btn" @click="handleDeleteProgress('practice')">删除</button>
          <button class="solid-btn" @click="handleResume('practice')">继续</button>
        </div>
      </div>

      <!-- 继续背题 -->
      <div v-if="memorizeSaved" class="resume-card">
        <div class="resume-left">
          <div>
            <h3>继续背题</h3>
            <p>背题模式进度已保存</p>
            <div class="resume-progress">
              <div class="resume-progress-bar">
                <div class="resume-progress-fill" :style="{ width: memorizePercent + '%' }"></div>
              </div>
              <div class="resume-progress-text">已背 {{ memorizeIndex }} / {{ memorizeTotal }}</div>
            </div>
          </div>
        </div>
        <div class="resume-right">
          <button class="text-btn" @click="handleDeleteProgress('memorize')">删除</button>
          <button class="solid-btn" @click="handleResume('memorize')">继续</button>
        </div>
      </div>
      </div>

      <!-- 网格布局 -->
      <div class="grid">
        <!-- 题库卡片 -->
        <div class="card">
          <div class="card-title">📚 题库</div>
          <div class="bank-selector">
            <button class="dropdown-trigger" @click="showBankDropdown = !showBankDropdown">
              <span>{{ currentBankName }}</span>
              <span class="icon">{{ showBankDropdown ? '▲' : '▼' }}</span>
            </button>
            <div v-if="showBankDropdown" class="dropdown-menu">
              <div v-for="bank in availableBanks" :key="bank.value" class="menu-item"
                :class="{ selected: selectedBank === bank.value }" @click="selectBank(bank.value)">
                <span>{{ bank.name }}</span>
                <span class="num">{{ bank.count }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 模式卡片 -->
        <div class="card">
          <div class="card-title">⚙️ 模式</div>
          <div class="radio-group">
            <label class="radio-item">
              <input type="radio" value="practice" v-model="quizMode" />
              <span class="radio-label">练习模式</span>
            </label>
            <label class="radio-item">
              <input type="radio" value="memorize" v-model="quizMode" />
              <span class="radio-label">背题模式</span>
            </label>
          </div>
        </div>

        <!-- 难度卡片 -->
        <div class="card">
          <div class="card-title">📊 难度</div>
          <div class="tags">
            <button v-for="diff in difficulties" :key="diff.value"
              :class="['tag', { selected: selectedDifficulty === diff.value }]"
              @click="selectedDifficulty = diff.value">
              {{ diff.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- 开始按钮 -->
      <button class="start-btn" @click="handleStart" :disabled="filteredQuestions.length === 0">
        开始答题 →
      </button>
    </div>
  </div>

  <!-- 删除进度确认对话框 -->
  <ConfirmDialog ref="deleteDialogRef" title="删除进度" message="确定要删除保存的答题进度吗？删除后将无法恢复。" confirm-text="删除" cancel-text="取消"
    @confirm="confirmDelete" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { useQuiz } from '@/composables/useQuiz'
import { useWrongQuestions } from '@/composables/useWrongQuestions'
import { useDarkMode } from '@/composables/useDarkMode'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const router = useRouter()
const { state, loadQuestions, startQuiz, resumeByMode, clearProgress } = useQuiz()
const { wrongQuestions } = useWrongQuestions()
const { isDark, toggleDarkMode } = useDarkMode()

// 加载状态
const isLoading = ref(true)

// 删除对话框引用
const deleteDialogRef = ref<InstanceType<typeof ConfirmDialog> | null>(null)

// 是否有保存的进度
const practiceSaved = ref(false)
const memorizeSaved = ref(false)
const practiceCompleted = ref(0)
const practiceTotal = ref(0)
const practicePercent = computed(() => practiceTotal.value > 0 ? Math.round((practiceCompleted.value / practiceTotal.value) * 100) : 0)
const memorizeIndex = ref(0)
const memorizeTotal = ref(0)
const memorizePercent = computed(() => memorizeTotal.value > 0 ? Math.round((memorizeIndex.value / memorizeTotal.value) * 100) : 0)

// 当前状态统计（备用，可能未用）
// const completedCount = computed(() => state.value.userAnswers.length)
// const totalCount = computed(() => state.value.questions.length)

// 题库选择
const selectedBank = ref('')
const showBankDropdown = ref(false)

// 答题模式
const quizMode = ref<'practice' | 'memorize'>('practice')

// 筛选条件
const selectedDifficulty = ref('all')

// 难度选项
const difficulties = [
  { value: 'all', label: '全部' },
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' }
]

// 获取所有题库列表
const availableBanks = computed(() => {
  const banks = new Set(state.value.questions.map(q => q.bank || '未分类'))
  return Array.from(banks).map(bank => ({
    value: bank,
    name: bank,
    icon: bank === '测试题' ? '📝' : '📚',
    count: state.value.questions.filter(q => (q.bank || '未分类') === bank).length
  }))
})

// 当前选中的题库名称
const currentBankName = computed(() => {
  if (!selectedBank.value) {
    return '选择题库'
  }
  const bank = availableBanks.value.find(b => b.value === selectedBank.value)
  return bank ? `${bank.icon} ${bank.name} (${bank.count}题)` : '选择题库'
})

// 根据题库和筛选条件过滤题目
const filteredQuestions = computed(() => {
  return state.value.questions.filter(q => {
    // 题库筛选
    const bankMatch = !selectedBank.value || (q.bank || '未分类') === selectedBank.value
    // 难度筛选
    const difficultyMatch = selectedDifficulty.value === 'all' || q.difficulty === selectedDifficulty.value
    return bankMatch && difficultyMatch
  })
})

// 选择题库
const selectBank = (bank: string) => {
  selectedBank.value = bank
  showBankDropdown.value = false
}

// 开始答题
const handleStart = () => {
  if (filteredQuestions.value.length > 0) {
    startQuiz(filteredQuestions.value, quizMode.value)
    router.push('/quiz')
  }
}

// 继续答题
const handleResume = (mode: 'practice' | 'memorize') => {
  resumeByMode(mode)
  router.push('/quiz')
}

// 显示删除确认对话框
const pendingDeleteMode = ref<'practice' | 'memorize' | null>(null)
const handleDeleteProgress = (mode: 'practice' | 'memorize') => {
  pendingDeleteMode.value = mode
  deleteDialogRef.value?.show()
}

// 确认删除进度
const confirmDelete = () => {
  if (pendingDeleteMode.value) {
    clearProgress(pendingDeleteMode.value)
    if (pendingDeleteMode.value === 'practice') {
      practiceSaved.value = false
      practiceCompleted.value = 0
      practiceTotal.value = 0
    } else {
      memorizeSaved.value = false
      memorizeIndex.value = 0
      memorizeTotal.value = 0
    }
    pendingDeleteMode.value = null
  }
}

// 加载题目数据
onMounted(async () => {
  isLoading.value = true
  try {
    await loadQuestions()
    // 默认选择第一个题库
    if (availableBanks.value.length > 0) {
      selectedBank.value = availableBanks.value[0].value
    }
    // 检查是否有保存的进度
    checkSavedProgress()
  } catch (error) {
    console.error('加载题目失败:', error)
  } finally {
    isLoading.value = false
  }
})

// 检查保存的进度（每次进入页面都检查）
const checkSavedProgress = () => {
  // 分别检查两种模式
  const rawPractice = localStorage.getItem('quiz_progress_practice')
  const rawMemorize = localStorage.getItem('quiz_progress_memorize')
  practiceSaved.value = false
  memorizeSaved.value = false
  try {
    if (rawPractice) {
      const data = JSON.parse(rawPractice)
      if (!data.endTime && Array.isArray(data.questions)) {
        practiceSaved.value = data.questions.length > 0
        practiceCompleted.value = Array.isArray(data.userAnswers) ? data.userAnswers.length : 0
        practiceTotal.value = data.questions.length
      }
    }
  } catch {}
  try {
    if (rawMemorize) {
      const data = JSON.parse(rawMemorize)
      if (!data.endTime && Array.isArray(data.questions)) {
        memorizeSaved.value = data.questions.length > 0
        memorizeIndex.value = typeof data.currentIndex === 'number' ? data.currentIndex : 0
        memorizeTotal.value = data.questions.length
      }
    }
  } catch {}
}

// 监听路由变化，返回首页时重新检查
onActivated(() => {
  checkSavedProgress()
})
</script>

<style scoped>
.resume-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.resume-grid.two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.resume-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.resume-right {
  display: flex;
  gap: 8px;
}
.resume-progress {
  margin-top: 8px;
}
.resume-progress-bar {
  width: 240px;
  height: 8px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
}
.resume-progress-fill {
  height: 100%;
  background: #111827;
}
.resume-progress-text {
  margin-top: 6px;
  font-size: 13px;
  color: #374151;
}
.page {
  min-height: 100vh;
  background: #f0f2f5;
  padding: 60px 20px;
}

.wrapper {
  max-width: 1000px;
  margin: 0 auto;
}

/* 头部 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48px;
}

.header-content {
  text-align: center;
  flex: 1;
}

.title {
  font-size: 42px;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.desc {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.icon-btn {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.icon-btn .badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dc3545;
  color: white;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  padding: 0 6px;
}

/* 继续答题卡片 */
.resume-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #1f2937;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.resume-left {
  display: flex;
  align-items: center;
  gap: 16px;
}


.resume-left h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.resume-left p {
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
}

.resume-right {
  display: flex;
  gap: 12px;
}

/* 网格布局 */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

/* 卡片 */
.card {
  background: white;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 20px;
}

/* 题库选择 */
.bank-selector {
  position: relative;
}

.dropdown-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}

.dropdown-trigger:hover {
  border-color: #667eea;
  background: white;
}

.icon {
  font-size: 10px;
  color: #999;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.menu-item:hover {
  background: #f8f9fa;
}

.menu-item.selected {
  background: #667eea;
  color: white;
}

.num {
  padding: 2px 8px;
  background: #e9ecef;
  color: #666;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.menu-item.selected .num {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* 单选按钮组 */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.radio-item:hover {
  border-color: #667eea;
  background: white;
}

.radio-item input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #667eea;
}

.radio-label {
  font-size: 14px;
  color: #333;
  cursor: pointer;
}

/* 标签组 */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag {
  padding: 8px 16px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.tag:hover {
  border-color: #667eea;
  background: white;
}

.tag.selected {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* 开始按钮 */
.start-btn {
  display: block;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 16px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
}

.start-btn:disabled {
  background: #e0e0e0;
  color: #999;
  cursor: not-allowed;
  box-shadow: none;
}

.solid-btn {
  padding: 10px 20px;
  background: white;
  color: #1f2937;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.solid-btn:hover {
  background: #f8f9fa;
}

.text-btn {
  padding: 10px 20px;
  background: transparent;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.text-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

/* 加载状态 */
.content-loading {
  opacity: 0.6;
  pointer-events: none;
}

/* 响应式 */
@media (max-width: 768px) {
  .page {
    padding: 40px 16px;
  }

  .title {
    font-size: 32px;
  }

  .grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .card {
    padding: 24px;
  }

  .resume-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  .resume-grid.two {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .resume-right {
    width: 100%;
    justify-content: flex-end;
  }

  .start-btn {
    width: 100%;
    max-width: none;
  }
}
</style>
