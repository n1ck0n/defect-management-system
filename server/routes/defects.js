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

const router = express.Router();

// Все routes требуют аутентификации
router.use(authenticateToken);

// GET /api/defects - Получение всех дефектов с фильтрацией
router.get('/', getDefects);

// GET /api/defects/stats - Получение статистики
router.get('/stats', getDefectStats);

// GET /api/defects/project/:projectId - Получение дефектов по проекту
router.get('/project/:projectId', getDefectsByProject);

// GET /api/defects/:id - Получение дефекта по ID
router.get('/:id', getDefectById);

// POST /api/defects - Создание дефекта (инженеры и менеджеры)
router.post('/', requirePermission('create_defects'), createDefect);

// PUT /api/defects/:id - Обновление дефекта (автор, менеджер или назначенный исполнитель)
router.put('/:id', updateDefect);

// PATCH /api/defects/:id/status - Обновление статуса дефекта
router.patch('/:id/status', updateDefectStatus);

// DELETE /api/defects/:id - Удаление дефекта (автор или менеджер)
router.delete('/:id', deleteDefect);

// POST /api/defects/:id/comments - Добавление комментария
router.post('/:id/comments', createComment);

module.exports = router;