import pg from 'pg';
const { Pool, types } = pg;

// Prevent timezone conversion on DATE columns (OID 1082) - return raw 'YYYY-MM-DD' string
types.setTypeParser(1082, (str: string) => str);

export const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '12345',
      database: process.env.DB_NAME || 'asistencias',
      port: parseInt(process.env.DB_PORT || '5432'),
    });

// Auto-run schema migrations for users columns on start
pool.query(`
  ALTER TABLE users ADD COLUMN IF NOT EXISTS email text DEFAULT '';
  ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password boolean DEFAULT false;
  ALTER TABLE employees ADD COLUMN IF NOT EXISTS no_empleado text DEFAULT '';
  ALTER TABLE permissions ADD COLUMN IF NOT EXISTS time_compensation_agreement text DEFAULT '';
  ALTER TABLE permissions ADD COLUMN IF NOT EXISTS is_compensation_paid boolean DEFAULT false;
`).then(() => {
  console.log('Database user schema migrations applied successfully.');
}).catch((err) => {
  console.error('Error applying user schema migrations:', err);
});

