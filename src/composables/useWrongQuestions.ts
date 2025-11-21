import { ref, computed } from 'vue'
import type { Question, WrongQuestion } from '@/types'

const STORAGE_KEY = 'wrong_questions'

// 全局错题本数据
const wrongQuestions = ref<WrongQuestion[]>([])

// 从 localStorage 加载错题
const loadWrongQuestions = () => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
        try {
            wrongQuestions.value = JSON.parse(saved)
        } catch {
            wrongQuestions.value = []
        }
    }
}

// 保存错题到 localStorage
const saveWrongQuestions = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wrongQuestions.value))
}

// 生成题目唯一ID
const generateQuestionId = (question: Question): string => {
    return `${question.bank || 'default'}_${question.category}_${question.question.substring(0, 20)}`
}

export function useWrongQuestions() {
    // 初始化加载
    if (wrongQuestions.value.length === 0) {
        loadWrongQuestions()
    }

    // 添加错题
    const addWrongQuestion = (question: Question, userAnswer: number | number[]) => {
        const id = generateQuestionId(question)
        const existingIndex = wrongQuestions.value.findIndex(wq => wq.id === id)

        if (existingIndex >= 0) {
            // 已存在，更新错误次数和时间
            wrongQuestions.value[existingIndex].wrongCount++
            wrongQuestions.value[existingIndex].lastWrongTime = Date.now()
            wrongQuestions.value[existingIndex].userAnswer = userAnswer
            wrongQuestions.value[existingIndex].isReviewed = false
        } else {
            // 新增错题
            wrongQuestions.value.push({
                id,
                question,
                userAnswer,
                wrongCount: 1,
                lastWrongTime: Date.now(),
                isReviewed: false
            })
        }
        saveWrongQuestions()
    }

    // 标记为已复习
    const markAsReviewed = (id: string) => {
        const question = wrongQuestions.value.find(wq => wq.id === id)
        if (question) {
            question.isReviewed = true
            saveWrongQuestions()
        }
    }

    // 删除错题
    const removeWrongQuestion = (id: string) => {
        wrongQuestions.value = wrongQuestions.value.filter(wq => wq.id !== id)
        saveWrongQuestions()
    }

    // 清空错题本
    const clearWrongQuestions = () => {
        wrongQuestions.value = []
        localStorage.removeItem(STORAGE_KEY)
    }

    // 获取未复习的错题
    const unreviewedQuestions = computed(() => {
        return wrongQuestions.value.filter(wq => !wq.isReviewed)
    })

    // 按难度分组
    const questionsByDifficulty = computed(() => {
        return {
            easy: wrongQuestions.value.filter(wq => wq.question.difficulty === 'easy'),
            medium: wrongQuestions.value.filter(wq => wq.question.difficulty === 'medium'),
            hard: wrongQuestions.value.filter(wq => wq.question.difficulty === 'hard')
        }
    })

    // 按题库分组
    const questionsByBank = computed(() => {
        const grouped: Record<string, WrongQuestion[]> = {}
        wrongQuestions.value.forEach(wq => {
            const bank = wq.question.bank || '未分类'
            if (!grouped[bank]) {
                grouped[bank] = []
            }
            grouped[bank].push(wq)
        })
        return grouped
    })

    return {
        wrongQuestions,
        unreviewedQuestions,
        questionsByDifficulty,
        questionsByBank,
        addWrongQuestion,
        markAsReviewed,
        removeWrongQuestion,
        clearWrongQuestions
    }
}
