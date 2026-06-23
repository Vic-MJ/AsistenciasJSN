const pg = require('pg');
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '12345',
  database: process.env.DB_NAME || 'asistencias',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function run() {
  try {
    const { rows } = await pool.query('SELECT u.id, u.username, u.password, u.role, e.full_name FROM users u JOIN employees e ON u.employee_id = e.id');
    console.log('Users in database:');
    console.log(JSON.stringify(rows, null, 2));
    
    const { rows: allEmps } = await pool.query('SELECT id, full_name, employee_number FROM employees LIMIT 10');
    console.log('Employees in database (first 10):');
    console.log(JSON.stringify(allEmps, null, 2));
  } catch (err) {
    console.error('Error running script:', err);
  } finally {
    await pool.end();
  }
}

run();
