<template>
  <div class="reports-container">
    <div class="reports-header">
      <h1>📊 Отчеты и аналитика</h1>
      <div class="export-actions">
        <button @click="showExportModal = true" class="btn-primary">
          📥 Экспорт в CSV
        </button>
      </div>
    </div>

    <div v-if="reportsStore.isLoading" class="loading">
      Загрузка отчетов...
    </div>

    <div v-else class="reports-content">
      <!-- Общая статистика -->
      <div class="stats-section">
        <h2>Общая статистика системы</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🏗️</div>
            <div class="stat-info">
              <div class="stat-number">{{ reportsStore.systemStats.total_projects || 0 }}</div>
              <div class="stat-label">Проектов</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">⚠️</div>
            <div class="stat-info">
              <div class="stat-number">{{ reportsStore.systemStats.total_defects || 0 }}</div>
              <div class="stat-label">Всего дефектов</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">🔴</div>
            <div class="stat-info">
              <div class="stat-number">{{ reportsStore.systemStats.open_defects || 0 }}</div>
              <div class="stat-label">Открытых дефектов</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">🟢</div>
            <div class="stat-info">
              <div class="stat-number">{{ reportsStore.systemStats.closed_defects || 0 }}</div>
              <div class="stat-label">Закрытых дефектов</div>
            </div>
          </div>
          
          <div class="stat-card critical">
            <div class="stat-icon">🚨</div>
            <div class="stat-info">
              <div class="stat-number">{{ reportsStore.systemStats.critical_defects || 0 }}</div>
              <div class="stat-label">Критических дефектов</div>
            </div>
          </div>
          
          <div class="stat-card overdue">
            <div class="stat-icon">⏰</div>
            <div class="stat-info">
              <div class="stat-number">{{ reportsStore.systemStats.overdue_defects || 0 }}</div>
              <div class="stat-label">Просроченных дефектов</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Статистика по проектам -->
      <div class="stats-section">
        <h2>Статистика по проектам</h2>
        <div class="projects-stats">
          <div 
            v-for="project in reportsStore.projectsStats" 
            :key="project.id" 
            class="project-stat-card"
          >
            <h3>{{ project.name }}</h3>
            <div class="project-stats-grid">
              <div class="project-stat">
                <span class="project-stat-number">{{ project.total_defects || 0 }}</span>
                <span class="project-stat-label">Всего</span>
              </div>
              <div class="project-stat">
                <span class="project-stat-number">{{ project.open_defects || 0 }}</span>
                <span class="project-stat-label">Открыто</span>
              </div>
              <div class="project-stat">
                <span class="project-stat-number">{{ project.closed_defects || 0 }}</span>
                <span class="project-stat-label">Закрыто</span>
              </div>
              <div class="project-stat critical">
                <span class="project-stat-number">{{ project.critical_defects || 0 }}</span>
                <span class="project-stat-label">Критич.</span>
              </div>
              <div class="project-stat overdue">
                <span class="project-stat-number">{{ project.overdue_defects || 0 }}</span>
                <span class="project-stat-label">Просроч.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Диаграммы -->
      <div class="charts-section">
        <div class="chart-row">
          <!-- Статусы дефектов -->
          <div class="chart-card">
            <h3>Распределение по статусам</h3>
            <div class="chart-container">
              <div 
                v-for="stat in reportsStore.statusStats" 
                :key="stat.status" 
                class="chart-bar"
              >
                <div class="bar-label">
                  <span class="status-indicator" :style="{ backgroundColor: getStatusColor(stat.status) }"></span>
                  {{ getStatusLabel(stat.status) }}
                </div>
                <div class="bar-container">
                  <div 
                    class="bar-fill" 
                    :style="{ 
                      width: `${(stat.count / getTotalDefects()) * 100}%`,
                      backgroundColor: getStatusColor(stat.status)
                    }"
                  ></div>
                </div>
                <div class="bar-value">
                  {{ stat.count }} ({{ stat.percentage }}%)
                </div>
              </div>
            </div>
          </div>

          <!-- Приоритеты дефектов -->
          <div class="chart-card">
            <h3>Распределение по приоритетам</h3>
            <div class="chart-container">
              <div 
                v-for="stat in reportsStore.priorityStats" 
                :key="stat.priority" 
                class="chart-bar"
              >
                <div class="bar-label">
                  <span class="priority-indicator" :style="{ backgroundColor: getPriorityColor(stat.priority) }"></span>
                  {{ getPriorityLabel(stat.priority) }}
                </div>
                <div class="bar-container">
                  <div 
                    class="bar-fill" 
                    :style="{ 
                      width: `${(stat.count / getTotalDefects()) * 100}%`,
                      backgroundColor: getPriorityColor(stat.priority)
                    }"
                  ></div>
                </div>
                <div class="bar-value">
                  {{ stat.count }} ({{ stat.percentage }}%)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Статистика по исполнителям -->
      <div class="stats-section" v-if="reportsStore.assigneeStats.length > 0">
        <h2>Эффективность исполнителей</h2>
        <div class="assignee-stats">
          <div 
            v-for="assignee in reportsStore.assigneeStats" 
            :key="assignee.id" 
            class="assignee-card"
          >
            <h4>{{ assignee.full_name }}</h4>
            <div class="assignee-stats-grid">
              <div class="assignee-stat">
                <span class="assignee-stat-number">{{ assignee.total_assigned || 0 }}</span>
                <span class="assignee-stat-label">Назначено</span>
              </div>
              <div class="assignee-stat">
                <span class="assignee-stat-number">{{ assignee.closed_defects || 0 }}</span>
                <span class="assignee-stat-label">Закрыто</span>
              </div>
              <div class="assignee-stat">
                <span class="assignee-stat-number">{{ assignee.open_defects || 0 }}</span>
                <span class="assignee-stat-label">Открыто</span>
              </div>
              <div class="assignee-stat overdue">
                <span class="assignee-stat-number">{{ assignee.overdue_defects || 0 }}</span>
                <span class="assignee-stat-label">Просрочено</span>
              </div>
              <div class="assignee-stat completion">
                <span class="assignee-stat-number">{{ assignee.completion_rate || 0 }}%</span>
                <span class="assignee-stat-label">Эффективность</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно экспорта -->
    <div v-if="showExportModal" class="modal-overlay" @click="showExportModal = false">
      <div class="modal" @click.stop>
        <h3>Экспорт дефектов в CSV</h3>
        
        <div class="export-filters">
          <div class="form-group">
            <label>Проект:</label>
            <select v-model="exportFilters.project_id">
              <option value="">Все проекты</option>
              <option 
                v-for="project in projectsStore.projects" 
                :key="project.id" 
                :value="project.id"
              >
                {{ project.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Статус:</label>
            <select v-model="exportFilters.status">
              <option value="">Все статусы</option>
              <option 
                v-for="status in defectsStore.statuses" 
                :key="status.value" 
                :value="status.value"
              >
                {{ status.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Приоритет:</label>
            <select v-model="exportFilters.priority">
              <option value="">Все приоритеты</option>
              <option 
                v-for="priority in defectsStore.priorities" 
                :key="priority.value" 
                :value="priority.value"
              >
                {{ priority.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" @click="showExportModal = false" class="btn-secondary">
            Отмена
          </button>
          <button type="button" @click="handleExport" class="btn-primary">
            📥 Экспортировать
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useReportsStore } from '@/stores/reports';
import { useProjectsStore } from '@/stores/projects';
import { useDefectsStore } from '@/stores/defects';

const reportsStore = useReportsStore();
const projectsStore = useProjectsStore();
const defectsStore = useDefectsStore();

const showExportModal = ref(false);
const exportFilters = reactive({
  project_id: '',
  status: '',
  priority: ''
});

onMounted(async () => {
  try {
    await projectsStore.fetchProjects();
    await loadAllReports();
  } catch (error) {
    console.error('Error loading reports:', error);
  }
});

const loadAllReports = async () => {
  await Promise.all([
    reportsStore.fetchSystemStats(),
    reportsStore.fetchProjectsStats(),
    reportsStore.fetchStatusStats(),
    reportsStore.fetchPriorityStats(),
    reportsStore.fetchAssigneeStats()
  ]);
};

const getTotalDefects = () => {
  return reportsStore.statusStats.reduce((total, stat) => total + parseInt(stat.count), 0);
};

const getStatusLabel = (status) => {
  return defectsStore.getStatusLabel(status);
};

const getStatusColor = (status) => {
  return defectsStore.getStatusColor(status);
};

const getPriorityLabel = (priority) => {
  return defectsStore.getPriorityLabel(priority);
};

const getPriorityColor = (priority) => {
  return defectsStore.getPriorityColor(priority);
};

const handleExport = async () => {
  try {
    await reportsStore.exportDefectsToCSV(exportFilters);
    showExportModal.value = false;
    
    // Сброс фильтров
    exportFilters.project_id = '';
    exportFilters.status = '';
    exportFilters.priority = '';
  } catch (error) {
    console.error('Error exporting defects:', error);
    alert('Ошибка при экспорте: ' + (error.response?.data?.error || error.message));
  }
};
</script>

<style scoped>
.reports-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.reports-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.reports-header h1 {
  color: #333;
  margin: 0;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
}

.stats-section {
  margin-bottom: 3rem;
}

.stats-section h2 {
  color: #333;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #667eea;
  padding-bottom: 0.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 4px solid #667eea;
}

.stat-card.critical {
  border-left-color: #dc3545;
}

.stat-card.overdue {
  border-left-color: #fd7e14;
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  line-height: 1;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.projects-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.project-stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #28a745;
}

.project-stat-card h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
}

.project-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.project-stat {
  text-align: center;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 5px;
}

.project-stat.critical {
  background: #f8d7da;
  color: #721c24;
}

.project-stat.overdue {
  background: #fff3cd;
  color: #856404;
}

.project-stat-number {
  display: block;
  font-weight: bold;
  font-size: 1.25rem;
}

.project-stat-label {
  font-size: 0.75rem;
  color: #666;
}

.charts-section {
  margin-bottom: 3rem;
}

.chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.chart-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-card h3 {
  margin: 0 0 1.5rem 0;
  color: #333;
  text-align: center;
}

.chart-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chart-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.bar-label {
  width: 120px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #333;
}

.status-indicator, .priority-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.bar-container {
  flex: 1;
  height: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.bar-value {
  width: 80px;
  text-align: right;
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
}

.assignee-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.assignee-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #007bff;
}

.assignee-card h4 {
  margin: 0 0 1rem 0;
  color: #333;
}

.assignee-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.assignee-stat {
  text-align: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 5px;
}

.assignee-stat.overdue {
  background: #f8d7da;
  color: #721c24;
}

.assignee-stat.completion {
  background: #d1ecf1;
  color: #0c5460;
  grid-column: span 2;
}

.assignee-stat-number {
  display: block;
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.assignee-stat-label {
  font-size: 0.75rem;
  color: #666;
}

.export-filters {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h3 {
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
}

/* Адаптивность */
@media (max-width: 768px) {
  .chart-row {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .projects-stats {
    grid-template-columns: 1fr;
  }
  
  .reports-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>