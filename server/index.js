require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const defectRoutes = require('./routes/defects');
const userRoutes = require('./routes/users');
const reportRoutes = require('./routes/reports');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/defects', defectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

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
      users: '/api/users'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Available roles: engineer, manager, observer`);
});