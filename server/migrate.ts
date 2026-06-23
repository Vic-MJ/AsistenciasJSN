import { pool } from './db';

const migrateDb = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log('Adding schedule config columns to employees table...');
        
        await client.query(`
            ALTER TABLE employees
            ADD COLUMN IF NOT EXISTS entry_time TIME DEFAULT '09:00',
            ADD COLUMN IF NOT EXISTS exit_time TIME DEFAULT '18:00',
            ADD COLUMN IF NOT EXISTS breakfast_minutes INTEGER DEFAULT 30,
            ADD COLUMN IF NOT EXISTS lunch_minutes INTEGER DEFAULT 60,
            ADD COLUMN IF NOT EXISTS tolerance_minutes INTEGER DEFAULT 15;
        `);
        
        await client.query('COMMIT');
        console.log('Migration completed successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error migrating database:', error);
    } finally {
        client.release();
        pool.end();
    }
};

migrateDb();
