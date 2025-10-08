import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';

export const useReportsStore = defineStore('reports', () => {
  const projectsStats = ref([]);
  const systemStats = ref({});
  const statusStats = ref([]);
  const priorityStats = ref([]);
  const monthlyTrends = ref([]);
  const assigneeStats = ref([]);
  const isLoading = ref(false);

  const fetchProjectsStats = async () => {
    isLoading.value = true;
    try {
      const response = await api.get('/reports/projects-stats');
      projectsStats.value = response.data.projects;
    } catch (error) {
      console.error('Error fetching projects stats:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchSystemStats = async () => {
    isLoading.value = true;
    try {
      const response = await api.get('/reports/system-stats');
      systemStats.value = response.data.stats;
    } catch (error) {
      console.error('Error fetching system stats:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchStatusStats = async () => {
    isLoading.value = true;
    try {
      const response = await api.get('/reports/defects-by-status');
      statusStats.value = response.data.statusStats;
    } catch (error) {
      console.error('Error fetching status stats:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchPriorityStats = async () => {
    isLoading.value = true;
    try {
      const response = await api.get('/reports/defects-by-priority');
      priorityStats.value = response.data.priorityStats;
    } catch (error) {
      console.error('Error fetching priority stats:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchMonthlyTrends = async () => {
    isLoading.value = true;
    try {
      const response = await api.get('/reports/monthly-trends');
      monthlyTrends.value = response.data.trends;
    } catch (error) {
      console.error('Error fetching monthly trends:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchAssigneeStats = async () => {
    isLoading.value = true;
    try {
      const response = await api.get('/reports/assignee-stats');
      assigneeStats.value = response.data.assigneeStats;
    } catch (error) {
      console.error('Error fetching assignee stats:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const exportDefectsToCSV = async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/reports/export-defects?${params}`, {
        responseType: 'blob'
      });

      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'defects.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error exporting defects:', error);
      throw error;
    }
  };

  return {
    projectsStats,
    systemStats,
    statusStats,
    priorityStats,
    monthlyTrends,
    assigneeStats,
    isLoading,
    fetchProjectsStats,
    fetchSystemStats,
    fetchStatusStats,
    fetchPriorityStats,
    fetchMonthlyTrends,
    fetchAssigneeStats,
    exportDefectsToCSV
  };
});