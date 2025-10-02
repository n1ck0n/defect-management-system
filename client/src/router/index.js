import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/components/LoginForm.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/components/RegisterForm.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true }
    }
  ]
});

// Навигационный guard для проверки аутентификации
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Проверяем аутентификацию при первом посещении
  if (!authStore.isAuthenticated && localStorage.getItem('token')) {
    const isAuthenticated = await authStore.checkAuth();
    if (!isAuthenticated) {
      localStorage.removeItem('token');
    }
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;