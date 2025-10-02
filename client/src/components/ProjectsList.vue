<template>
  <div class="projects-container">
    <div class="projects-header">
      <h2>Проекты</h2>
      <button 
        v-if="authStore.canManageProjects" 
        @click="showCreateModal = true"
        class="btn-primary"
      >
        + Создать проект
      </button>
    </div>

    <div v-if="projectsStore.isLoading" class="loading">
      Загрузка проектов...
    </div>

    <div v-else-if="projectsStore.projects.length === 0" class="empty-state">
      <p>Проектов пока нет</p>
      <button 
        v-if="authStore.canManageProjects" 
        @click="showCreateModal = true"
        class="btn-primary"
      >
        Создать первый проект
      </button>
    </div>

    <div v-else class="projects-grid">
      <div 
        v-for="project in projectsStore.projects" 
        :key="project.id" 
        class="project-card"
        @click="viewProject(project.id)"
      >
        <div class="project-header">
          <h3>{{ project.name }}</h3>
          <div class="project-actions" v-if="authStore.canManageProjects">
            <button @click.stop="editProject(project)" class="btn-edit">✏️</button>
            <button @click.stop="deleteProject(project.id)" class="btn-delete">🗑️</button>
          </div>
        </div>
        
        <p class="project-description" v-if="project.description">
          {{ project.description }}
        </p>
        
        <div class="project-meta">
          <span>Создал: {{ project.created_by_name }}</span>
          <span>{{ formatDate(project.created_at) }}</span>
        </div>

        <div class="project-stats" v-if="project.stats">
          <div class="stat" v-for="stat in project.stats" :key="stat.status">
            <span class="stat-count">{{ stat.count }}</span>
            <span class="stat-label">{{ getStatusLabel(stat.status) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно создания/редактирования проекта -->
    <div v-if="showCreateModal || editingProject" class="modal-overlay">
      <div class="modal">
        <h3>{{ editingProject ? 'Редактировать проект' : 'Создать проект' }}</h3>
        
        <form @submit.prevent="editingProject ? updateProjectHandler() : createProjectHandler()">
          <div class="form-group">
            <label>Название проекта:</label>
            <input 
              v-model="projectForm.name" 
              type="text" 
              required 
              placeholder="Введите название проекта"
            >
          </div>

          <div class="form-group">
            <label>Описание (опционально):</label>
            <textarea 
              v-model="projectForm.description" 
              placeholder="Введите описание проекта"
              rows="3"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-secondary">
              Отмена
            </button>
            <button type="submit" class="btn-primary">
              {{ editingProject ? 'Обновить' : 'Создать' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectsStore } from '@/stores/projects';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const projectsStore = useProjectsStore();
const authStore = useAuthStore();

const showCreateModal = ref(false);
const editingProject = ref(null);

const projectForm = reactive({
  name: '',
  description: ''
});

onMounted(async () => {
  await projectsStore.fetchProjects();
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

const viewProject = (projectId) => {
  router.push(`/projects/${projectId}`);
};

const editProject = (project) => {
  editingProject.value = project;
  projectForm.name = project.name;
  projectForm.description = project.description || '';
};

const createProjectHandler = async () => {
  try {
    await projectsStore.createProject(projectForm);
    closeModal();
  } catch (error) {
    console.error('Error creating project:', error);
  }
};

const updateProjectHandler = async () => {
  try {
    await projectsStore.updateProject(editingProject.value.id, projectForm);
    closeModal();
  } catch (error) {
    console.error('Error updating project:', error);
  }
};

const deleteProject = async (projectId) => {
  if (confirm('Вы уверены, что хотите удалить этот проект?')) {
    try {
      await projectsStore.deleteProject(projectId);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  editingProject.value = null;
  projectForm.name = '';
  projectForm.description = '';
};
</script>

<style scoped>
.projects-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.projects-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.projects-header h2 {
  color: #333;
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

.btn-primary:hover {
  background: #5a6fd8;
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

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.project-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.project-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.project-header h3 {
  margin: 0;
  color: #333;
  flex: 1;
}

.project-actions {
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

.project-description {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.project-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 1rem;
}

.project-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 5px;
  min-width: 60px;
}

.stat-count {
  font-weight: bold;
  font-size: 1.2rem;
  color: #333;
}

.stat-label {
  font-size: 0.75rem;
  color: #666;
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
  max-width: 500px;
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

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.form-group input:focus,
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