const Defect = require('../models/Defect');
const Project = require('../models/Project');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'defect_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

// Статистика по проектам
const getProjectsStats = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id,
        p.name,
        COUNT(d.id) as total_defects,
        COUNT(CASE WHEN d.status IN ('new', 'in_progress', 'on_review') THEN 1 END) as open_defects,
        COUNT(CASE WHEN d.status = 'closed' THEN 1 END) as closed_defects,
        COUNT(CASE WHEN d.priority = 'critical' THEN 1 END) as critical_defects,
        COUNT(CASE WHEN d.due_date < CURRENT_DATE AND d.status IN ('new', 'in_progress', 'on_review') THEN 1 END) as overdue_defects
      FROM projects p
      LEFT JOIN defects d ON p.id = d.project_id
      GROUP BY p.id, p.name
      ORDER BY p.name
    `;
    
    const result = await pool.query(query);
    res.json({ projects: result.rows });
  } catch (error) {
    console.error('Get projects stats error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Общая статистика системы
const getSystemStats = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(DISTINCT p.id) as total_projects,
        COUNT(DISTINCT d.id) as total_defects,
        COUNT(DISTINCT CASE WHEN d.status IN ('new', 'in_progress', 'on_review') THEN d.id END) as open_defects,
        COUNT(DISTINCT CASE WHEN d.status = 'closed' THEN d.id END) as closed_defects,
        COUNT(DISTINCT CASE WHEN d.priority = 'critical' THEN d.id END) as critical_defects,
        COUNT(DISTINCT CASE WHEN d.due_date < CURRENT_DATE AND d.status IN ('new', 'in_progress', 'on_review') THEN d.id END) as overdue_defects,
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT CASE WHEN u.role = 'engineer' THEN u.id END) as engineers,
        COUNT(DISTINCT CASE WHEN u.role = 'manager' THEN u.id END) as managers,
        COUNT(DISTINCT CASE WHEN u.role = 'observer' THEN u.id END) as observers
      FROM projects p
      CROSS JOIN users u
      LEFT JOIN defects d ON p.id = d.project_id
    `;
    
    const result = await pool.query(query);
    res.json({ stats: result.rows[0] });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Статистика по статусам дефектов
const getDefectsByStatus = async (req, res) => {
  try {
    const query = `
      SELECT 
        status,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM defects), 2) as percentage
      FROM defects 
      GROUP BY status 
      ORDER BY count DESC
    `;
    
    const result = await pool.query(query);
    res.json({ statusStats: result.rows });
  } catch (error) {
    console.error('Get defects by status error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Статистика по приоритетам дефектов
const getDefectsByPriority = async (req, res) => {
  try {
    const query = `
      SELECT 
        priority,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM defects), 2) as percentage
      FROM defects 
      GROUP BY priority 
      ORDER BY 
        CASE priority 
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END
    `;
    
    const result = await pool.query(query);
    res.json({ priorityStats: result.rows });
  } catch (error) {
    console.error('Get defects by priority error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Тренды по месяцам
const getMonthlyTrends = async (req, res) => {
  try {
    const query = `
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*) as defects_created,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as defects_closed
      FROM defects 
      WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month
    `;
    
    const result = await pool.query(query);
    res.json({ trends: result.rows });
  } catch (error) {
    console.error('Get monthly trends error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Экспорт дефектов в CSV
const exportDefectsToCSV = async (req, res) => {
  try {
    const { project_id, status, priority } = req.query;
    
    let query = `
      SELECT 
        d.id,
        p.name as project_name,
        d.title,
        d.description,
        d.status,
        d.priority,
        au.full_name as author_name,
        auu.full_name as assignee_name,
        d.due_date,
        d.created_at
      FROM defects d
      LEFT JOIN projects p ON d.project_id = p.id
      LEFT JOIN users au ON d.author_id = au.id
      LEFT JOIN users auu ON d.assignee_id = auu.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    if (project_id) {
      paramCount++;
      query += ` AND d.project_id = $${paramCount}`;
      params.push(project_id);
    }

    if (status) {
      paramCount++;
      query += ` AND d.status = $${paramCount}`;
      params.push(status);
    }

    if (priority) {
      paramCount++;
      query += ` AND d.priority = $${paramCount}`;
      params.push(priority);
    }

    query += ` ORDER BY d.created_at DESC`;

    const result = await pool.query(query, params);
    
    // Формируем CSV
    const headers = ['ID', 'Проект', 'Заголовок', 'Описание', 'Статус', 'Приоритет', 'Автор', 'Исполнитель', 'Срок', 'Дата создания'];
    const csvRows = [headers.join(',')];
    
    result.rows.forEach(row => {
      const values = [
        row.id,
        `"${row.project_name}"`,
        `"${row.title}"`,
        `"${(row.description || '').replace(/"/g, '""')}"`,
        row.status,
        row.priority,
        `"${row.author_name}"`,
        `"${row.assignee_name || 'Не назначен'}"`,
        row.due_date || '',
        row.created_at
      ];
      csvRows.push(values.join(','));
    });
    
    const csv = csvRows.join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=defects.csv');
    res.send(csv);
    
  } catch (error) {
    console.error('Export defects to CSV error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Статистика эффективности по исполнителям
const getAssigneeStats = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.full_name,
        u.role,
        COUNT(d.id) as total_assigned,
        COUNT(CASE WHEN d.status = 'closed' THEN 1 END) as closed_defects,
        COUNT(CASE WHEN d.status IN ('new', 'in_progress', 'on_review') THEN 1 END) as open_defects,
        COUNT(CASE WHEN d.due_date < CURRENT_DATE AND d.status IN ('new', 'in_progress', 'on_review') THEN 1 END) as overdue_defects,
        ROUND(
          COUNT(CASE WHEN d.status = 'closed' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(d.id), 0), 
          2
        ) as completion_rate
      FROM users u
      LEFT JOIN defects d ON u.id = d.assignee_id
      WHERE u.role = 'engineer'
      GROUP BY u.id, u.full_name, u.role
      ORDER BY total_assigned DESC
    `;
    
    const result = await pool.query(query);
    res.json({ assigneeStats: result.rows });
  } catch (error) {
    console.error('Get assignee stats error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProjectsStats,
  getSystemStats,
  getDefectsByStatus,
  getDefectsByPriority,
  getMonthlyTrends,
  exportDefectsToCSV,
  getAssigneeStats
};