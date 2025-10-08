const express = require('express');
const DatabaseBackup = require('../scripts/backup');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const backupManager = new DatabaseBackup();

// Все routes требуют аутентификации и роли менеджера
router.use(authenticateToken, requireRole(['manager']));

// GET /api/backup/list - Получить список бэкапов
router.get('/list', (req, res) => {
  try {
    const backups = backupManager.listBackups();
    res.json({ backups });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/backup/create - Создать новый бэкап
router.post('/create', async (req, res) => {
  try {
    const backup = await backupManager.createBackup();
    
    // Очищаем старые бэкапы после создания нового
    backupManager.cleanupOldBackups(10);
    
    res.json({
      message: 'Бэкап успешно создан',
      backup: {
        fileName: backup.fileName,
        size: backupManager.formatFileSize(backup.size),
        createdAt: backup.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/backup/restore/:filename - Восстановить из бэкапа
router.post('/restore/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // В реальном приложении нужна дополнительная проверка безопасности!
    await backupManager.restoreBackup(filename);
    
    res.json({ 
      message: `База данных успешно восстановлена из ${filename}` 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;