const express = require('express');
const { updateUserRole, getAllUsers } = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Только менеджеры могут управлять пользователями
router.use(authenticateToken, requireRole(['manager']));

router.get('/users', getAllUsers);
router.patch('/users/:userId/role', updateUserRole);

module.exports = router;