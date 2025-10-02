<template>
  <div class="defect-detail">
    <div class="defect-header">
      <button @click="$router.back()" class="back-btn">← Назад</button>
      <h1>{{ defect?.title }}</h1>
    </div>

    <div v-if="defectsStore.isLoading" class="loading">
      Загрузка дефекта...
    </div>

    <div v-else-if="defect" class="defect-content">
      <div class="defect-main">
        <!-- Основная информация о дефекте -->
        <div class="info-card">
          <div class="card-header">
            <h2>Информация о дефекте</h2>
            <div class="defect-actions" v-if="authStore.canManageProjects || authStore.user.id === defect.author_id">
              <button @click="editDefect" class="btn-edit">✏️ Редактировать</button>
              <button @click="deleteDefect" class="btn-delete">🗑️ Удалить</button>
            </div>
          </div>

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

          <div class="defect-description">
            <h3>Описание</h3>
            <p v-if="defect.description">{{ defect.description }}</p>
            <p v-else class="no-description">Описание отсутствует</p>
          </div>

          <div class="defect-meta-grid">
            <div class="meta-item">
              <strong>Проект:</strong>
              <span>{{ defect.project_name }}</span>
            </div>
            <div class="meta-item">
              <strong>Автор:</strong>
              <span>{{ defect.author_name }}</span>
            </div>
            <div class="meta-item">
              <strong>Исполнитель:</strong>
              <span v-if="defect.assignee_name">{{ defect.assignee_name }}</span>
              <span v-else class="unassigned">Не назначен</span>
            </div>
            <div class="meta-item">
              <strong>Создан:</strong>
              <span>{{ formatDate(defect.created_at) }}</span>
            </div>
            <div class="meta-item">
              <strong>Обновлен:</strong>
              <span>{{ formatDate(defect.updated_at) }}</span>
            </div>
            <div class="meta-item" v-if="defect.due_date">
              <strong>Срок исправления:</strong>
              <span :class="{ 'overdue': isOverdue(defect.due_date) }">
                {{ formatDate(defect.due_date) }}
                <span v-if="isOverdue(defect.due_date)" class="overdue-badge">ПРОСРОЧЕНО</span>
              </span>
            </div>
          </div>

          <!-- Управление статусом -->
          <div class="status-management" v-if="defect.status !== 'closed' && defect.status !== 'cancelled'">
            <h3>Изменить статус</h3>
            <div class="status-buttons">
              <button 
                v-for="status in availableStatuses" 
                :key="status.value"
                @click="updateDefectStatus(status.value)"
                class="status-btn"
                :style="{ backgroundColor: status.color }"
              >
                {{ status.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Система комментариев -->
        <div class="comments-card">
          <h2>Комментарии ({{ defect.comments ? defect.comments.length : 0 }})</h2>
          
          <div class="comment-form">
            <textarea 
              v-model="newComment" 
              placeholder="Добавить комментарий..."
              rows="3"
            ></textarea>
            <button 
              @click="addComment" 
              class="btn-primary"
              :disabled="!newComment.trim()"
            >
              Добавить комментарий
            </button>
          </div>

          <div v-if="defect.comments && defect.comments.length > 0" class="comments-list">
            <div 
              v-for="comment in defect.comments" 
              :key="comment.id" 
              class="comment-item"
            >
              <div class="comment-header">
                <div class="comment-author">
                  <strong>{{ comment.user_name }}</strong>
                  <span class="comment-role">({{ getUserRoleLabel(comment.user_role) }})</span>
                </div>
                <span class="comment-date">{{ formatDateTime(comment.created_at) }}</span>
              </div>
              <div class="comment-text">
                {{ comment.text }}
              </div>
            </div>
          </div>
          
          <div v-else class="no-comments">
            <p>Комментариев пока нет</p>
          </div>
        </div>
      </div>

      <!-- Боковая панель с действиями -->
      <div class="defect-sidebar">
        <div class="actions-card">
          <h3>Быстрые действия</h3>
          <button 
            @click="updateDefectStatus(getNextStatus(defect.status))"
            class="action-btn primary"
            v-if="defect.status !== 'closed' && defect.status !== 'cancelled'"
          >
            {{ getNextStatusLabel(defect.status) }}
          </button>
          
          <button 
            @click="updateDefectStatus('closed')"
            class="action-btn success"
            v-if="defect.status !== 'closed'"
          >
            ✅ Закрыть дефект
          </button>
          
          <button 
            @click="updateDefectStatus('cancelled')"
            class="action-btn danger"
            v-if="defect.status !== 'cancelled'"
          >
            ❌ Отменить дефект
          </button>

          <router-link 
            :to="`/projects/${defect.project_id}`" 
            class="action-btn secondary"
          >
            📋 К проекту
          </router-link>
        </div>

        <div class="history-card" v-if="false"> <!-- Заглушка для истории изменений -->
          <h3>История изменений</h3>
          <p class="coming-soon">Функция в разработке</p>
        </div>
      </div>
    </div>

    <!-- Модальное окно редактирования дефекта -->
    <div v-if="editingDefect" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <h3>Редактировать дефект</h3>
        
        <form @submit.prevent="updateDefectHandler()">
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
            <button type="submit" class="btn-primary" :disabled="!defectForm.title.trim()">
              Обновить
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDefectsStore } from '@/stores/defects';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const defectsStore = useDefectsStore();
const authStore = useAuthStore();

const defect = computed(() => defectsStore.currentDefect);
const editingDefect = ref(false);
const newComment = ref('');

const defectForm = reactive({
  title: '',
  description: '',
  priority: 'medium',
  assignee_id: '',
  due_date: ''
});

// Заглушка для пользователей
const engineers = computed(() => [
  { id: 1, full_name: 'Иван Инженеров', role: 'engineer' },
  { id: 2, full_name: 'Петр Менеджеров', role: 'manager' }
]);

onMounted(async () => {
  try {
    await defectsStore.fetchDefectById(route.params.id);
  } catch (error) {
    console.error('Error loading defect:', error);
  }
});

const formatDate = (dateString) => {
  if (!dateString) return 'Не указан';
  return new Date(dateString).toLocaleDateString('ru-RU');
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'Не указан';
  return new Date(dateString).toLocaleString('ru-RU');
};

const getUserRoleLabel = (role) => {
  const roleLabels = {
    engineer: 'Инженер',
    manager: 'Менеджер',
    observer: 'Наблюдатель'
  };
  return roleLabels[role] || role;
};

const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
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

// Доступные статусы для изменения
const availableStatuses = computed(() => {
  if (!defect.value) return [];
  
  const currentStatus = defect.value.status;
  const allStatuses = defectsStore.statuses;
  
  // Фильтруем текущий статус и возвращаем остальные
  return allStatuses.filter(status => status.value !== currentStatus);
});

const editDefect = () => {
  editingDefect.value = true;
  defectForm.title = defect.value.title;
  defectForm.description = defect.value.description || '';
  defectForm.priority = defect.value.priority;
  defectForm.assignee_id = defect.value.assignee_id || '';
  defectForm.due_date = defect.value.due_date || '';
};

const updateDefectHandler = async () => {
  try {
    console.log('Updating defect:', defect.value.id, defectForm);
    
    const result = await defectsStore.updateDefect(defect.value.id, defectForm);
    console.log('Defect updated successfully:', result);
    closeModal();
  } catch (error) {
    console.error('Error updating defect:', error);
    alert('Ошибка при обновлении дефекта: ' + (error.response?.data?.error || error.message));
  }
};

const deleteDefect = async () => {
  if (confirm('Вы уверены, что хотите удалить этот дефект?')) {
    try {
      await defectsStore.deleteDefect(defect.value.id);
      router.push('/defects');
    } catch (error) {
      console.error('Error deleting defect:', error);
      alert('Ошибка при удалении дефекта: ' + (error.response?.data?.error || error.message));
    }
  }
};

const updateDefectStatus = async (newStatus) => {
  try {
    await defectsStore.updateDefectStatus(defect.value.id, newStatus);
    console.log('Defect status updated successfully');
  } catch (error) {
    console.error('Error updating defect status:', error);
    alert('Ошибка при обновлении статуса: ' + (error.response?.data?.error || error.message));
  }
};

const addComment = async () => {
  if (!newComment.value.trim()) return;
  
  try {
    await defectsStore.addComment(defect.value.id, newComment.value.trim());
    newComment.value = '';
  } catch (error) {
    console.error('Error adding comment:', error);
    alert('Ошибка при добавлении комментария: ' + (error.response?.data?.error || error.message));
  }
};

const closeModal = () => {
  editingDefect.value = false;
  defectForm.title = '';
  defectForm.description = '';
  defectForm.priority = 'medium';
  defectForm.assignee_id = '';
  defectForm.due_date = '';
};
</script>

<style scoped>
.defect-detail {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.defect-header {
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

.defect-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.defect-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-card, .comments-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.card-header h2 {
  margin: 0;
  color: #333;
}

.defect-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit, .btn-delete {
  background: none;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-edit:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.btn-delete:hover {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.defect-badges {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.status-badge, .priority-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  color: white;
  font-weight: 500;
  font-size: 0.9rem;
}

.defect-description h3 {
  margin-bottom: 0.5rem;
  color: #333;
}

.no-description {
  color: #888;
  font-style: italic;
}

.defect-meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.meta-item strong {
  color: #555;
  font-size: 0.9rem;
}

.unassigned {
  color: #dc3545;
  font-style: italic;
}

.overdue {
  color: #dc3545;
  font-weight: bold;
}

.overdue-badge {
  background: #dc3545;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  margin-left: 0.5rem;
}

.status-management {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.status-management h3 {
  margin-bottom: 1rem;
  color: #333;
}

.status-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.status-btn {
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
}

.comments-card h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.comment-form {
  margin-bottom: 2rem;
}

.comment-form textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  margin-bottom: 1rem;
  resize: vertical;
}

.comment-form textarea:focus {
  outline: none;
  border-color: #667eea;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.comment-item {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.comment-role {
  color: #666;
  font-size: 0.8rem;
}

.comment-date {
  color: #888;
  font-size: 0.8rem;
}

.comment-text {
  color: #333;
  line-height: 1.5;
}

.no-comments {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.defect-sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.actions-card, .history-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.actions-card h3, .history-card h3 {
  margin-bottom: 1rem;
  color: #333;
}

.action-btn {
  display: block;
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 0.5rem;
  text-align: center;
  text-decoration: none;
  font-size: 0.9rem;
}

.action-btn.primary {
  background: #667eea;
  color: white;
}

.action-btn.primary:hover {
  background: #5a6fd8;
}

.action-btn.success {
  background: #28a745;
  color: white;
}

.action-btn.success:hover {
  background: #218838;
}

.action-btn.danger {
  background: #dc3545;
  color: white;
}

.action-btn.danger:hover {
  background: #c82333;
}

.action-btn.secondary {
  background: #6c757d;
  color: white;
}

.action-btn.secondary:hover {
  background: #5a6268;
}

.coming-soon {
  color: #888;
  font-style: italic;
  text-align: center;
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