const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Cap.edu',
  password: 'root',
  port: 5432,
});

pool.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos', err);
  } else {
    console.log('Conectado a la base de datos');
  }
});

module.exports = pool;
