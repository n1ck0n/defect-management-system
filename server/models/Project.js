const db = require('../database/db');

class Project {
  // Создание нового проекта
  static async create(projectData) {
    const { name, description, created_by } = projectData;
    
    const query = `
      INSERT INTO projects (name, description, created_by) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;
    
    const result = await db.query(query, [name, description, created_by]);
    return result.rows[0];
  }

  // Получение всех проектов
  static async findAll() {
    const query = `
      SELECT p.*, u.full_name as created_by_name 
      FROM projects p 
      LEFT JOIN users u ON p.created_by = u.id 
      ORDER BY p.created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  // Получение проекта по ID
  static async findById(id) {
    const query = `
      SELECT p.*, u.full_name as created_by_name 
      FROM projects p 
      LEFT JOIN users u ON p.created_by = u.id 
      WHERE p.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Обновление проекта
  static async update(id, projectData) {
    const { name, description } = projectData;
    
    const query = `
      UPDATE projects 
      SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $3 
      RETURNING *
    `;
    
    const result = await db.query(query, [name, description, id]);
    return result.rows[0];
  }

  // Удаление проекта
  static async delete(id) {
    const query = 'DELETE FROM projects WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Получение статистики по проекту (количество дефектов по статусам)
  static async getStats(projectId) {
    const query = `
      SELECT 
        status,
        COUNT(*) as count
      FROM defects 
      WHERE project_id = $1 
      GROUP BY status
    `;
    const result = await db.query(query, [projectId]);
    return result.rows;
  }
}

module.exports = Project;