import { pool } from './db';

const migrateBirthdays = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log('Adding birthday, zodiac_sign, and work_email columns to employees table...');
        
        await client.query(`
            ALTER TABLE employees 
            ADD COLUMN IF NOT EXISTS birthday DATE,
            ADD COLUMN IF NOT EXISTS zodiac_sign TEXT DEFAULT '',
            ADD COLUMN IF NOT EXISTS work_email TEXT DEFAULT '';
        `);
        
        await client.query('COMMIT');
        console.log('Birthday migration completed successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in birthday migration:', error);
    } finally {
        client.release();
        process.exit();
    }
};

migrateBirthdays();
