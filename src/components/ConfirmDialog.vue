<template>
    <Teleport to="body">
        <Transition name="dialog">
            <div v-if="visible" class="dialog-overlay" @click="handleCancel">
                <div class="dialog-content" @click.stop>
                    <h3 class="dialog-title">{{ title }}</h3>
                    <p class="dialog-message">{{ message }}</p>
                    <div class="dialog-actions">
                        <button class="dialog-btn dialog-btn-cancel" @click="handleCancel">
                            {{ cancelText }}
                        </button>
                        <button class="dialog-btn dialog-btn-confirm" @click="handleConfirm">
                            {{ confirmText }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 组件属性
interface Props {
    title?: string
    message: string
    confirmText?: string
    cancelText?: string
}

withDefaults(defineProps<Props>(), {
    title: '确认',
    confirmText: '确定',
    cancelText: '取消'
})

// 组件事件
const emit = defineEmits<{
    confirm: []
    cancel: []
}>()

// 显示状态
const visible = ref(false)

// 显示对话框
const show = () => {
    visible.value = true
}

// 隐藏对话框
const hide = () => {
    visible.value = false
}

// 确认
const handleConfirm = () => {
    emit('confirm')
    hide()
}

// 取消
const handleCancel = () => {
    emit('cancel')
    hide()
}

// 暴露方法
defineExpose({
    show,
    hide
})
</script>

<style scoped>
.dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.dialog-content {
    background: white;
    border-radius: 8px;
    padding: 24px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dialog-title {
    font-size: 18px;
    font-weight: 600;
    color: #111;
    margin-bottom: 12px;
}

.dialog-message {
    font-size: 15px;
    color: #666;
    line-height: 1.6;
    margin-bottom: 24px;
}

.dialog-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

.dialog-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.dialog-btn-cancel {
    background: white;
    border: 1px solid #ddd;
    color: #666;
}

.dialog-btn-cancel:hover {
    border-color: #111;
    color: #111;
}

.dialog-btn-confirm {
    background: #111;
    color: white;
}

.dialog-btn-confirm:hover {
    background: #000;
}

/* 过渡动画 */
.dialog-enter-active,
.dialog-leave-active {
    transition: opacity 0.2s;
}

.dialog-enter-from,
.dialog-leave-to {
    opacity: 0;
}

.dialog-enter-active .dialog-content,
.dialog-leave-active .dialog-content {
    transition: transform 0.2s;
}

.dialog-enter-from .dialog-content,
.dialog-leave-to .dialog-content {
    transform: scale(0.9);
}
</style>
