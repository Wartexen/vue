import { createRouter, createWebHistory } from 'vue-router'
import authService from '@/services/authService';


const routes = [
  {
    path: '/',
    redirect: '/homepage' // Перенаправление с корня на первую страницу
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../components/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: () => import('../components/AuthCallback.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/homepage',
    name: 'HomePage',
    component: () => import('../components/HomePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/uploadlist',
    name: 'UploadList',
    component: () => import('../components/UploadList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/formcommission',
    name: 'FormCommission',
    component: () => import('../components/FormCommission.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/generateprotocols',
    name: 'GenerateProtocols',
    component: () => import('../components/GenerateProtocols.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/studentdistribution',
    name: 'StudentDistribution',
    component: () => import('../components/StudentDistribution.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/archive',
    name: 'Archive',
    component: () => import('../components/Archive.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/projectdefense',
    name: 'ProjectDefense',
    component: () => import('../components/ProjectDefense.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/projectschedule',
    name: 'ProjectSchedule',
    component: () => import('../components/ProjectSchedule.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/protocollist',
    name: 'ProtocolList',
    component: () => import('../components/ProtocolList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/projects/:projectId/questions',
    name: 'ProjectQuestions',
    component: () => import('../components/ProjectQuestions.vue'),
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/homepage', // или компонент 404
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth !== false)
  const isAuthenticated = authService.isAuthenticated()

  if (requiresAuth && !isAuthenticated) {
    next("/login")
  } else if (to.path === "/login" && isAuthenticated) {
    next("/homepage")
  } else {
    next()
  }
})

export default router;