const Project = require('../models/Project');

// Создание проекта
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const created_by = req.user.id;

    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const project = await Project.create({ name, description, created_by });
    
    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получение всех проектов
const getProjects = async (req, res) => {
  try {
    const projects = await Project.findAll();
    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получение проекта по ID
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Получаем статистику по дефектам
    const stats = await Project.getStats(id);
    
    res.json({ 
      project: {
        ...project,
        stats
      }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Обновление проекта
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const project = await Project.update(id, { name, description });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Удаление проекта
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.delete(id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      message: 'Project deleted successfully',
      project
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
};