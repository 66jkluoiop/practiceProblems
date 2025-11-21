import { ref, watch, onMounted } from 'vue'

const STORAGE_KEY = 'dark_mode'

// 全局暗黑模式状态
const isDark = ref(false)

export function useDarkMode() {
    // 初始化：从 localStorage 读取或使用系统偏好
    const initDarkMode = () => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved !== null) {
            isDark.value = saved === 'true'
        } else {
            // 检测系统偏好
            isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
        }
        applyDarkMode()
    }

    // 应用暗黑模式
    const applyDarkMode = () => {
        if (isDark.value) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }

    // 切换暗黑模式
    const toggleDarkMode = () => {
        isDark.value = !isDark.value
        localStorage.setItem(STORAGE_KEY, String(isDark.value))
        applyDarkMode()
    }

    // 监听系统主题变化
    const watchSystemTheme = () => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        mediaQuery.addEventListener('change', (e) => {
            // 只有在用户没有手动设置时才跟随系统
            if (localStorage.getItem(STORAGE_KEY) === null) {
                isDark.value = e.matches
                applyDarkMode()
            }
        })
    }

    // 组件挂载时初始化
    onMounted(() => {
        initDarkMode()
        watchSystemTheme()
    })

    // 监听状态变化
    watch(isDark, applyDarkMode)

    return {
        isDark,
        toggleDarkMode
    }
}
