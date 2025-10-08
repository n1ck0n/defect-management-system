const DatabaseBackup = require('./backup');
const cron = require('node-cron');

class AutoBackupService {
  constructor() {
    this.backupManager = new DatabaseBackup();
    this.isRunning = false;
  }

  // Запуск ежедневного бэкапа в 2:00 ночи
  startDailyBackup() {
    if (this.isRunning) {
      console.log('⚠️  Сервис автоматического бэкапа уже запущен');
      return;
    }

    // Каждый день в 2:00 ночи
    cron.schedule('0 2 * * *', async () => {
      console.log('🔄 Запуск автоматического бэкапа...');
      await this.performBackup();
    }, {
      timezone: "Europe/Moscow"
    });

    this.isRunning = true;
    console.log('✅ Сервис автоматического бэкапа запущен (ежедневно в 2:00)');
  }

  // Выполнение бэкапа с очисткой
  async performBackup() {
    try {
      const backup = await this.backupManager.createBackup();
      
      // Оставляем только последние 30 бэкапов
      this.backupManager.cleanupOldBackups(30);
      
      console.log(`✅ Автоматический бэкап завершен: ${backup.fileName}`);
      
      // Здесь можно добавить отправку уведомлений (email, telegram и т.д.)
      this.sendNotification(backup);
      
    } catch (error) {
      console.error('❌ Ошибка автоматического бэкапа:', error.message);
      // Здесь можно добавить отправку уведомлений об ошибках
    }
  }

  // Отправка уведомления (заглушка для расширения)
  sendNotification(backup) {
    // В будущем можно добавить:
    // - Email уведомления
    // - Telegram бот
    // - Slack webhook
    console.log(`📧 [УВЕДОМЛЕНИЕ] Бэкап создан: ${backup.fileName}`);
  }

  stop() {
    this.isRunning = false;
    console.log('🛑 Сервис автоматического бэкапа остановлен');
  }
}

module.exports = AutoBackupService;