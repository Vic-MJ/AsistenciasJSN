import { pool } from './db';

const migrateDb3 = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log('Creating schedules table and updating employees reference...');
        
        // Create schedules table
        await client.query(`
            CREATE TABLE IF NOT EXISTS schedules (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                name text NOT NULL,
                entry_time time NOT NULL DEFAULT '09:00',
                exit_time time NOT NULL DEFAULT '18:00',
                breakfast_start_time time DEFAULT '10:00',
                breakfast_end_time time DEFAULT '10:30',
                lunch_start_time time DEFAULT '14:00',
                lunch_end_time time DEFAULT '15:00',
                tolerance_minutes integer DEFAULT 15,
                created_at timestamptz DEFAULT now()
            );
        `);

        // Enable RLS for schedules (supabase compatible)
        await client.query(`
            ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
            DROP POLICY IF EXISTS schedules_all ON schedules;
            CREATE POLICY schedules_all ON schedules FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
        `);

        // Add reference in employees
        await client.query(`
            ALTER TABLE employees ADD COLUMN IF NOT EXISTS schedule_id uuid REFERENCES schedules(id) ON DELETE SET NULL;
        `);

        // Insert example schedules if table is empty
        const { rowCount } = await client.query('SELECT 1 FROM schedules LIMIT 1');
        if (rowCount === 0) {
            await client.query(`
                INSERT INTO schedules (name, entry_time, exit_time)
                VALUES 
                ('Turno Matutino (9-6)', '09:00', '18:00'),
                ('Turno Nocturno (9-6)', '21:00', '06:00'),
                ('Sabatino', '09:00', '14:00');
            `);
        }
        
        await client.query('COMMIT');
        console.log('Migration 3 (Schedules) completed successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in migration 3:', error);
    } finally {
      client.release();
      process.exit();
    }
};

migrateDb3();
