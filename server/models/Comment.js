const db = require('../database/db');

class Comment {
  // Создание нового комментария
  static async create(commentData) {
    const { defect_id, user_id, text } = commentData;
    
    const query = `
      INSERT INTO comments (defect_id, user_id, text) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;
    
    const result = await db.query(query, [defect_id, user_id, text]);
    return result.rows[0];
  }

  // Получение комментариев для дефекта
  static async findByDefectId(defectId) {
    const query = `
      SELECT 
        c.*,
        u.full_name as user_name,
        u.role as user_role
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.defect_id = $1
      ORDER BY c.created_at ASC
    `;
    const result = await db.query(query, [defectId]);
    return result.rows;
  }

  // Удаление комментария
  static async delete(id) {
    const query = 'DELETE FROM comments WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Comment;