import { ref, computed } from 'vue'
import type { StudyStats, QuizHistory, Question, UserAnswer } from '@/types'

const STORAGE_KEY = 'study_stats'
const HISTORY_KEY = 'quiz_history'

// 全局统计数据
const stats = ref<StudyStats>({
    totalQuizzes: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    totalWrong: 0,
    averageAccuracy: 0,
    totalTimeSpent: 0,
    difficultyStats: {
        easy: { total: 0, correct: 0 },
        medium: { total: 0, correct: 0 },
        hard: { total: 0, correct: 0 }
    },
    recentHistory: []
})

// 从 localStorage 加载统计数据
const loadStats = () => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
        try {
            stats.value = JSON.parse(saved)
        } catch {
            // 保持默认值
        }
    }
}

// 保存统计数据
const saveStats = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats.value))
}

// 从 localStorage 加载历史记录
const loadHistory = (): QuizHistory[] => {
    const saved = localStorage.getItem(HISTORY_KEY)
    if (saved) {
        try {
            return JSON.parse(saved)
        } catch {
            return []
        }
    }
    return []
}

// 保存历史记录
const saveHistory = (history: QuizHistory[]) => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function useStudyStats() {
    // 初始化加载
    if (stats.value.totalQuizzes === 0) {
        loadStats()
    }

    // 记录一次答题
    const recordQuiz = (
        questions: Question[],
        userAnswers: UserAnswer[],
        mode: 'practice' | 'memorize',
        bank: string,
        timeSpent: number
    ) => {
        const correctCount = userAnswers.filter(a => a.isCorrect).length
        const wrongCount = userAnswers.length - correctCount
        const percentage = userAnswers.length > 0
            ? Math.round((correctCount / userAnswers.length) * 100)
            : 0

        // 创建历史记录
        const history: QuizHistory = {
            id: `quiz_${Date.now()}`,
            date: Date.now(),
            mode,
            bank,
            totalQuestions: userAnswers.length,
            correctCount,
            wrongCount,
            percentage,
            timeSpent
        }

        // 更新总体统计
        stats.value.totalQuizzes++
        stats.value.totalQuestions += userAnswers.length
        stats.value.totalCorrect += correctCount
        stats.value.totalWrong += wrongCount
        stats.value.totalTimeSpent += timeSpent
        stats.value.averageAccuracy = stats.value.totalQuestions > 0
            ? Math.round((stats.value.totalCorrect / stats.value.totalQuestions) * 100)
            : 0

        // 更新难度统计
        userAnswers.forEach(answer => {
            const question = questions[answer.questionIndex]
            const difficulty = question.difficulty
            stats.value.difficultyStats[difficulty].total++
            if (answer.isCorrect) {
                stats.value.difficultyStats[difficulty].correct++
            }
        })

        // 添加到历史记录（保留最近30条）
        const allHistory = loadHistory()
        allHistory.unshift(history)
        if (allHistory.length > 30) {
            allHistory.splice(30)
        }
        stats.value.recentHistory = allHistory.slice(0, 10) // 只在内存中保留最近10条
        saveHistory(allHistory)

        // 保存统计数据
        saveStats()
    }

    // 清空所有统计数据
    const clearStats = () => {
        stats.value = {
            totalQuizzes: 0,
            totalQuestions: 0,
            totalCorrect: 0,
            totalWrong: 0,
            averageAccuracy: 0,
            totalTimeSpent: 0,
            difficultyStats: {
                easy: { total: 0, correct: 0 },
                medium: { total: 0, correct: 0 },
                hard: { total: 0, correct: 0 }
            },
            recentHistory: []
        }
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(HISTORY_KEY)
    }

    // 获取完整历史记录
    const getFullHistory = (): QuizHistory[] => {
        return loadHistory()
    }

    // 计算难度正确率
    const difficultyAccuracy = computed(() => {
        return {
            easy: stats.value.difficultyStats.easy.total > 0
                ? Math.round((stats.value.difficultyStats.easy.correct / stats.value.difficultyStats.easy.total) * 100)
                : 0,
            medium: stats.value.difficultyStats.medium.total > 0
                ? Math.round((stats.value.difficultyStats.medium.correct / stats.value.difficultyStats.medium.total) * 100)
                : 0,
            hard: stats.value.difficultyStats.hard.total > 0
                ? Math.round((stats.value.difficultyStats.hard.correct / stats.value.difficultyStats.hard.total) * 100)
                : 0
        }
    })

    // 格式化时间
    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60

        if (hours > 0) {
            return `${hours}小时${minutes}分钟`
        } else if (minutes > 0) {
            return `${minutes}分钟${secs}秒`
        } else {
            return `${secs}秒`
        }
    }

    return {
        stats,
        difficultyAccuracy,
        recordQuiz,
        clearStats,
        getFullHistory,
        formatTime
    }
}
