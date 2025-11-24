<template>
    <div class="question-card">
        <div class="card-header">
            <div class="tags">
                <span class="tag" :class="`tag-${question.question.difficulty}`">
                    {{ difficultyMap[question.question.difficulty] }}
                </span>
                <span class="tag">{{ questionTypeLabel }}</span>
                <span class="tag">错误 {{ question.wrongCount }} 次</span>
            </div>
            <button class="delete-btn" @click="$emit('delete', question.id)">删除</button>
        </div>

        <div class="question-content">
            <h3>{{ question.question.question }}</h3>

            <div v-if="question.question.type === 'single' || question.question.type === 'multiple'" class="options">
                <div v-for="(option, index) in question.question.options" :key="index" class="option" :class="{
                    wrong: isWrongAnswer(index),
                    correct: isCorrectAnswer(index)
                }">
                    <span class="option-label">{{ String.fromCharCode(65 + index) }}</span>
                    <span class="option-text">{{ option }}</span>
                </div>
            </div>
            <div v-else class="options">
                <div class="option">
                    <span class="option-label">答</span>
                    <span class="option-text">{{ formatTextAnswer(question.userAnswer) }}</span>
                </div>
                <div class="option correct">
                    <span class="option-label">正</span>
                    <span class="option-text">{{ formatTextAnswer(question.question.answer) }}</span>
                </div>
            </div>

            <div class="explanation">
                <h4>解析</h4>
                <p>{{ question.question.explanation }}</p>
            </div>
        </div>

        <div class="card-footer">
            <span class="time">{{ formatTime(question.lastWrongTime) }}</span>
            <button v-if="!question.isReviewed" class="review-btn" @click="$emit('review', question.id)">
                标记已复习
            </button>
            <span v-else class="reviewed-badge">✓ 已复习</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue'
import type { WrongQuestion } from '@/types'

const props = defineProps<{
    question: WrongQuestion
}>()

defineEmits<{
    (e: 'delete', id: string): void
    (e: 'review', id: string): void
}>()

// 难度映射
const difficultyMap = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
}

const questionTypeLabel = computed(() => {
    return props.question.question.type === 'single'
        ? '单选'
        : props.question.question.type === 'multiple'
            ? '多选'
            : props.question.question.type === 'short'
                ? '简答'
                : '填空'
})

// 判断是否为错误答案
const isWrongAnswer = (index: number): boolean => {
    if (props.question.question.type !== 'single' && props.question.question.type !== 'multiple') return false
    if (Array.isArray(props.question.userAnswer)) {
        return (props.question.userAnswer as number[]).includes(index) && !isCorrectAnswer(index)
    }
    return props.question.userAnswer === index && !isCorrectAnswer(index)
}

// 判断是否为正确答案
const isCorrectAnswer = (index: number): boolean => {
    if (props.question.question.type !== 'single' && props.question.question.type !== 'multiple') return false
    const ans = props.question.question.answer
    if (Array.isArray(ans)) {
        return (ans as number[]).includes(index)
    }
    return ans === index
}

const formatTextAnswer = (ans: string | string[] | number | number[]): string => {
    if (Array.isArray(ans)) {
        return ans.map(a => String(a)).join(', ')
    }
    return String(ans)
}

// 格式化时间
const formatTime = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    if (minutes > 0) return `${minutes}分钟前`
    return '刚刚'
}
</script>

<style scoped>
.question-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.tags {
    display: flex;
    gap: 8px;
}

.tag {
    padding: 4px 12px;
    background: #f8f9fa;
    border-radius: 12px;
    font-size: 12px;
    color: #666;
}

.tag-easy {
    background: #d4edda;
    color: #155724;
}

.tag-medium {
    background: #fff3cd;
    color: #856404;
}

.tag-hard {
    background: #f8d7da;
    color: #721c24;
}

.delete-btn {
    padding: 6px 12px;
    background: transparent;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 13px;
    color: #dc3545;
    cursor: pointer;
    transition: all 0.2s;
}

.delete-btn:hover {
    background: #dc3545;
    color: white;
    border-color: #dc3545;
}

.question-content h3 {
    font-size: 16px;
    color: #1a1a1a;
    margin-bottom: 16px;
    line-height: 1.6;
}

.options {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
}

.option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: #f8f9fa;
    border: 2px solid #e9ecef;
    border-radius: 10px;
    transition: all 0.2s;
}

.option.correct {
    background: #d4edda;
    border-color: #28a745;
}

.option.wrong {
    background: #f8d7da;
    border-color: #dc3545;
}

.option-label {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: white;
    border-radius: 50%;
    font-weight: 600;
    font-size: 14px;
    flex-shrink: 0;
}

.option-text {
    flex: 1;
    font-size: 14px;
    color: #333;
}

.explanation {
    padding: 16px;
    background: #f8f9fa;
    border-radius: 10px;
    border-left: 4px solid #667eea;
}

.explanation h4 {
    font-size: 14px;
    color: #667eea;
    margin: 0 0 8px 0;
}

.explanation p {
    font-size: 14px;
    color: #666;
    line-height: 1.6;
    margin: 0;
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #e9ecef;
}

.time {
    font-size: 13px;
    color: #999;
}

.review-btn {
    padding: 6px 16px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
}

.review-btn:hover {
    background: #5568d3;
}

.reviewed-badge {
    font-size: 13px;
    color: #28a745;
    font-weight: 600;
}
</style>
