#!/usr/bin/env node

const DatabaseBackup = require('./backup');
const { program } = require('commander');

const backupManager = new DatabaseBackup();

program
  .name('node backup-cli.js')
  .description('Утилита для управления бэкапами базы данных')
  .version('1.0.0');

program
  .command('create')
  .description('Создать новый бэкап базы данных')
  .option('-c, --cleanup', 'Очистить старые бэкапы после создания')
  .option('-m, --max-backups <number>', 'Максимальное количество бэкапов для хранения', '10')
  .action(async (options) => {
    try {
      const backup = await backupManager.createBackup();
      console.log('🎉 Бэкап успешно создан!');
      console.log(`📁 Файл: ${backup.fileName}`);
      console.log(`📊 Размер: ${backupManager.formatFileSize(backup.size)}`);
      console.log(`🕐 Создан: ${backup.createdAt.toLocaleString('ru-RU')}`);

      if (options.cleanup) {
        const maxBackups = parseInt(options.maxBackups);
        backupManager.cleanupOldBackups(maxBackups);
      }
    } catch (error) {
      console.error('❌ Ошибка создания бэкапа:', error.message);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('Показать список всех бэкапов')
  .action(() => {
    const backups = backupManager.listBackups();
    
    if (backups.length === 0) {
      console.log('📭 Бэкапы не найдены');
      return;
    }

    console.log(`📋 Найдено бэкапов: ${backups.length}\n`);
    
    backups.forEach((backup, index) => {
      console.log(`${index + 1}. ${backup.fileName}`);
      console.log(`   📊 Размер: ${backup.formattedSize}`);
      console.log(`   🕐 Создан: ${backup.createdAt.toLocaleString('ru-RU')}`);
      console.log('---');
    });
  });

program
  .command('cleanup')
  .description('Удалить старые бэкапы')
  .option('-m, --max-backups <number>', 'Максимальное количество бэкапов для хранения', '10')
  .action((options) => {
    const maxBackups = parseInt(options.maxBackups);
    backupManager.cleanupOldBackups(maxBackups);
  });

program
  .command('restore <backup-file>')
  .description('Восстановить базу данных из бэкапа')
  .action(async (backupFile) => {
    try {
      console.log(`⚠️  ВНИМАНИЕ: Это перезапишет текущую базу данных!`);
      console.log(`📁 Будет восстановлен файл: ${backupFile}`);
      
      // Простой confirmation (в реальном приложении нужно более надежное решение)
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      readline.question('❓ Продолжить? (yes/no): ', async (answer) => {
        if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
          try {
            await backupManager.restoreBackup(backupFile);
            console.log('✅ Восстановление завершено успешно!');
          } catch (error) {
            console.error('❌ Ошибка восстановления:', error.message);
          }
        } else {
          console.log('❌ Восстановление отменено');
        }
        readline.close();
      });

    } catch (error) {
      console.error('❌ Ошибка:', error.message);
      process.exit(1);
    }
  });

program.parse();