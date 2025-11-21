import { ref, onMounted, onUnmounted, type Ref } from 'vue'

interface SwipeOptions {
    onSwipeLeft?: () => void
    onSwipeRight?: () => void
    onSwipeUp?: () => void
    onSwipeDown?: () => void
    threshold?: number // 最小滑动距离
}

export function useSwipe(elementRef: Ref<HTMLElement | null>, options: SwipeOptions) {
    const touchStartX = ref(0)
    const touchStartY = ref(0)
    const touchEndX = ref(0)
    const touchEndY = ref(0)
    const threshold = options.threshold || 50

    const handleTouchStart = (e: TouchEvent) => {
        touchStartX.value = e.touches[0].clientX
        touchStartY.value = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
        touchEndX.value = e.touches[0].clientX
        touchEndY.value = e.touches[0].clientY
    }

    const handleTouchEnd = () => {
        const deltaX = touchEndX.value - touchStartX.value
        const deltaY = touchEndY.value - touchStartY.value
        const absDeltaX = Math.abs(deltaX)
        const absDeltaY = Math.abs(deltaY)

        // 判断是水平滑动还是垂直滑动
        if (absDeltaX > absDeltaY && absDeltaX > threshold) {
            // 水平滑动
            if (deltaX > 0) {
                options.onSwipeRight?.()
            } else {
                options.onSwipeLeft?.()
            }
        } else if (absDeltaY > absDeltaX && absDeltaY > threshold) {
            // 垂直滑动
            if (deltaY > 0) {
                options.onSwipeDown?.()
            } else {
                options.onSwipeUp?.()
            }
        }

        // 重置
        touchStartX.value = 0
        touchStartY.value = 0
        touchEndX.value = 0
        touchEndY.value = 0
    }

    onMounted(() => {
        const element = elementRef.value
        if (element) {
            element.addEventListener('touchstart', handleTouchStart, { passive: true })
            element.addEventListener('touchmove', handleTouchMove, { passive: true })
            element.addEventListener('touchend', handleTouchEnd)
        }
    })

    onUnmounted(() => {
        const element = elementRef.value
        if (element) {
            element.removeEventListener('touchstart', handleTouchStart)
            element.removeEventListener('touchmove', handleTouchMove)
            element.removeEventListener('touchend', handleTouchEnd)
        }
    })

    return {
        touchStartX,
        touchStartY,
        touchEndX,
        touchEndY
    }
}
