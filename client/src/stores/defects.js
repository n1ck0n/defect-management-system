import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';

export const useDefectsStore = defineStore('defects', () => {
  const defects = ref([]);
  const currentDefect = ref(null);
  const filters = ref({
    project_id: '',
    status: '',
    priority: '',
    assignee_id: ''
  });
  const isLoading = ref(false);

  // Статусы и приоритеты для использования в интерфейсе
  const statuses = ref([
    { value: 'new', label: '🆕 Новая', color: '#6c757d' },
    { value: 'in_progress', label: '🔄 В работе', color: '#007bff' },
    { value: 'on_review', label: '👀 На проверке', color: '#ffc107' },
    { value: 'closed', label: '✅ Закрыта', color: '#28a745' },
    { value: 'cancelled', label: '❌ Отменена', color: '#dc3545' }
  ]);

  const priorities = ref([
    { value: 'low', label: '🔵 Низкий', color: '#6c757d' },
    { value: 'medium', label: '🟡 Средний', color: '#ffc107' },
    { value: 'high', label: '🟠 Высокий', color: '#fd7e14' },
    { value: 'critical', label: '🔴 Критический', color: '#dc3545' }
  ]);

  const fetchDefects = async (customFilters = {}) => {
    isLoading.value = true;
    try {
      const params = new URLSearchParams();
      
      // Объединяем стандартные фильтры с переданными
      const allFilters = { ...filters.value, ...customFilters };
      
      Object.keys(allFilters).forEach(key => {
        if (allFilters[key]) {
          params.append(key, allFilters[key]);
        }
      });

      const response = await api.get(`/defects?${params}`);
      defects.value = response.data.defects;
    } catch (error) {
      console.error('Error fetching defects:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchDefectById = async (id) => {
    isLoading.value = true;
    try {
      const response = await api.get(`/defects/${id}`);
      currentDefect.value = response.data.defect;
    } catch (error) {
      console.error('Error fetching defect:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchDefectsByProject = async (projectId) => {
    isLoading.value = true;
    try {
      const response = await api.get(`/defects/project/${projectId}`);
      defects.value = response.data.defects;
    } catch (error) {
      console.error('Error fetching project defects:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const createDefect = async (defectData) => {
    try {
      const response = await api.post('/defects', defectData);
      defects.value.unshift(response.data.defect);
      return response.data;
    } catch (error) {
      console.error('Error creating defect:', error);
      throw error;
    }
  };

  const updateDefect = async (id, defectData) => {
    try {
      const response = await api.put(`/defects/${id}`, defectData);
      const index = defects.value.findIndex(d => d.id === id);
      if (index !== -1) {
        defects.value[index] = response.data.defect;
      }
      if (currentDefect.value && currentDefect.value.id === id) {
        currentDefect.value = response.data.defect;
      }
      return response.data;
    } catch (error) {
      console.error('Error updating defect:', error);
      throw error;
    }
  };

  const updateDefectStatus = async (id, status) => {
    try {
      const response = await api.patch(`/defects/${id}/status`, { status });
      const index = defects.value.findIndex(d => d.id === id);
      if (index !== -1) {
        defects.value[index].status = status;
      }
      if (currentDefect.value && currentDefect.value.id === id) {
        currentDefect.value.status = status;
      }
      return response.data;
    } catch (error) {
      console.error('Error updating defect status:', error);
      throw error;
    }
  };

  const deleteDefect = async (id) => {
    try {
      await api.delete(`/defects/${id}`);
      defects.value = defects.value.filter(d => d.id !== id);
    } catch (error) {
      console.error('Error deleting defect:', error);
      throw error;
    }
  };

  const addComment = async (defectId, text) => {
    try {
      const response = await api.post(`/defects/${defectId}/comments`, { text });
      
      if (currentDefect.value && currentDefect.value.id === defectId) {
        if (!currentDefect.value.comments) {
          currentDefect.value.comments = [];
        }
        currentDefect.value.comments.push(response.data.comment);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  const getStatusLabel = (status) => {
    const statusObj = statuses.value.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  const getPriorityLabel = (priority) => {
    const priorityObj = priorities.value.find(p => p.value === priority);
    return priorityObj ? priorityObj.label : priority;
  };

  const getStatusColor = (status) => {
    const statusObj = statuses.value.find(s => s.value === status);
    return statusObj ? statusObj.color : '#6c757d';
  };

  const getPriorityColor = (priority) => {
    const priorityObj = priorities.value.find(p => p.value === priority);
    return priorityObj ? priorityObj.color : '#6c757d';
  };

  return {
    defects,
    currentDefect,
    filters,
    isLoading,
    statuses,
    priorities,
    fetchDefects,
    fetchDefectById,
    fetchDefectsByProject,
    createDefect,
    updateDefect,
    updateDefectStatus,
    deleteDefect,
    addComment,
    getStatusLabel,
    getPriorityLabel,
    getStatusColor,
    getPriorityColor
  };
});