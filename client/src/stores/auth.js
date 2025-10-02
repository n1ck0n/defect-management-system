import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('token'));
  const isLoading = ref(false);

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const userRole = computed(() => user.value?.role);
  
  // Проверки прав доступа для ролей
  const isEngineer = computed(() => userRole.value === 'engineer');
  const isManager = computed(() => userRole.value === 'manager');
  const isObserver = computed(() => userRole.value === 'observer');

  // Проверки конкретных разрешений
  const canManageProjects = computed(() => isManager.value);
  const canAssignTasks = computed(() => isManager.value);
  const canViewReports = computed(() => isManager.value || isObserver.value);
  const canCreateDefects = computed(() => isEngineer.value || isManager.value);

  const setAuth = (userData, authToken) => {
    user.value = userData;
    token.value = authToken;
    localStorage.setItem('token', authToken);
  };

  const clearAuth = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
  };

  const login = async (credentials) => {
    isLoading.value = true;
    try {
      const response = await api.post('/auth/login', credentials);
      setAuth(response.data.user, response.data.token);
      return response.data;
    } catch (error) {
      clearAuth();
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (userData) => {
  isLoading.value = true;
  try {
    // Отправляем только необходимые поля, роль устанавливается на бэкенде
    const registrationData = {
      full_name: userData.full_name,
      email: userData.email,
      password: userData.password
    };
    
    const response = await api.post('/auth/register', registrationData);
    setAuth(response.data.user, response.data.token);
    return response.data;
    } catch (error) {
      clearAuth();
      throw error;
    } finally {
   isLoading.value = false;
    }
  };

  const logout = () => {
    clearAuth();
  };

  const checkAuth = async () => {
    if (!token.value) return false;
    
    try {
      const response = await api.get('/auth/me');
      user.value = response.data.user;
      return true;
    } catch (error) {
      clearAuth();
      return false;
    }
  };

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    userRole,
    isEngineer,
    isManager,
    isObserver,
    canManageProjects,
    canAssignTasks,
    canViewReports,
    canCreateDefects,
    login,
    register,
    logout,
    checkAuth
  };
});