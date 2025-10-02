<template>
  <div class="reports-container">
    <div class="reports-header">
      <h1>Отчеты и аналитика</h1>
    </div>

    <div class="reports-content">
      <div class="welcome-card">
        <h2>Система отчетности</h2>
        <p>Раздел находится в разработке. Здесь будут доступны:</p>
        
        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">📊</div>
            <div class="feature-text">
              <h3>Статистика по проектам</h3>
              <p>Графики и диаграммы по количеству дефектов</p>
            </div>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">📈</div>
            <div class="feature-text">
              <h3>Аналитика эффективности</h3>
              <p>Метрики по срокам исправления дефектов</p>
            </div>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">📋</div>
            <div class="feature-text">
              <h3>Экспорт в CSV/Excel</h3>
              <p>Выгрузка данных для внешнего анализа</p>
            </div>
          </div>
        </div>

        <div class="quick-stats">
          <h3>Быстрая статистика</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">{{ totalDefects }}</div>
              <div class="stat-label">Всего дефектов</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ openDefects }}</div>
              <div class="stat-label">Открытых дефектов</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ totalProjects }}</div>
              <div class="stat-label">Проектов</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useDefectsStore } from '@/stores/defects';
import { useProjectsStore } from '@/stores/projects';

const defectsStore = useDefectsStore();
const projectsStore = useProjectsStore();

const totalDefects = ref(0);
const openDefects = ref(0);
const totalProjects = ref(0);

onMounted(async () => {
  try {
    await defectsStore.fetchDefects();
    await projectsStore.fetchProjects();
    
    totalDefects.value = defectsStore.defects.length;
    openDefects.value = defectsStore.defects.filter(d => 
      d.status === 'new' || d.status === 'in_progress' || d.status === 'on_review'
    ).length;
    totalProjects.value = projectsStore.projects.length;
  } catch (error) {
    console.error('Error loading reports data:', error);
  }
});
</script>

<style scoped>
.reports-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.reports-header h1 {
  color: #333;
  margin-bottom: 2rem;
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

.features-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin: 2rem 0;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.feature-icon {
  font-size: 2rem;
}

.feature-text h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.feature-text p {
  margin: 0;
  color: #666;
}

.quick-stats {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.quick-stats h3 {
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
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}
</style>