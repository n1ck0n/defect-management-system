const Defect = require('../models/Defect');
const Comment = require('../models/Comment');

// Создание дефекта
const createDefect = async (req, res) => {
  try {
    const { project_id, title, description, priority, assignee_id, due_date } = req.body;
    const author_id = req.user.id;

    if (!project_id || !title) {
      return res.status(400).json({ error: 'Project ID and title are required' });
    }

    const defect = await Defect.create({
      project_id,
      title,
      description,
      priority,
      author_id,
      assignee_id,
      due_date
    });
    
    res.status(201).json({
      message: 'Defect created successfully',
      defect
    });
  } catch (error) {
    console.error('Create defect error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получение всех дефектов с фильтрацией
const getDefects = async (req, res) => {
  try {
    const filters = {};
    
    // Поддерживаемые фильтры
    if (req.query.project_id) filters.project_id = req.query.project_id;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.priority) filters.priority = req.query.priority;
    if (req.query.assignee_id) filters.assignee_id = req.query.assignee_id;

    const defects = await Defect.findAll(filters);
    res.json({ defects });
  } catch (error) {
    console.error('Get defects error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получение дефекта по ID
const getDefectById = async (req, res) => {
  try {
    const { id } = req.params;
    const defect = await Defect.findById(id);

    if (!defect) {
      return res.status(404).json({ error: 'Defect not found' });
    }

    // Получаем комментарии для этого дефекта
    const comments = await Comment.findByDefectId(id);
    
    res.json({ 
      defect: {
        ...defect,
        comments
      }
    });
  } catch (error) {
    console.error('Get defect error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Обновление дефекта
const updateDefect = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assignee_id, due_date } = req.body;

    const defect = await Defect.update(id, {
      title, description, status, priority, assignee_id, due_date
    });
    
    if (!defect) {
      return res.status(404).json({ error: 'Defect not found' });
    }

    res.json({
      message: 'Defect updated successfully',
      defect
    });
  } catch (error) {
    console.error('Update defect error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Обновление статуса дефекта
const updateDefectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['new', 'in_progress', 'on_review', 'closed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const defect = await Defect.updateStatus(id, status);
    
    if (!defect) {
      return res.status(404).json({ error: 'Defect not found' });
    }

    res.json({
      message: 'Defect status updated successfully',
      defect
    });
  } catch (error) {
    console.error('Update defect status error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Удаление дефекта
const deleteDefect = async (req, res) => {
  try {
    const { id } = req.params;

    const defect = await Defect.delete(id);
    
    if (!defect) {
      return res.status(404).json({ error: 'Defect not found' });
    }

    res.json({
      message: 'Defect deleted successfully',
      defect
    });
  } catch (error) {
    console.error('Delete defect error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получение дефектов по проекту
const getDefectsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const defects = await Defect.findByProject(projectId);
    
    res.json({ defects });
  } catch (error) {
    console.error('Get defects by project error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Создание комментария
const createComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const user_id = req.user.id;

    if (!text) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    // Проверяем существование дефекта
    const defect = await Defect.findById(id);
    if (!defect) {
      return res.status(404).json({ error: 'Defect not found' });
    }

    const comment = await Comment.create({
      defect_id: id,
      user_id,
      text
    });
    
    res.status(201).json({
      message: 'Comment added successfully',
      comment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получение статистики
const getDefectStats = async (req, res) => {
  try {
    const { projectId } = req.query;
    const stats = await Defect.getStats(projectId);
    
    res.json({ stats });
  } catch (error) {
    console.error('Get defect stats error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createDefect,
  getDefects,
  getDefectById,
  updateDefect,
  updateDefectStatus,
  deleteDefect,
  getDefectsByProject,
  createComment,
  getDefectStats
};