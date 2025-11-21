<<<<<<< HEAD
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Quiz from '@/views/Quiz.vue'
import Result from '@/views/Result.vue'
import WrongQuestions from '@/views/WrongQuestions.vue'
import Statistics from '@/views/Statistics.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/quiz',
            name: 'quiz',
            component: Quiz
        },
        {
            path: '/result',
            name: 'result',
            component: Result
        },
        {
            path: '/wrong-questions',
            name: 'wrong-questions',
            component: WrongQuestions
        },
        {
            path: '/statistics',
            name: 'statistics',
            component: Statistics
        },
        {
            // 捕获所有未匹配的路由（包括浏览器插件注入的路径）
            path: '/:pathMatch(.*)*',
            redirect: '/'
        }
    ]
})

export default router
=======
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Quiz from '@/views/Quiz.vue'
import Result from '@/views/Result.vue'
import WrongQuestions from '@/views/WrongQuestions.vue'
import Statistics from '@/views/Statistics.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/quiz',
            name: 'quiz',
            component: Quiz
        },
        {
            path: '/result',
            name: 'result',
            component: Result
        },
        {
            path: '/wrong-questions',
            name: 'wrong-questions',
            component: WrongQuestions
        },
        {
            path: '/statistics',
            name: 'statistics',
            component: Statistics
        },
        {
            // 捕获所有未匹配的路由（包括浏览器插件注入的路径）
            path: '/:pathMatch(.*)*',
            redirect: '/'
        }
    ]
})

export default router
>>>>>>> f465a0dd86651586e2c3629377edbabf79b9810b
