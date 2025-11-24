<template>
    <div class="wrong-questions-page">
        <LoadingSpinner v-if="isLoading" isOverlay />
        <div class="wrapper" :class="{ 'content-loading': isLoading }">
            <!-- 头部 -->
            <div class="header">
                <button class="back-btn" @click="router.push('/')">← 返回</button>
                <h1 class="title">错题本</h1>
                <button class="clear-btn" @click="handleClear" v-if="wrongQuestions.length > 0">
                    清空
                </button>
            </div>

            <!-- 空状态 -->
            <div v-if="wrongQuestions.length === 0" class="empty-state">
                <div class="empty-icon">📝</div>
                <h3>暂无错题</h3>
                <p>继续努力，保持全对！</p>
            </div>

            <!-- 统计卡片 -->
            <div v-else class="stats-cards">
                <div class="stat-card">
                    <div class="stat-value">{{ wrongQuestions.length }}</div>
                    <div class="stat-label">错题总数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">{{ unreviewedQuestions.length }}</div>
                    <div class="stat-label">待复习</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">{{ questionsByDifficulty.hard.length }}</div>
                    <div class="stat-label">困难题</div>
                </div>
            </div>

            <!-- 筛选按钮 -->
            <div v-if="wrongQuestions.length > 0" class="filter-bar">
                <button :class="['filter-btn', { active: filterMode === 'all' }]" @click="filterMode = 'all'">
                    全部 ({{ wrongQuestions.length }})
                </button>
                <button :class="['filter-btn', { active: filterMode === 'unreviewed' }]"
                    @click="filterMode = 'unreviewed'">
                    待复习 ({{ unreviewedQuestions.length }})
                </button>
                <button :class="['filter-btn', { active: filterMode === 'easy' }]" @click="filterMode = 'easy'">
                    简单
                </button>
                <button :class="['filter-btn', { active: filterMode === 'medium' }]" @click="filterMode = 'medium'">
                    中等
                </button>
                <button :class="['filter-btn', { active: filterMode === 'hard' }]" @click="filterMode = 'hard'">
                    困难
                </button>
            </div>

            <!-- 错题列表 -->
            <div v-if="filteredWrongQuestions.length > 0" class="questions-list">
                <WrongQuestionCard v-for="wq in filteredWrongQuestions" :key="wq.id" :question="wq"
                    @delete="removeWrongQuestion" @review="markAsReviewed" />
            </div>

            <!-- 开始练习按钮 -->
            <div v-if="filteredWrongQuestions.length > 0" class="action-bar">
                <button class="practice-btn" @click="handlePractice">
                    开始练习错题 ({{ filteredWrongQuestions.length }} 题)
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// 错题本页面组件
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWrongQuestions } from '@/composables/useWrongQuestions'
import { useQuiz } from '@/composables/useQuiz'
import WrongQuestionCard from '@/components/WrongQuestionCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const router = useRouter()
const {
    wrongQuestions,
    unreviewedQuestions,
    questionsByDifficulty,
    markAsReviewed,
    removeWrongQuestion,
    clearWrongQuestions
} = useWrongQuestions()

// 加载状态
const isLoading = ref(true)

const { startQuiz } = useQuiz()

// 筛选模式
const filterMode = ref<'all' | 'unreviewed' | 'easy' | 'medium' | 'hard'>('all')


// 筛选后的错题列表
const filteredWrongQuestions = computed(() => {
    switch (filterMode.value) {
        case 'unreviewed':
            return unreviewedQuestions.value
        case 'easy':
            return questionsByDifficulty.value.easy
        case 'medium':
            return questionsByDifficulty.value.medium
        case 'hard':
            return questionsByDifficulty.value.hard
        default:
            return wrongQuestions.value
    }
})


// 清空错题本
const handleClear = () => {
    if (confirm('确定要清空所有错题吗？此操作不可恢复。')) {
        clearWrongQuestions()
    }
}

// 开始练习错题
const handlePractice = () => {
    const questions = filteredWrongQuestions.value.map(wq => wq.question)
    startQuiz(questions, 'practice')
    router.push('/quiz')
}

// 初始化加载
onMounted(() => {
    // 模拟加载过程
    setTimeout(() => {
        isLoading.value = false
    }, 500)
})
</script>

<style scoped>
.wrong-questions-page {
    min-height: 100vh;
    background: #f0f2f5;
    padding: 20px;
}

.wrapper {
    max-width: 900px;
    margin: 0 auto;
}

/* 头部 */
.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
}

.back-btn,
.clear-btn {
    padding: 8px 16px;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
}

.back-btn:hover,
.clear-btn:hover {
    border-color: #667eea;
}

.clear-btn {
    color: #dc3545;
}

.title {
    font-size: 28px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
}

/* 空状态 */
.empty-state {
    text-align: center;
    padding: 80px 20px;
}

.empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
}

.empty-state h3 {
    font-size: 20px;
    color: #1a1a1a;
    margin-bottom: 8px;
}

.empty-state p {
    color: #666;
    margin: 0;
}

/* 统计卡片 */
.stats-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 24px;
}

.stat-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.stat-value {
    font-size: 32px;
    font-weight: 700;
    color: #667eea;
    margin-bottom: 8px;
}

.stat-label {
    font-size: 14px;
    color: #666;
}

/* 筛选栏 */
.filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
}

.filter-btn {
    padding: 8px 16px;
    background: white;
    border: 2px solid #e9ecef;
    border-radius: 20px;
    font-size: 14px;
    color: #666;
    cursor: pointer;
    transition: all 0.2s;
}

.filter-btn:hover {
    border-color: #667eea;
}

.filter-btn.active {
    background: #667eea;
    color: white;
    border-color: #667eea;
}

/* 错题列表 */
.questions-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 24px;
}

/* 加载状态 */
.content-loading {
    opacity: 0.6;
    pointer-events: none;
}

/* 操作栏 */
.action-bar {
    text-align: center;
}

.practice-btn {
    padding: 14px 48px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.practice-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

/* 响应式 */
@media (max-width: 768px) {
    .stats-cards {
        grid-template-columns: 1fr;
    }

    .header {
        flex-wrap: wrap;
        gap: 12px;
    }

    .title {
        width: 100%;
        text-align: center;
    }
}
</style>