const { validationResult, body, param, query } = require('express-validator');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Валидация для регистрации пользователя
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Введите корректный email адрес'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Пароль должен содержать минимум 6 символов')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('Пароль должен содержать буквы и цифры'),
  body('full_name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('ФИО должно содержать от 2 до 255 символов')
    .escape(),
];

// Валидация для входа
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Введите корректный email адрес'),
  body('password')
    .notEmpty()
    .withMessage('Пароль обязателен'),
];

// Валидация для создания проекта
const validateProject = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Название проекта должно содержать от 2 до 255 символов')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Описание не должно превышать 1000 символов')
    .customSanitizer(value => DOMPurify.sanitize(value)),
];

// Валидация для создания дефекта
const validateDefect = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('Заголовок дефекта должен содержать от 5 до 255 символов')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Описание не должно превышать 2000 символов')
    .customSanitizer(value => DOMPurify.sanitize(value)),
  body('project_id')
    .isInt({ min: 1 })
    .withMessage('ID проекта должен быть положительным числом'),
  body('priority')
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Неверный приоритет'),
  body('assignee_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID исполнителя должен быть положительным числом'),
  body('due_date')
    .optional()
    .isDate()
    .withMessage('Неверный формат даты'),
];

// Валидация для обновления статуса дефекта
const validateDefectStatus = [
  body('status')
    .isIn(['new', 'in_progress', 'on_review', 'closed', 'cancelled'])
    .withMessage('Неверный статус'),
];

// Валидация для комментариев
const validateComment = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Комментарий должен содержать от 1 до 1000 символов')
    .customSanitizer(value => DOMPurify.sanitize(value)),
];

// Валидация ID в параметрах
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID должен быть положительным числом'),
];

// Валидация query параметров
const validateQueryParams = [
  query('project_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('project_id должен быть положительным числом'),
  query('status')
    .optional()
    .isIn(['new', 'in_progress', 'on_review', 'closed', 'cancelled'])
    .withMessage('Неверный статус'),
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Неверный приоритет'),
  query('assignee_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('assignee_id должен быть положительным числом'),
];

// Middleware для обработки ошибок валидации
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Ошибка валидации данных',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Middleware для санитизации JSON данных
const sanitizeJson = (req, res, next) => {
  if (req.body) {
    // Рекурсивно очищаем все строковые значения в body
    const sanitizeObject = (obj) => {
      if (typeof obj === 'string') {
        return DOMPurify.sanitize(obj);
      }
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      if (obj && typeof obj === 'object') {
        const sanitized = {};
        for (const key in obj) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
        return sanitized;
      }
      return obj;
    };
    
    req.body = sanitizeObject(req.body);
  }
  next();
};

// Middleware для ограничения размера запроса
const limitRequestBody = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  if (contentLength > 10 * 1024 * 1024) { // 10MB limit
    return res.status(413).json({
      error: 'Слишком большой размер запроса'
    });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateProject,
  validateDefect,
  validateDefectStatus,
  validateComment,
  validateId,
  validateQueryParams,
  handleValidationErrors,
  sanitizeJson,
  limitRequestBody
};