import { ref, onMounted } from 'vue'

const KEY_VISITOR_ID = 'visitor_id'
const KEY_TOTAL = 'total_visitors'
const KEY_DAILY = 'daily_visitors'
const KEY_DAY = 'daily_date'

const todayString = () => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const randomId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export function useVisitorStats() {
  const totalVisitors = ref(0)
  const dailyVisitors = ref(0)

  const load = () => {
    try {
      totalVisitors.value = parseInt(localStorage.getItem(KEY_TOTAL) || '0') || 0
      const savedDay = localStorage.getItem(KEY_DAY)
      const today = todayString()
      if (savedDay !== today) {
        localStorage.setItem(KEY_DAY, today)
        localStorage.setItem(KEY_DAILY, '0')
      }
      dailyVisitors.value = parseInt(localStorage.getItem(KEY_DAILY) || '0') || 0
    } catch {
      totalVisitors.value = 0
      dailyVisitors.value = 0
    }
  }

  const save = () => {
    try {
      localStorage.setItem(KEY_TOTAL, String(totalVisitors.value))
      localStorage.setItem(KEY_DAILY, String(dailyVisitors.value))
      localStorage.setItem(KEY_DAY, todayString())
    } catch {}
  }

  const ensureVisitor = () => {
    try {
      const id = localStorage.getItem(KEY_VISITOR_ID)
      if (!id) {
        localStorage.setItem(KEY_VISITOR_ID, randomId())
        totalVisitors.value += 1
        dailyVisitors.value += 1
        save()
      }
    } catch {}
  }

  const scheduleMidnightReset = () => {
    const now = new Date()
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const ms = next.getTime() - now.getTime()
    setTimeout(() => {
      try {
        localStorage.setItem(KEY_DAY, todayString())
        localStorage.setItem(KEY_DAILY, '0')
        dailyVisitors.value = 0
      } catch {}
      scheduleMidnightReset()
    }, ms)
  }

  onMounted(() => {
    load()
    ensureVisitor()
    scheduleMidnightReset()
  })

  return { totalVisitors, dailyVisitors }
}
