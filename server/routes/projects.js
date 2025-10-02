const express = require('express');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { authenticateToken, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Все routes требуют аутентификации
router.use(authenticateToken);

// GET /api/projects - Получение всех проектов (все роли)
router.get('/', getProjects);

// GET /api/projects/:id - Получение проекта по ID (все роли)
router.get('/:id', getProjectById);

// POST /api/projects - Создание проекта (только менеджеры)
router.post('/', requirePermission('manage_projects'), createProject);

// PUT /api/projects/:id - Обновление проекта (только менеджеры)
router.put('/:id', requirePermission('manage_projects'), updateProject);

// DELETE /api/projects/:id - Удаление проекта (только менеджеры)
router.delete('/:id', requirePermission('manage_projects'), deleteProject);

module.exports = router;