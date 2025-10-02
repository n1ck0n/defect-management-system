import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref([]);
  const currentProject = ref(null);
  const isLoading = ref(false);

  const fetchProjects = async () => {
    isLoading.value = true;
    try {
      const response = await api.get('/projects');
      projects.value = response.data.projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchProjectById = async (id) => {
    isLoading.value = true;
    try {
      const response = await api.get(`/projects/${id}`);
      currentProject.value = response.data.project;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const createProject = async (projectData) => {
    try {
      const response = await api.post('/projects', projectData);
      projects.value.unshift(response.data.project);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const updateProject = async (id, projectData) => {
    try {
      const response = await api.put(`/projects/${id}`, projectData);
      const index = projects.value.findIndex(p => p.id === id);
      if (index !== -1) {
        projects.value[index] = response.data.project;
      }
      return response.data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  const deleteProject = async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      projects.value = projects.value.filter(p => p.id !== id);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };

  return {
    projects,
    currentProject,
    isLoading,
    fetchProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject
  };
});