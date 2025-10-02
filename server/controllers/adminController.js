const User = require('../models/User');
const { requireRole } = require('../middleware/auth');

// Только менеджеры могут изменять роли пользователей
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Проверяем валидность роли
    if (!User.validRoles.includes(role)) {
      return res.status(400).json({ 
        error: `Invalid role. Allowed roles: ${User.validRoles.join(', ')}` 
      });
    }

    // Обновляем роль пользователя
    const query = `
      UPDATE users 
      SET role = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING id, email, full_name, role
    `;
    
    const result = await db.query(query, [role, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получение списка всех пользователей (для админки)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  updateUserRole,
  getAllUsers
};