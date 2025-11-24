
export interface Question {
    bank?: string
    category: string
    type: 'single' | 'multiple' | 'short' | 'fill'
    question: string
    options?: string[]
    answer: number | number[] | string | string[]
    explanation: string
    difficulty: 'easy' | 'medium' | 'hard'
    status: string
}

export interface UserAnswer {
    questionIndex: number
    answer: number | number[] | string | string[]
    isCorrect: boolean
}

export interface QuizState {
    questions: Question[]
    currentIndex: number
    userAnswers: UserAnswer[]
    startTime: number
    endTime?: number
    mode?: 'practice' | 'memorize'
}

// 错题记录
export interface WrongQuestion {
    id: string // 唯一标识
    question: Question
    userAnswer: number | number[] | string | string[]
    wrongCount: number // 错误次数
    lastWrongTime: number // 最后一次答错时间
    isReviewed: boolean // 是否已复习
}

// 答题记录
export interface QuizHistory {
    id: string
    date: number
    mode: 'practice' | 'memorize'
    bank: string
    totalQuestions: number
    correctCount: number
    wrongCount: number
    percentage: number
    timeSpent: number // 秒
}

// 学习统计
export interface StudyStats {
    totalQuizzes: number // 总答题次数
    totalQuestions: number // 总答题数
    totalCorrect: number // 总答对数
    totalWrong: number // 总答错数
    averageAccuracy: number // 平均正确率
    totalTimeSpent: number // 总用时（秒）
    difficultyStats: {
        easy: { total: number; correct: number }
        medium: { total: number; correct: number }
        hard: { total: number; correct: number }
    }
    recentHistory: QuizHistory[] // 最近的答题记录
}
