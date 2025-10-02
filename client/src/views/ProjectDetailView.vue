<template>
  <div class="project-detail">
    <div class="project-header">
      <button @click="$router.back()" class="back-btn">← Назад</button>
      <h1>{{ project?.name }}</h1>
    </div>

    <div v-if="projectsStore.isLoading" class="loading">
      Загрузка проекта...
    </div>

    <div v-else-if="project" class="project-content">
      <div class="project-info">
        <div class="info-card">
          <h3>Информация о проекте</h3>
          <p v-if="project.description">{{ project.description }}</p>
          <p v-else class="no-description">Описание отсутствует</p>
          
          <div class="project-meta">
            <div class="meta-item">
              <strong>Создал:</strong> {{ project.created_by_name }}
            </div>
            <div class="meta-item">
              <strong>Дата создания:</strong> {{ formatDate(project.created_at) }}
            </div>
          </div>
        </div>

        <div class="stats-card">
          <h3>Статистика дефектов</h3>
          <div class="stats-grid">
            <div v-for="stat in project.stats" :key="stat.status" class="stat-item">
              <span class="stat-count">{{ stat.count }}</span>
              <span class="stat-label">{{ getStatusLabel(stat.status) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="project-actions">
        <h3>Действия</h3>
        <div class="actions-grid">
          <router-link :to="`/projects/${project.id}/defects`" class="action-btn">
            📋 Просмотр дефектов
          </router-link>
          <button 
            v-if="authStore.canCreateDefects" 
            class="action-btn"
            @click="createDefect"
          >
            ➕ Создать дефект
          </button>
          <button 
            v-if="authStore.canManageProjects" 
            class="action-btn"
            @click="editProject"
          >
            ✏️ Редактировать проект
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectsStore } from '@/stores/projects';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const projectsStore = useProjectsStore();
const authStore = useAuthStore();

const project = projectsStore.currentProject;

onMounted(async () => {
  await projectsStore.fetchProjectById(route.params.id);
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU');
};

const getStatusLabel = (status) => {
  const statusLabels = {
    'new': 'Новые',
    'in_progress': 'В работе',
    'on_review': 'На проверке',
    'closed': 'Закрыты',
    'cancelled': 'Отменены'
  };
  return statusLabels[status] || status;
};

const createDefect = () => {
  router.push(`/projects/${project.id}/defects/create`);
};

const editProject = () => {
  // Реализуем позже
  alert('Редактирование проекта будет реализовано позже');
};
</script>

<style scoped>
.project-detail {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.project-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
}

.back-btn:hover {
  background: #5a6268;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.project-content {
  display: grid;
  gap: 2rem;
}

.project-info {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.info-card, .stats-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-card h3, .stats-card h3 {
  margin-bottom: 1rem;
  color: #333;
}

.no-description {
  color: #888;
  font-style: italic;
}

.project-meta {
  margin-top: 1rem;
}

.meta-item {
  margin-bottom: 0.5rem;
  color: #666;
}

.stats-grid {
  display: grid;
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 5px;
}

.stat-count {
  font-weight: bold;
  font-size: 1.5rem;
  color: #333;
}

.stat-label {
  color: #666;
}

.project-actions {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.action-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 5px;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  display: block;
}

.action-btn:hover {
  background: #5a6fd8;
}
</style>