const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware для проверки JWT токена
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Middleware для проверки ролей
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions', 
        required: allowedRoles,
        current: req.user.role 
      });
    }

    next();
  };
};

// Middleware для проверки конкретных прав доступа
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!User.hasPermission(req.user.role, permission)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions for this action',
        required: permission,
        current: req.user.role
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission
};