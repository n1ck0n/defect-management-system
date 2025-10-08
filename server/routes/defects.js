const express = require('express');
const {
  createDefect,
  getDefects,
  getDefectById,
  updateDefect,
  updateDefectStatus,
  deleteDefect,
  getDefectsByProject,
  createComment,
  getDefectStats
} = require('../controllers/defectController');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { 
  validateDefect, 
  validateDefectStatus, 
  validateComment, 
  validateId, 
  validateQueryParams,
  handleValidationErrors 
} = require('../middleware/security');

const router = express.Router();

// Все routes требуют аутентификации
router.use(authenticateToken);

// GET /api/defects - Получение всех дефектов с фильтрацией
router.get('/', validateQueryParams, handleValidationErrors, getDefects);

// GET /api/defects/stats - Получение статистики
router.get('/stats', getDefectStats);

// GET /api/defects/project/:projectId - Получение дефектов по проекту
router.get('/project/:projectId', validateId, handleValidationErrors, getDefectsByProject);

// GET /api/defects/:id - Получение дефекта по ID
router.get('/:id', validateId, handleValidationErrors, getDefectById);

// POST /api/defects - Создание дефекта (инженеры и менеджеры)
router.post('/', requirePermission('create_defects'), validateDefect, handleValidationErrors, createDefect);

// PUT /api/defects/:id - Обновление дефекта (автор, менеджер или назначенный исполнитель)
router.put('/:id', validateId, validateDefect, handleValidationErrors, updateDefect);

// PATCH /api/defects/:id/status - Обновление статуса дефекта
router.patch('/:id/status', validateId, validateDefectStatus, handleValidationErrors, updateDefectStatus);

// DELETE /api/defects/:id - Удаление дефекта (автор или менеджер)
router.delete('/:id', validateId, handleValidationErrors, deleteDefect);

// POST /api/defects/:id/comments - Добавление комментария
router.post('/:id/comments', validateId, validateComment, handleValidationErrors, createComment);

module.exports = router;