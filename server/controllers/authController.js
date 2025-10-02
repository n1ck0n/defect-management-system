const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Генерация JWT токена
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// Регистрация пользователя
const register = async (req, res) => {
  try {
    const { email, password, full_name, role = 'engineer' } = req.body;

    // Проверяем обязательные поля
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password and full name are required' });
    }

    // Проверяем, не существует ли уже пользователь с таким email
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Создаем пользователя
    const user = await User.create({ email, password, full_name, role });
    
    // Генерируем токен
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Вход пользователя
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Проверяем обязательные поля
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Ищем пользователя
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Проверяем пароль
    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Генерируем токен
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получение информации о текущем пользователе
const getMe = async (req, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe
};