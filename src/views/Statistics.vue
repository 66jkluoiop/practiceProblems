<template>
    <div class="statistics-page">
        <LoadingSpinner v-if="isLoading" isOverlay />
        <div class="wrapper" :class="{ 'content-loading': isLoading }">
            <!-- 头部 -->
            <div class="header">
                <button class="back-btn" @click="router.push('/')">返回</button>
                <h1 class="title">学习统计</h1>
                <button class="clear-btn" @click="handleClear" v-if="stats.totalQuizzes > 0">
                    清空数据
                </button>
            </div>

            <!-- 空状态 -->
            <div v-if="stats.totalQuizzes === 0" class="empty-state">
                <div class="empty-icon">📊</div>
                <h3>暂无数据</h3>
                <p>开始答题后，这里将显示你的学习统计</p>
            </div>

            <!-- 统计内容 -->
            <div v-else>
                <!-- 总体统计卡片 -->
                <div class="overview-cards">
                    <StatCard icon="📝" :value="stats.totalQuizzes" label="答题次数" />

                    <StatCard icon="📋" :value="stats.totalQuestions" label="总题数" />

                    <StatCard icon="✅" :value="stats.averageAccuracy + '%'" label="平均正确率"
                        :highlight="stats.averageAccuracy > 80" />

                    <StatCard icon="⏱️" :value="formatTime(stats.totalTimeSpent)" label="总用时" />
                </div>

                <!-- 难度统计 -->
                <div class="difficulty-stats">
                    <h2>难度统计</h2>
                    <div class="difficulty-grid">
                        <div class="difficulty-card easy">
                            <div class="difficulty-header">
                                <span class="difficulty-label">简单</span>
                                <span class="difficulty-percentage">{{ difficultyAccuracy.easy }}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" :style="{ width: difficultyAccuracy.easy + '%' }"></div>
                            </div>
                            <div class="difficulty-stats-text">
                                答对 {{ stats.difficultyStats.easy.correct }} / {{ stats.difficultyStats.easy.total }} 题
                            </div>
                        </div>

                        <div class="difficulty-card medium">
                            <div class="difficulty-header">
                                <span class="difficulty-label">中等</span>
                                <span class="difficulty-percentage">{{ difficultyAccuracy.medium }}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" :style="{ width: difficultyAccuracy.medium + '%' }"></div>
                            </div>
                            <div class="difficulty-stats-text">
                                答对 {{ stats.difficultyStats.medium.correct }} / {{ stats.difficultyStats.medium.total }}
                                题
                            </div>
                        </div>

                        <div class="difficulty-card hard">
                            <div class="difficulty-header">
                                <span class="difficulty-label">困难</span>
                                <span class="difficulty-percentage">{{ difficultyAccuracy.hard }}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" :style="{ width: difficultyAccuracy.hard + '%' }"></div>
                            </div>
                            <div class="difficulty-stats-text">
                                答对 {{ stats.difficultyStats.hard.correct }} / {{ stats.difficultyStats.hard.total }} 题
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 答题历史 -->
                <div class="history-section">
                    <h2>最近答题记录</h2>
                    <div v-if="stats.recentHistory.length === 0" class="no-history">
                        暂无历史记录
                    </div>
                    <div v-else class="history-list">
                        <div v-for="record in stats.recentHistory" :key="record.id" class="history-item">
                            <div class="history-header">
                                <div class="history-info">
                                    <span class="history-bank">{{ record.bank }}</span>
                                    <span class="history-mode">{{ record.mode === 'practice' ? '练习模式' : '背题模式' }}</span>
                                </div>
                                <span class="history-date">{{ formatDate(record.date) }}</span>
                            </div>
                            <div class="history-stats">
                                <div class="history-stat">
                                    <span class="stat-label">题数</span>
                                    <span class="stat-value">{{ record.totalQuestions }}</span>
                                </div>
                                <div class="history-stat">
                                    <span class="stat-label">正确</span>
                                    <span class="stat-value correct">{{ record.correctCount }}</span>
                                </div>
                                <div class="history-stat">
                                    <span class="stat-label">错误</span>
                                    <span class="stat-value wrong">{{ record.wrongCount }}</span>
                                </div>
                                <div class="history-stat">
                                    <span class="stat-label">正确率</span>
                                    <span class="stat-value">{{ record.percentage }}%</span>
                                </div>
                                <div class="history-stat">
                                    <span class="stat-label">用时</span>
                                    <span class="stat-value">{{ formatTime(record.timeSpent) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// 学习统计页面组件
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStudyStats } from '@/composables/useStudyStats'
import StatCard from '@/components/StatCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const router = useRouter()
const { stats, difficultyAccuracy, clearStats, formatTime } = useStudyStats()

// 加载状态
const isLoading = ref(true)

// 初始化加载
onMounted(() => {
    // 模拟加载过程
    setTimeout(() => {
        isLoading.value = false
    }, 500)
})

// 格式化日期
const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
        return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
        return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    } else if (days < 7) {
        return `${days}天前`
    } else {
        return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
    }
}

// 清空统计数据
const handleClear = () => {
    if (confirm('确定要清空所有统计数据吗？此操作不可恢复。')) {
        clearStats()
    }
}
</script>

<style scoped>
.statistics-page {
    min-height: 100vh;
    background: #f0f2f5;
    padding: 20px;
}

.wrapper {
    max-width: 1000px;
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

/* 总体统计卡片 */
.overview-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 32px;
}

/* 加载状态 */
.content-loading {
    opacity: 0.6;
    pointer-events: none;
}

/* 难度统计 */
.difficulty-stats {
    background: white;
    border-radius: 16px;
    padding: 28px;
    margin-bottom: 32px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.difficulty-stats h2 {
    font-size: 20px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 24px 0;
}

.difficulty-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}

.difficulty-card {
    padding: 20px;
    border-radius: 12px;
    background: #f8f9fa;
}

.difficulty-card.easy {
    background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
}

.difficulty-card.medium {
    background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
}

.difficulty-card.hard {
    background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
}

.difficulty-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.difficulty-label {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
}

.difficulty-percentage {
    font-size: 24px;
    font-weight: 700;
    color: #1a1a1a;
}

.progress-bar {
    height: 8px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;
}

.progress-fill {
    height: 100%;
    background: #667eea;
    border-radius: 4px;
    transition: width 0.3s;
}

.difficulty-stats-text {
    font-size: 13px;
    color: #666;
}

/* 答题历史 */
.history-section {
    background: white;
    border-radius: 16px;
    padding: 28px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.history-section h2 {
    font-size: 20px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 24px 0;
}

.no-history {
    text-align: center;
    padding: 40px;
    color: #999;
}

.history-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.history-item {
    padding: 20px;
    background: #f8f9fa;
    border-radius: 12px;
    border: 2px solid #e9ecef;
    transition: all 0.2s;
}

.history-item:hover {
    border-color: #667eea;
}

.history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.history-info {
    display: flex;
    gap: 12px;
}

.history-bank {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a1a;
}

.history-mode {
    padding: 4px 12px;
    background: white;
    border-radius: 12px;
    font-size: 12px;
    color: #667eea;
}

.history-date {
    font-size: 13px;
    color: #999;
}

.history-stats {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
}

.history-stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.stat-label {
    font-size: 12px;
    color: #999;
}

.stat-value {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
}

.stat-value.correct {
    color: #28a745;
}

.stat-value.wrong {
    color: #dc3545;
}

/* 响应式 */
@media (max-width: 968px) {
    .overview-cards {
        grid-template-columns: repeat(2, 1fr);
    }

    .difficulty-grid {
        grid-template-columns: 1fr;
    }

    .history-stats {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 640px) {
    .overview-cards {
        grid-template-columns: 1fr;
    }

    .history-stats {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>