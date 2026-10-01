import { pool } from './db';

const migrateCompensation = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log('Adding time_compensation_agreement and is_compensation_paid columns to permissions table...');
        
        await client.query(`
            ALTER TABLE permissions 
            ADD COLUMN IF NOT EXISTS time_compensation_agreement TEXT DEFAULT '',
            ADD COLUMN IF NOT EXISTS is_compensation_paid BOOLEAN DEFAULT false;
        `);
        
        await client.query('COMMIT');
        console.log('Migration completed successfully: compensation columns added to permissions.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error during migration:', error);
    } finally {
        client.release();
        pool.end();
    }
};

migrateCompensation();
