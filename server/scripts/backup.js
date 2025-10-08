const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class DatabaseBackup {
  constructor() {
    this.backupDir = path.join(__dirname, '../backups');
    this.ensureBackupDir();
  }

  // Создаем директорию для бэкапов если ее нет
  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log(`✅ Создана директория для бэкапов: ${this.backupDir}`);
    }
  }

  // Генерируем имя файла с timestamp
  generateBackupFileName() {
    const timestamp = new Date().toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .slice(0, -5);
    return `defect_management_backup_${timestamp}.sql`;
  }

  // Выполняем бэкап
  async createBackup() {
    return new Promise((resolve, reject) => {
      const fileName = this.generateBackupFileName();
      const filePath = path.join(this.backupDir, fileName);

      // Команда pg_dump с параметрами
      const command = `pg_dump \
        --host=${process.env.DB_HOST || 'localhost'} \
        --port=${process.env.DB_PORT || 5432} \
        --username=${process.env.DB_USER || 'postgres'} \
        --dbname=${process.env.DB_NAME || 'defect_management'} \
        --file="${filePath}" \
        --verbose \
        --no-password`;

      console.log(`🔄 Создание бэкапа: ${fileName}`);

      // Устанавливаем пароль в переменную окружения для pg_dump
      const env = {
        ...process.env,
        PGPASSWORD: process.env.DB_PASSWORD
      };

      exec(command, { env }, (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Ошибка создания бэкапа: ${error.message}`);
          return reject(error);
        }

        if (stderr) {
          console.warn(`⚠️ Предупреждение: ${stderr}`);
        }

        // Проверяем что файл создан и не пустой
        const stats = fs.statSync(filePath);
        if (stats.size > 0) {
          console.log(`✅ Бэкап успешно создан: ${filePath} (${this.formatFileSize(stats.size)})`);
          resolve({
            fileName,
            filePath,
            size: stats.size,
            createdAt: new Date()
          });
        } else {
          reject(new Error('Файл бэкапа пустой'));
        }
      });
    });
  }

  // Форматируем размер файла
  formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Получаем список бэкапов
  listBackups() {
    try {
      const files = fs.readdirSync(this.backupDir)
        .filter(file => file.endsWith('.sql'))
        .map(file => {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          return {
            fileName: file,
            filePath,
            size: stats.size,
            createdAt: stats.birthtime,
            formattedSize: this.formatFileSize(stats.size)
          };
        })
        .sort((a, b) => b.createdAt - a.createdAt); // Сортировка по дате (новые first)

      return files;
    } catch (error) {
      console.error('Ошибка при получении списка бэкапов:', error);
      return [];
    }
  }

  // Удаляем старые бэкапы (оставляем только последние N)
  cleanupOldBackups(maxBackups = 10) {
    const backups = this.listBackups();
    
    if (backups.length <= maxBackups) {
      console.log(`✅ Количество бэкапов в норме: ${backups.length}/${maxBackups}`);
      return;
    }

    const backupsToDelete = backups.slice(maxBackups);
    
    console.log(`🗑️ Удаление старых бэкапов: ${backupsToDelete.length} файлов`);
    
    backupsToDelete.forEach(backup => {
      try {
        fs.unlinkSync(backup.filePath);
        console.log(`✅ Удален: ${backup.fileName}`);
      } catch (error) {
        console.error(`❌ Ошибка удаления ${backup.fileName}:`, error.message);
      }
    });
  }

  // Восстановление из бэкапа
  async restoreBackup(backupFileName) {
    return new Promise((resolve, reject) => {
      const backupPath = path.join(this.backupDir, backupFileName);

      if (!fs.existsSync(backupPath)) {
        return reject(new Error(`Файл бэкапа не найден: ${backupFileName}`));
      }

      console.log(`🔄 Восстановление из бэкапа: ${backupFileName}`);

      const command = `psql \
        --host=${process.env.DB_HOST || 'localhost'} \
        --port=${process.env.DB_PORT || 5432} \
        --username=${process.env.DB_USER || 'postgres'} \
        --dbname=${process.env.DB_NAME || 'defect_management'} \
        --file="${backupPath}" \
        --quiet \
        --no-password`;

      const env = {
        ...process.env,
        PGPASSWORD: process.env.DB_PASSWORD
      };

      exec(command, { env }, (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Ошибка восстановления: ${error.message}`);
          return reject(error);
        }

        if (stderr && !stderr.includes('WARNING:')) {
          console.warn(`⚠️ Предупреждение: ${stderr}`);
        }

        console.log(`✅ База данных успешно восстановлена из: ${backupFileName}`);
        resolve({
          fileName: backupFileName,
          restoredAt: new Date()
        });
      });
    });
  }
}

module.exports = DatabaseBackup;