const User = require('../models/User');

// Получение всех пользователей
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получение пользователей по роли
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    
    if (!User.validRoles.includes(role)) {
      return res.status(400).json({ 
        error: `Invalid role. Allowed roles: ${User.validRoles.join(', ')}` 
      });
    }

    const users = await User.findByRole(role);
    res.json({ users });
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUsers,
  getUsersByRole
};