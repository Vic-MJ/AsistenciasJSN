import { pool } from './db';

const migrateDb2 = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log('Modifying breakfast and lunch schedule columns in employees table...');
        
        // Remove old columns
        await client.query(`
            ALTER TABLE employees
            DROP COLUMN IF EXISTS breakfast_minutes,
            DROP COLUMN IF EXISTS lunch_minutes;
        `);

        // Add new time range columns
        await client.query(`
            ALTER TABLE employees
            ADD COLUMN IF NOT EXISTS breakfast_start_time TIME DEFAULT '10:00',
            ADD COLUMN IF NOT EXISTS breakfast_end_time TIME DEFAULT '10:30',
            ADD COLUMN IF NOT EXISTS lunch_start_time TIME DEFAULT '14:00',
            ADD COLUMN IF NOT EXISTS lunch_end_time TIME DEFAULT '15:00';
        `);
        
        await client.query('COMMIT');
        console.log('Migration 2 completed successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in migration 2:', error);
    } finally {
        client.release();
        pool.end();
    }
};

migrateDb2();
