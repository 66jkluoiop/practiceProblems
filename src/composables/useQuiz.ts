
import { ref, computed, watch } from 'vue'
import type { Question, UserAnswer, QuizState } from '@/types'

// LocalStorage 键名
const STORAGE_KEY = 'quiz_progress'
const KEY_PRACTICE = 'quiz_progress_practice'
const KEY_MEMORIZE = 'quiz_progress_memorize'
const getKeyForMode = (mode: 'practice' | 'memorize') => (mode === 'memorize' ? KEY_MEMORIZE : KEY_PRACTICE)

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
        const mode: 'practice' | 'memorize' = (state.value.mode as any) === 'memorize' ? 'memorize' : 'practice'
        localStorage.setItem(getKeyForMode(mode), JSON.stringify(state.value))
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
    }
}

// 从 localStorage 恢复进度
const loadProgress = (mode?: 'practice' | 'memorize'): QuizState | null => {
    const key = mode ? getKeyForMode(mode) : STORAGE_KEY
    const saved = localStorage.getItem(key)
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
const clearProgress = (mode?: 'practice' | 'memorize') => {
    if (mode) {
        localStorage.removeItem(getKeyForMode(mode))
    } else {
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(KEY_PRACTICE)
        localStorage.removeItem(KEY_MEMORIZE)
    }
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

    const loadBankQuestions = async (file: string): Promise<Question[]> => {
        const response = await fetch(file + (file.includes('?') ? '&' : '?') + 't=' + Date.now())
        const data = await response.json()
        if (data && Array.isArray((data as any).questions)) {
            const flattened = ((data as any).questions as unknown[]).flat(Infinity)
                .filter((q) => q && typeof q === 'object') as Question[]
            return flattened.map((q) => ({
                ...q,
                bank: (q as any).bank ?? (data as any).bank
            }))
        } else if (Array.isArray(data)) {
            return (data as Question[])
        } else {
            return []
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

    const resumeByMode = (mode: 'practice' | 'memorize') => {
        const saved = loadProgress(mode)
        if (saved && saved.questions && saved.questions.length > 0 && !saved.endTime) {
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

    const hasSavedByMode = (mode: 'practice' | 'memorize') => {
        const saved = loadProgress(mode)
        return !!(saved && saved.questions && saved.questions.length > 0 && !saved.endTime)
    }

    // 提交答案
    const submitAnswer = (answer: number | number[] | string | string[]) => {
        const current = state.value.questions[state.value.currentIndex]
        let isCorrect = false
        if (current.type === 'single' || current.type === 'multiple') {
            isCorrect = Array.isArray(answer)
                ? JSON.stringify((answer as number[]).slice().sort()) === JSON.stringify((current.answer as number[]).slice().sort())
                : answer === current.answer
        } else {
            const norm = (v: unknown) => typeof v === 'string' ? v.trim().toLowerCase() : v
            if (Array.isArray(current.answer)) {
                if (Array.isArray(answer)) {
                    const a = (answer as string[]).map(norm)
                    const b = (current.answer as string[]).map(norm)
                    isCorrect = JSON.stringify(a.slice().sort()) === JSON.stringify(b.slice().sort())
                } else {
                    const a = norm(answer as string)
                    const b = (current.answer as string[]).map(norm)
                    isCorrect = b.includes(a as string)
                }
            } else {
                const a = Array.isArray(answer) ? (answer as string[])[0] : (answer as string)
                isCorrect = norm(a) === norm(current.answer as string)
            }
        }

        state.value.userAnswers.push({
            questionIndex: state.value.currentIndex,
            answer,
            isCorrect
        })
        saveProgress()
    }

    const revealAnswer = () => {
        const current = state.value.questions[state.value.currentIndex]
        state.value.userAnswers.push({
            questionIndex: state.value.currentIndex,
            answer: current.answer as any,
            isCorrect: false,
            peeked: true
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
        const mode: 'practice' | 'memorize' = (state.value.mode as any) === 'memorize' ? 'memorize' : 'practice'
        clearProgress(mode) // 先清除当前模式的保存的进度
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

    const goToQuestion = (index: number) => {
        if (index >= 0 && index < state.value.questions.length) {
            state.value.currentIndex = index
        }
    }

    return {
        state,
        loadQuestions,
        startQuiz,
        resumeQuiz,
        resumeByMode,
        hasSavedProgress,
        hasSavedByMode,
        resetQuiz,
        submitAnswer,
        nextQuestion,
        prevQuestion,
        revealAnswer,
        loadBankQuestions,
        goToQuestion,
        finishQuiz,
        clearProgress,
        currentQuestion,
        progress,
        score
    }
}
