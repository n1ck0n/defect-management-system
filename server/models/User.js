const db = require('../database/db');
const bcrypt = require('bcryptjs');

class User {
  // Валидация ролей согласно ТЗ
  static validRoles = ['engineer', 'manager', 'observer'];

  // Создание нового пользователя
  static async create(userData) {
    const { email, password, full_name, role = 'engineer' } = userData;
    
    // Проверяем валидность роли
    if (!this.validRoles.includes(role)) {
      throw new Error(`Invalid role. Allowed roles: ${this.validRoles.join(', ')}`);
    }
    
    // Хешируем пароль
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO users (email, password_hash, full_name, role) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, email, full_name, role, created_at
    `;
    
    const result = await db.query(query, [email, password_hash, full_name, role]);
    return result.rows[0];
  }

  // Поиск пользователя по email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  // Поиск пользователя по ID
  static async findById(id) {
    const query = 'SELECT id, email, full_name, role, created_at FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Получение всех пользователей (для назначения исполнителей)
  static async findAll() {
    const query = 'SELECT id, email, full_name, role FROM users ORDER BY full_name';
    const result = await db.query(query);
    return result.rows;
  }

  // Получение пользователей по роли
  static async findByRole(role) {
    if (!this.validRoles.includes(role)) {
      throw new Error(`Invalid role. Allowed roles: ${this.validRoles.join(', ')}`);
    }
    
    const query = 'SELECT id, email, full_name, role FROM users WHERE role = $1 ORDER BY full_name';
    const result = await db.query(query, [role]);
    return result.rows;
  }

  // Проверка пароля
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Проверка прав доступа
  static hasPermission(userRole, requiredPermission) {
    const permissions = {
      engineer: ['view_projects', 'view_defects', 'create_defects', 'update_defects', 'add_comments'],
      manager: ['view_projects', 'view_defects', 'create_defects', 'update_defects', 'add_comments', 'assign_tasks', 'manage_projects', 'view_reports'],
      observer: ['view_projects', 'view_defects', 'view_reports']
    };

    return permissions[userRole]?.includes(requiredPermission) || false;
  }
}

module.exports = User;