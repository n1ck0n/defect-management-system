<template>
  <div class="defects-container">
    <div class="defects-header">
      <h2>Дефекты</h2>
      <button 
        v-if="authStore.canCreateDefects" 
        @click="showCreateModal = true"
        class="btn-primary"
      >
        + Создать дефект
      </button>
    </div>

    <!-- Фильтры -->
    <div class="filters-card">
      <h3>Фильтры</h3>
      <div class="filters-grid">
        <div class="filter-group">
          <label>Проект:</label>
          <select v-model="defectsStore.filters.project_id" @change="applyFilters">
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

        <div class="filter-group">
          <label>Статус:</label>
          <select v-model="defectsStore.filters.status" @change="applyFilters">
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

        <div class="filter-group">
          <label>Приоритет:</label>
          <select v-model="defectsStore.filters.priority" @change="applyFilters">
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

        <div class="filter-group">
          <label>Исполнитель:</label>
          <select v-model="defectsStore.filters.assignee_id" @change="applyFilters">
            <option value="">Все исполнители</option>
            <option value="unassigned">Не назначен</option>
            <option 
              v-for="user in users" 
              :key="user.id" 
              :value="user.id"
            >
              {{ user.full_name }} ({{ getUserRoleLabel(user.role) }})
            </option>
          </select>
        </div>
      </div>

      <button @click="clearFilters" class="btn-secondary">
        Очистить фильтры
      </button>
    </div>

    <!-- Список дефектов -->
    <div v-if="defectsStore.isLoading" class="loading">
      Загрузка дефектов...
    </div>

    <div v-else-if="defectsStore.defects.length === 0" class="empty-state">
      <p>Дефектов не найдено</p>
      <button 
        v-if="authStore.canCreateDefects" 
        @click="showCreateModal = true"
        class="btn-primary"
      >
        Создать первый дефект
      </button>
    </div>

    <div v-else class="defects-list">
      <div 
        v-for="defect in defectsStore.defects" 
        :key="defect.id" 
        class="defect-card"
        @click="viewDefect(defect.id)"
      >
        <div class="defect-header">
          <div class="defect-title">
            <h3>{{ defect.title }}</h3>
            <div class="defect-badges">
              <span 
                class="status-badge" 
                :style="{ backgroundColor: defectsStore.getStatusColor(defect.status) }"
              >
                {{ defectsStore.getStatusLabel(defect.status) }}
              </span>
              <span 
                class="priority-badge" 
                :style="{ backgroundColor: defectsStore.getPriorityColor(defect.priority) }"
              >
                {{ defectsStore.getPriorityLabel(defect.priority) }}
              </span>
            </div>
          </div>
          
          <div class="defect-actions" v-if="authStore.canManageProjects || authStore.user.id === defect.author_id">
            <button @click.stop="editDefect(defect)" class="btn-edit">✏️</button>
            <button @click.stop="deleteDefect(defect.id)" class="btn-delete">🗑️</button>
          </div>
        </div>

        <p class="defect-description" v-if="defect.description">
          {{ defect.description }}
        </p>

        <div class="defect-meta">
          <div class="meta-item">
            <strong>Проект:</strong> {{ defect.project_name }}
          </div>
          <div class="meta-item">
            <strong>Автор:</strong> {{ defect.author_name }}
          </div>
          <div class="meta-item" v-if="defect.assignee_name">
            <strong>Исполнитель:</strong> {{ defect.assignee_name }}
          </div>
          <div class="meta-item" v-else>
            <strong>Исполнитель:</strong> <span class="unassigned">Не назначен</span>
          </div>
          <div class="meta-item" v-if="defect.due_date">
            <strong>Срок:</strong> {{ formatDate(defect.due_date) }}
          </div>
          <div class="meta-item">
            <strong>Создан:</strong> {{ formatDate(defect.created_at) }}
          </div>
        </div>

        <div class="defect-actions-footer">
          <button 
            v-if="defect.status !== 'closed' && defect.status !== 'cancelled'"
            @click.stop="updateDefectStatus(defect.id, getNextStatus(defect.status))"
            class="btn-status"
          >
            {{ getNextStatusLabel(defect.status) }}
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно создания/редактирования дефекта -->
    <div v-if="showCreateModal || editingDefect" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <h3>{{ editingDefect ? 'Редактировать дефект' : 'Создать дефект' }}</h3>
        
        <form @submit.prevent="editingDefect ? updateDefectHandler() : createDefectHandler()">
          <div class="form-group">
            <label>Проект:</label>
            <select v-model="defectForm.project_id" required>
              <option value="">Выберите проект</option>
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
            <label>Название дефекта:</label>
            <input 
              v-model="defectForm.title" 
              type="text" 
              required 
              placeholder="Введите название дефекта"
            >
          </div>

          <div class="form-group">
            <label>Описание:</label>
            <textarea 
              v-model="defectForm.description" 
              placeholder="Подробное описание дефекта"
              rows="4"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Приоритет:</label>
              <select v-model="defectForm.priority" required>
                <option 
                  v-for="priority in defectsStore.priorities" 
                  :key="priority.value" 
                  :value="priority.value"
                >
                  {{ priority.label }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Исполнитель:</label>
              <select v-model="defectForm.assignee_id">
                <option value="">Не назначен</option>
                <option 
                  v-for="user in engineers" 
                  :key="user.id" 
                  :value="user.id"
                >
                  {{ user.full_name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Срок исправления:</label>
            <input 
              v-model="defectForm.due_date" 
              type="date"
            >
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-secondary">
              Отмена
            </button>
            <button type="submit" class="btn-primary" :disabled="!defectForm.title.trim() || !defectForm.project_id">
              {{ editingDefect ? 'Обновить' : 'Создать' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDefectsStore } from '@/stores/defects';
import { useProjectsStore } from '@/stores/projects';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const defectsStore = useDefectsStore();
const projectsStore = useProjectsStore();
const authStore = useAuthStore();

const showCreateModal = ref(false);
const editingDefect = ref(null);

const defectForm = reactive({
  project_id: '',
  title: '',
  description: '',
  priority: 'medium',
  assignee_id: '',
  due_date: ''
});

// Заглушка для пользователей (в реальном приложении нужно получать с API)
const users = computed(() => [
  { id: 1, full_name: 'Иван Инженеров', role: 'engineer' },
  { id: 2, full_name: 'Петр Менеджеров', role: 'manager' }
]);

const engineers = computed(() => 
  users.value.filter(user => user.role === 'engineer')
);

onMounted(async () => {
  try {
    await projectsStore.fetchProjects();
    await defectsStore.fetchDefects();
  } catch (error) {
    console.error('Error loading data:', error);
  }
});

const formatDate = (dateString) => {
  if (!dateString) return 'Не указан';
  return new Date(dateString).toLocaleDateString('ru-RU');
};

const getUserRoleLabel = (role) => {
  const roleLabels = {
    engineer: 'Инженер',
    manager: 'Менеджер',
    observer: 'Наблюдатель'
  };
  return roleLabels[role] || role;
};

const applyFilters = () => {
  defectsStore.fetchDefects();
};

const clearFilters = () => {
  defectsStore.filters.project_id = '';
  defectsStore.filters.status = '';
  defectsStore.filters.priority = '';
  defectsStore.filters.assignee_id = '';
  defectsStore.fetchDefects();
};

const viewDefect = (defectId) => {
  router.push(`/defects/${defectId}`);
};

const editDefect = (defect) => {
  editingDefect.value = defect;
  defectForm.project_id = defect.project_id;
  defectForm.title = defect.title;
  defectForm.description = defect.description || '';
  defectForm.priority = defect.priority;
  defectForm.assignee_id = defect.assignee_id || '';
  defectForm.due_date = defect.due_date || '';
};

const createDefectHandler = async () => {
  try {
    console.log('Creating defect with data:', defectForm);
    
    const result = await defectsStore.createDefect(defectForm);
    console.log('Defect created successfully:', result);
    closeModal();
  } catch (error) {
    console.error('Error creating defect:', error);
    alert('Ошибка при создании дефекта: ' + (error.response?.data?.error || error.message));
  }
};

const updateDefectHandler = async () => {
  try {
    console.log('Updating defect:', editingDefect.value.id, defectForm);
    
    const result = await defectsStore.updateDefect(editingDefect.value.id, defectForm);
    console.log('Defect updated successfully:', result);
    closeModal();
  } catch (error) {
    console.error('Error updating defect:', error);
    alert('Ошибка при обновлении дефекта: ' + (error.response?.data?.error || error.message));
  }
};

const deleteDefect = async (defectId) => {
  if (confirm('Вы уверены, что хотите удалить этот дефект?')) {
    try {
      await defectsStore.deleteDefect(defectId);
      console.log('Defect deleted successfully');
    } catch (error) {
      console.error('Error deleting defect:', error);
      alert('Ошибка при удалении дефекта: ' + (error.response?.data?.error || error.message));
    }
  }
};

const getNextStatus = (currentStatus) => {
  const statusFlow = {
    'new': 'in_progress',
    'in_progress': 'on_review',
    'on_review': 'closed',
    'closed': 'new',
    'cancelled': 'new'
  };
  return statusFlow[currentStatus] || 'new';
};

const getNextStatusLabel = (currentStatus) => {
  const nextStatus = getNextStatus(currentStatus);
  return defectsStore.getStatusLabel(nextStatus);
};

const updateDefectStatus = async (defectId, newStatus) => {
  try {
    await defectsStore.updateDefectStatus(defectId, newStatus);
    console.log('Defect status updated successfully');
  } catch (error) {
    console.error('Error updating defect status:', error);
    alert('Ошибка при обновлении статуса: ' + (error.response?.data?.error || error.message));
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  editingDefect.value = null;
  defectForm.project_id = '';
  defectForm.title = '';
  defectForm.description = '';
  defectForm.priority = 'medium';
  defectForm.assignee_id = '';
  defectForm.due_date = '';
};
</script>

<style scoped>
.defects-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.defects-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.defects-header h2 {
  color: #333;
}

.filters-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.filters-card h3 {
  margin-bottom: 1rem;
  color: #333;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

.filter-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 0.9rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.defects-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.defect-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.defect-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.defect-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.defect-title {
  flex: 1;
}

.defect-title h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.defect-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.status-badge, .priority-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
}

.defect-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit, .btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
}

.btn-edit:hover {
  color: #667eea;
}

.btn-delete:hover {
  color: #dc3545;
}

.defect-description {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.defect-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
}

.meta-item {
  color: #666;
}

.unassigned {
  color: #dc3545;
  font-style: italic;
}

.defect-actions-footer {
  display: flex;
  justify-content: flex-end;
}

.btn-status {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-status:hover {
  background: #5a6fd8;
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h3 {
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn-primary {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary:hover:not(:disabled) {
  background: #5a6fd8;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #5a6268;
}
</style>