const db = require('../database/db');

class Defect {
  // Создание нового дефекта
  static async create(defectData) {
    const {
      project_id,
      title,
      description,
      status = 'new',
      priority = 'medium',
      author_id,
      assignee_id = null,
      due_date = null
    } = defectData;
    
    const query = `
      INSERT INTO defects (project_id, title, description, status, priority, author_id, assignee_id, due_date) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *
    `;
    
    const result = await db.query(query, [
      project_id, title, description, status, priority, author_id, assignee_id, due_date
    ]);
    return result.rows[0];
  }

  // Получение всех дефектов с фильтрацией
  static async findAll(filters = {}) {
    let query = `
      SELECT 
        d.*,
        p.name as project_name,
        au.full_name as author_name,
        auu.full_name as assignee_name
      FROM defects d
      LEFT JOIN projects p ON d.project_id = p.id
      LEFT JOIN users au ON d.author_id = au.id
      LEFT JOIN users auu ON d.assignee_id = auu.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    // Фильтрация по проекту
    if (filters.project_id) {
      paramCount++;
      query += ` AND d.project_id = $${paramCount}`;
      params.push(filters.project_id);
    }

    // Фильтрация по статусу
    if (filters.status) {
      paramCount++;
      query += ` AND d.status = $${paramCount}`;
      params.push(filters.status);
    }

    // Фильтрация по приоритету
    if (filters.priority) {
      paramCount++;
      query += ` AND d.priority = $${paramCount}`;
      params.push(filters.priority);
    }

    // Фильтрация по исполнителю
    if (filters.assignee_id) {
      paramCount++;
      query += ` AND d.assignee_id = $${paramCount}`;
      params.push(filters.assignee_id);
    }

    // Сортировка
    query += ` ORDER BY 
      CASE priority 
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
      END,
      d.created_at DESC`;

    const result = await db.query(query, params);
    return result.rows;
  }

  // Получение дефекта по ID
  static async findById(id) {
    const query = `
      SELECT 
        d.*,
        p.name as project_name,
        au.full_name as author_name,
        auu.full_name as assignee_name
      FROM defects d
      LEFT JOIN projects p ON d.project_id = p.id
      LEFT JOIN users au ON d.author_id = au.id
      LEFT JOIN users auu ON d.assignee_id = auu.id
      WHERE d.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Обновление дефекта
  static async update(id, defectData) {
    const { title, description, status, priority, assignee_id, due_date } = defectData;
    
    const query = `
      UPDATE defects 
      SET title = $1, description = $2, status = $3, priority = $4, 
          assignee_id = $5, due_date = $6, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $7 
      RETURNING *
    `;
    
    const result = await db.query(query, [
      title, description, status, priority, assignee_id, due_date, id
    ]);
    return result.rows[0];
  }

  // Обновление статуса дефекта
  static async updateStatus(id, status) {
    const query = `
      UPDATE defects 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `;
    
    const result = await db.query(query, [status, id]);
    return result.rows[0];
  }

  // Удаление дефекта
  static async delete(id) {
    const query = 'DELETE FROM defects WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Получение дефектов по проекту
  static async findByProject(projectId) {
    const query = `
      SELECT 
        d.*,
        au.full_name as author_name,
        auu.full_name as assignee_name
      FROM defects d
      LEFT JOIN users au ON d.author_id = au.id
      LEFT JOIN users auu ON d.assignee_id = auu.id
      WHERE d.project_id = $1
      ORDER BY d.created_at DESC
    `;
    const result = await db.query(query, [projectId]);
    return result.rows;
  }

  // Получение статистики по дефектам
  static async getStats(projectId = null) {
    let query = `
      SELECT 
        status,
        priority,
        COUNT(*) as count
      FROM defects 
    `;
    const params = [];

    if (projectId) {
      query += ` WHERE project_id = $1`;
      params.push(projectId);
    }

    query += ` GROUP BY status, priority ORDER BY status, priority`;

    const result = await db.query(query, params);
    return result.rows;
  }
}

module.exports = Defect;