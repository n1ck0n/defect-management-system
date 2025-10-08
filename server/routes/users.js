const express = require('express');
const { getUsers, getUsersByRole } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Все routes требуют аутентификации
router.use(authenticateToken);

// GET /api/users - Получение всех пользователей
router.get('/', getUsers);

// GET /api/users/role/:role - Получение пользователей по роли
router.get('/role/:role', getUsersByRole);

module.exports = router;