const express = require('express');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { 
  validateProject, 
  validateId, 
  handleValidationErrors 
} = require('../middleware/security');

const router = express.Router();

// Все routes требуют аутентификации
router.use(authenticateToken);

// GET /api/projects - Получение всех проектов (все роли)
router.get('/', getProjects);

// GET /api/projects/:id - Получение проекта по ID (все роли)
router.get('/:id', validateId, handleValidationErrors, getProjectById);

// POST /api/projects - Создание проекта (только менеджеры)
router.post('/', requirePermission('manage_projects'), validateProject, handleValidationErrors, createProject);

// PUT /api/projects/:id - Обновление проекта (только менеджеры)
router.put('/:id', requirePermission('manage_projects'), validateId, validateProject, handleValidationErrors, updateProject);

// DELETE /api/projects/:id - Удаление проекта (только менеджеры)
router.delete('/:id', requirePermission('manage_projects'), validateId, handleValidationErrors, deleteProject);

module.exports = router;