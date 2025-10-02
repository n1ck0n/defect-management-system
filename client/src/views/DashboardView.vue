<template>
  <div class="dashboard">
    <div class="dashboard-content">
      <div class="welcome-card">
        <h1>Добро пожаловать, {{ authStore.user?.full_name }}!</h1>
        <p class="user-role">Вы вошли как: <strong>{{ getRoleName(authStore.user?.role) }}</strong></p>
        
        <div class="permissions-info">
          <h2>Ваши права доступа</h2>
          <ul>
            <li v-if="authStore.canCreateDefects">✅ Создание дефектов</li>
            <li v-if="authStore.canManageProjects">✅ Управление проектами</li>
            <li v-if="authStore.canAssignTasks">✅ Назначение задач</li>
            <li v-if="authStore.canViewReports">✅ Просмотр отчетов</li>
            <li>✅ Просмотр проектов и дефектов</li>
          </ul>
        </div>

        <div class="quick-stats">
          <h2>Быстрая статистика</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">{{ totalProjects }}</div>
              <div class="stat-label">Проектов</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ totalDefects }}</div>
              <div class="stat-label">Всего дефектов</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ openDefects }}</div>
              <div class="stat-label">Открытых дефектов</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ criticalDefects }}</div>
              <div class="stat-label">Критических дефектов</div>
            </div>
          </div>
        </div>

        <div class="quick-actions">
          <h2>Быстрые действия</h2>
          <div class="actions-grid">
            <router-link to="/projects" class="action-card">
              <div class="action-icon">🏗️</div>
              <h3>Проекты</h3>
              <p>Управление строительными объектами</p>
            </router-link>
            
            <router-link to="/defects" class="action-card" v-if="authStore.canCreateDefects">
              <div class="action-icon">⚠️</div>
              <h3>Дефекты</h3>
              <p>Создание и отслеживание дефектов</p>
            </router-link>
            
            <router-link to="/reports" class="action-card" v-if="authStore.canViewReports">
              <div class="action-icon">📊</div>
              <h3>Отчеты</h3>
              <p>Аналитика и статистика</p>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useProjectsStore } from '@/stores/projects';
import { useDefectsStore } from '@/stores/defects';

const authStore = useAuthStore();
const projectsStore = useProjectsStore();
const defectsStore = useDefectsStore();

const totalProjects = ref(0);
const totalDefects = ref(0);
const openDefects = ref(0);
const criticalDefects = ref(0);

const getRoleName = (role) => {
  const roleNames = {
    engineer: '👷 Инженер',
    manager: '👔 Менеджер',
    observer: '👀 Наблюдатель'
  };
  return roleNames[role] || role;
};

onMounted(async () => {
  try {
    await projectsStore.fetchProjects();
    await defectsStore.fetchDefects();
    
    totalProjects.value = projectsStore.projects.length;
    totalDefects.value = defectsStore.defects.length;
    openDefects.value = defectsStore.defects.filter(d => 
      d.status === 'new' || d.status === 'in_progress' || d.status === 'on_review'
    ).length;
    criticalDefects.value = defectsStore.defects.filter(d => 
      d.priority === 'critical'
    ).length;
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
});
</script>

<style scoped>
.dashboard {
  min-height: calc(100vh - 64px);
  background: #f5f5f5;
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

.welcome-card h1 {
  color: #333;
  margin-bottom: 0.5rem;
}

.user-role {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.permissions-info {
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.permissions-info h2 {
  margin-bottom: 1rem;
  color: #555;
}

.permissions-info ul {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.5rem;
}

.permissions-info li {
  padding: 0.5rem 0;
  color: #666;
}

.quick-stats {
  margin: 2rem 0;
}

.quick-stats h2 {
  margin-bottom: 1rem;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.quick-actions {
  margin-top: 2rem;
}

.quick-actions h2 {
  margin-bottom: 1rem;
  color: #333;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  padding: 2rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  text-align: center;
}

.action-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
}

.action-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.action-card h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.action-card p {
  margin: 0;
  color: #666;
  line-height: 1.4;
}
</style>