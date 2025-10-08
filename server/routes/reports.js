const express = require('express');
const {
  getProjectsStats,
  getSystemStats,
  getDefectsByStatus,
  getDefectsByPriority,
  getMonthlyTrends,
  exportDefectsToCSV,
  getAssigneeStats
} = require('../controllers/reportController');
const { authenticateToken, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Все routes требуют аутентификации
router.use(authenticateToken);

// GET /api/reports/projects-stats - Статистика по проектам
router.get('/projects-stats', getProjectsStats);

// GET /api/reports/system-stats - Общая статистика системы
router.get('/system-stats', getSystemStats);

// GET /api/reports/defects-by-status - Статистика по статусам
router.get('/defects-by-status', getDefectsByStatus);

// GET /api/reports/defects-by-priority - Статистика по приоритетам
router.get('/defects-by-priority', getDefectsByPriority);

// GET /api/reports/monthly-trends - Тренды по месяцам
router.get('/monthly-trends', getMonthlyTrends);

// GET /api/reports/assignee-stats - Статистика по исполнителям
router.get('/assignee-stats', getAssigneeStats);

// GET /api/reports/export-defects - Экспорт дефектов в CSV
router.get('/export-defects', requirePermission('view_reports'), exportDefectsToCSV);

module.exports = router;