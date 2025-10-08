require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const defectRoutes = require('./routes/defects');
const userRoutes = require('./routes/users');
const reportRoutes = require('./routes/reports');
const backupRoutes = require('./routes/backup');
const AutoBackupService = require('./scripts/auto-backup');
const { authenticateToken } = require('./middleware/auth');

// Импортируем security middleware
const helmetConfig = require('./middleware/helmetConfig');
const { sanitizeJson, limitRequestBody } = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware (должны быть первыми)
app.use(helmetConfig);
app.use(limitRequestBody);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing with limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Санитизация данных
app.use(sanitizeJson);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/defects', defectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/backup', backupRoutes);

// Protected test route
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ 
    message: 'This is protected data!', 
    user: req.user 
  });
});

// Basic route for testing
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Defect Management System API is working!',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      defects: '/api/defects',
      users: '/api/users',
      reports: '/api/reports'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ 
      error: 'Неверный формат JSON в теле запроса' 
    });
  }
  
  res.status(500).json({ 
    error: 'Внутренняя ошибка сервера',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Маршрут не найден' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔒 Security features enabled`);
  console.log(`📊 Available roles: engineer, manager, observer`);
});

// 🔐 АВТОМАТИЧЕСКОЕ РЕЗЕРВНОЕ КОПИРОВАНИЕ
if (process.env.AUTO_BACKUP === 'true') {
  try {
    const AutoBackupService = require('./scripts/auto-backup');
    const autoBackup = new AutoBackupService();
    autoBackup.startDailyBackup();
    console.log('✅ Автоматическое бэкапирование запущено (ежедневно в 2:00)');
  } catch (error) {
    console.error('❌ Ошибка запуска автоматического бэкапа:', error.message);
  }
}