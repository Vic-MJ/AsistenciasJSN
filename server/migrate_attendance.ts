import { pool } from './db';

async function migrate() {
    console.log('Creating attendance_logs table...');
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS attendance_logs (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
                employee_name text,
                check_in timestamptz NOT NULL,
                check_out timestamptz,
                worked_hours numeric,
                source text DEFAULT 'odoo',
                odoo_id integer,
                created_at timestamptz DEFAULT now()
            );

            CREATE INDEX IF NOT EXISTS idx_attendance_logs_check_in ON attendance_logs(check_in);
            CREATE INDEX IF NOT EXISTS idx_attendance_logs_odoo_id ON attendance_logs(odoo_id);
        `);
        console.log('attendance_logs table created successfully.');
    } catch (error) {
        console.error('Error creating attendance_logs table:', error);
    } finally {
        await pool.end();
    }
}

migrate();
