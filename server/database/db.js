const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'defect_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

// Обработка ошибок подключения
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Проверка подключения при запуске
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    console.log('Please check your database configuration in .env file');
    process.exit(1);
  }
};

// Вызываем проверку подключения
testConnection();

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};