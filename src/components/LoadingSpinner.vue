<template>
  <div class="loading-container" :class="{ overlay: isOverlay, small: size === 'small' }">
    <div class="spinner"></div>
    <div v-if="text" class="loading-text">{{ text }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  text: {
    type: String,
    default: '加载中...'
  },
  isOverlay: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'normal' // 'small' | 'normal'
  }
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.loading-container.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  z-index: 100;
}

.dark .loading-container.overlay {
  background: rgba(26, 26, 26, 0.8);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(102, 126, 234, 0.2);
  border-radius: 50%;
  border-top-color: #667eea;
  animation: spin 1s ease-in-out infinite;
}

.loading-container.small .spinner {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

.loading-text {
  margin-top: 12px;
  font-size: 14px;
  color: #666;
}

.dark .loading-text {
  color: #aaa;
}

.loading-container.small .loading-text {
  margin-top: 8px;
  font-size: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
