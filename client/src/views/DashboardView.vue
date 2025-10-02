<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <h1>Панель управления</h1>
      <div class="user-info">
        <span>Добро пожаловать, {{ authStore.user?.full_name }}</span>
        <span class="user-role">({{ getRoleName(authStore.user?.role) }})</span>
        <button @click="handleLogout" class="logout-btn">Выйти</button>
      </div>
    </header>

    <div class="dashboard-content">
      <div class="welcome-card">
        <h2>Система управления дефектами</h2>
        <p>Вы вошли как: <strong>{{ getRoleName(authStore.user?.role) }}</strong></p>
        
        <div class="permissions-info">
          <h3>Ваши права доступа:</h3>
          <ul>
            <li v-if="authStore.canCreateDefects">✅ Создание дефектов</li>
            <li v-if="authStore.canManageProjects">✅ Управление проектами</li>
            <li v-if="authStore.canAssignTasks">✅ Назначение задач</li>
            <li v-if="authStore.canViewReports">✅ Просмотр отчетов</li>
            <li>✅ Просмотр проектов и дефектов</li>
          </ul>
        </div>

        <div class="quick-actions">
          <router-link to="/projects" class="action-card">
            <div class="action-icon">🏗️</div>
            <h4>Проекты</h4>
            <p>Управление строительными объектами</p>
          </router-link>
          
          <router-link to="/defects" class="action-card" v-if="authStore.canCreateDefects">
            <div class="action-icon">⚠️</div>
            <h4>Дефекты</h4>
            <p>Создание и отслеживание дефектов</p>
          </router-link>
          
          <router-link to="/reports" class="action-card" v-if="authStore.canViewReports">
            <div class="action-icon">📊</div>
            <h4>Отчеты</h4>
            <p>Аналитика и статистика</p>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const getRoleName = (role) => {
  const roleNames = {
    engineer: '👷 Инженер',
    manager: '👔 Менеджер',
    observer: '👀 Наблюдатель'
  };
  return roleNames[role] || role;
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f5f5f5;
}

.dashboard-header {
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-role {
  color: #666;
  font-style: italic;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.logout-btn:hover {
  background: #c82333;
}

.dashboard-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.welcome-card h2 {
  color: #333;
  margin-bottom: 1rem;
}

.permissions-info {
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.permissions-info h3 {
  margin-bottom: 1rem;
  color: #555;
}

.permissions-info ul {
  list-style: none;
  padding: 0;
}

.permissions-info li {
  padding: 0.5rem 0;
  color: #666;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.action-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 10px;
  text-decoration: none;
  transition: transform 0.3s ease;
  display: block;
}

.action-card:hover {
  transform: translateY(-5px);
  text-decoration: none;
  color: white;
}

.action-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.action-card h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

.action-card p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
}
</style>