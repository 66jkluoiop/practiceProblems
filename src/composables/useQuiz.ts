
import { ref, computed, watch } from 'vue'
import type { Question, UserAnswer, QuizState } from '@/types'

// LocalStorage 键名
const STORAGE_KEY = 'quiz_progress'

// 全局答题状态
const state = ref<QuizState>({
    questions: [],
    currentIndex: 0,
    userAnswers: [],
    startTime: 0
})

// 保存进度到 localStorage
const saveProgress = () => {
    // 只有在答题进行中才保存（有答案记录或不在第一题）
    const isInProgress = state.value.userAnswers.length > 0 || state.value.currentIndex > 0 || state.value.startTime > 0
    if (state.value.questions.length > 0 && !state.value.endTime && isInProgress) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
    }
}

// 从 localStorage 恢复进度
const loadProgress = (): QuizState | null => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
        try {
            return JSON.parse(saved)
        } catch {
            return null
        }
    }
    return null
}

// 清除保存的进度
const clearProgress = () => {
    localStorage.removeItem(STORAGE_KEY)
}

// 监听状态变化，自动保存
watch(state, () => {
    saveProgress()
}, { deep: true })

export function useQuiz() {
    // 加载题目数据
    const loadQuestions = async () => {
        const response = await fetch('/data/data.json?t=' + Date.now())
        const data = await response.json()
        if (data && Array.isArray((data as any).banks)) {
            const groups = (data as any).banks
            const all: Question[] = []
            for (const g of groups) {
                const list = Array.isArray(g?.questions) ? (g.questions as unknown[]).flat(Infinity) : []
                for (const item of list) {
                    if (item && typeof item === 'object') {
                        all.push({ ...(item as Question), bank: (item as any).bank ?? g.bank })
                    }
                }
            }
            state.value.questions = all
        } else if (data && Array.isArray((data as any).questions)) {
            const flattened = ((data as any).questions as unknown[]).flat(Infinity)
                .filter((q) => q && typeof q === 'object') as Question[]
            state.value.questions = flattened.map((q) => ({
                ...q,
                bank: (q as any).bank ?? (data as any).bank
            }))
        } else if (Array.isArray(data)) {
            state.value.questions = (data as Question[])
        } else {
            state.value.questions = []
        }
    }

    // 开始答题
    const startQuiz = (questions: Question[], mode: 'practice' | 'memorize' = 'practice') => {
        state.value = {
            questions,
            currentIndex: 0,
            userAnswers: [],
            startTime: Date.now(),
            mode
        }
        saveProgress()
    }

    // 恢复答题进度
    const resumeQuiz = () => {
        const saved = loadProgress()
        if (saved) {
            state.value = saved
            return true
        }
        return false
    }

    // 检查是否有保存的进度
    const hasSavedProgress = () => {
        const saved = loadProgress()
        if (!saved || saved.questions.length === 0) {
            return false
        }
        // 如果有 endTime，说明已完成，清除进度
        if (saved.endTime) {
            clearProgress()
            return false
        }
        return true
    }

    // 提交答案
    const submitAnswer = (answer: number | number[]) => {
        const current = state.value.questions[state.value.currentIndex]
        // 判断答案是否正确
        const isCorrect = Array.isArray(answer)
            ? JSON.stringify(answer.sort()) === JSON.stringify((current.answer as number[]).sort())
            : answer === current.answer

        state.value.userAnswers.push({
            questionIndex: state.value.currentIndex,
            answer,
            isCorrect
        })
        saveProgress()
    }

    // 下一题
    const nextQuestion = () => {
        if (state.value.currentIndex < state.value.questions.length - 1) {
            state.value.currentIndex++
            saveProgress()
        }
    }

    // 上一题
    const prevQuestion = () => {
        if (state.value.currentIndex > 0) {
            state.value.currentIndex--
        }
    }

    // 结束答题
    const finishQuiz = () => {
        clearProgress() // 先清除保存的进度
        state.value.endTime = Date.now()
    }

    // 重置答题状态
    const resetQuiz = () => {
        clearProgress()
        state.value = {
            questions: state.value.questions, // 保留题目数据
            currentIndex: 0,
            userAnswers: [],
            startTime: 0
        }
    }

    // 当前题目
    const currentQuestion = computed(() => state.value.questions[state.value.currentIndex])

    // 答题进度
    const progress = computed(() => ({
        current: state.value.currentIndex + 1,
        total: state.value.questions.length
    }))

    // 答题成绩
    const score = computed(() => {
        const correct = state.value.userAnswers.filter((a: UserAnswer) => a.isCorrect).length
        return {
            correct,
            total: state.value.userAnswers.length,
            percentage: state.value.userAnswers.length > 0
                ? Math.round((correct / state.value.userAnswers.length) * 100)
                : 0
        }
    })

    return {
        state,
        loadQuestions,
        startQuiz,
        resumeQuiz,
        hasSavedProgress,
        resetQuiz,
        submitAnswer,
        nextQuestion,
        prevQuestion,
        finishQuiz,
        currentQuestion,
        progress,
        score
    }
}
