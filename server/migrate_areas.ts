import { pool } from './db';
const run = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Creating areas table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS areas (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL, -- Departamento
        position text NOT NULL DEFAULT '', -- Puesto
        supervisor_id uuid REFERENCES employees(id) ON DELETE SET NULL,
        created_at timestamptz DEFAULT now()
      );
    `);
    
    // Enable RLS
    await client.query("ALTER TABLE areas ENABLE ROW LEVEL SECURITY;");
    await client.query("DROP POLICY IF EXISTS areas_all ON areas;");
    await client.query("CREATE POLICY areas_all ON areas FOR ALL TO PUBLIC USING (true) WITH CHECK (true);");
    
    console.log('Updating employees table...');
    await client.query(`
      ALTER TABLE employees 
      ADD COLUMN IF NOT EXISTS area_id uuid REFERENCES areas(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS position text DEFAULT '';
    `);
    
    await client.query('COMMIT');
    console.log('Database updated successfully for Areas.');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
  } finally {
    client.release();
    process.exit();
  }
};
run();
