<template>
    <label class="option" :class="optionClasses">
        <input v-if="type === 'single'" type="radio" :value="index" :checked="isSelected" :disabled="disabled"
            @change="$emit('select', index)" />
        <input v-else type="checkbox" :value="index" :checked="isSelected" :disabled="disabled"
            @change="$emit('select', index)" />
        <span class="option-label">{{ String.fromCharCode(65 + index) }}</span>
        <span class="option-text">{{ text }}</span>
    </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    index: number
    text: string
    type: 'single' | 'multiple'
    isSelected: boolean
    isCorrect?: boolean
    showResult?: boolean
    disabled?: boolean
}>()

defineEmits<{
    (e: 'select', index: number): void
}>()

const optionClasses = computed(() => {
    return {
        selected: props.isSelected,
        correct: props.showResult && props.isCorrect,
        wrong: props.showResult && props.isSelected && !props.isCorrect
    }
})
</script>

<style scoped>
.option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s;
}

.option:hover:not(:disabled) {
    border-color: #111;
    background: #fafafa;
}

.option input {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #111;
}

.option input:disabled {
    cursor: not-allowed;
}

.option-label {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border-radius: 50%;
    font-weight: 600;
    font-size: 14px;
    flex-shrink: 0;
    color: #666;
}

.option-text {
    flex: 1;
    font-size: 15px;
}

.option.selected {
    border-color: #111;
    background: #fafafa;
}

.option.selected .option-label {
    background: #111;
    color: white;
}

.option.correct {
    border-color: #22c55e;
    background: #f0fdf4;
}

.option.correct .option-label {
    background: #22c55e;
    color: white;
}

.option.wrong {
    border-color: #ef4444;
    background: #fef2f2;
}

.option.wrong .option-label {
    background: #ef4444;
    color: white;
}

/* 暗黑模式适配 */
:global(.dark) .option {
    border-color: #3a3a3a;
}

:global(.dark) .option:hover:not(:disabled) {
    border-color: #667eea;
    background: #2a2a2a;
}

:global(.dark) .option-label {
    background: #3a3a3a;
    color: #ccc;
}

:global(.dark) .option.selected {
    border-color: #667eea;
    background: #2a2a2a;
}

:global(.dark) .option.selected .option-label {
    background: #667eea;
    color: white;
}

:global(.dark) .option.correct {
    border-color: #22c55e;
    background: rgba(34, 197, 94, 0.2);
}

:global(.dark) .option.wrong {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.2);
}
</style>
