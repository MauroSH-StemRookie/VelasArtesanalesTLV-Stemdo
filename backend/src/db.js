const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(() => console.log('Conectado a Neon PostgreSQL'))
  .catch(err => console.error('Error de conexión a la DB:', err.message));

module.exports = pool;
