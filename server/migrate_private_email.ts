import { pool } from './db';

const migratePrivateEmail = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log('Adding private_email column to employees table...');
        
        await client.query(`
            ALTER TABLE employees 
            ADD COLUMN IF NOT EXISTS private_email TEXT DEFAULT '';
        `);
        
        await client.query('COMMIT');
        console.log('Private email migration completed successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in private email migration:', error);
    } finally {
        client.release();
        process.exit();
    }
};

migratePrivateEmail();
