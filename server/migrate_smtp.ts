import { pool } from './db';

const migrateSmtp = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log('Adding SMTP configuration columns to company_settings table...');
        
        await client.query(`
            ALTER TABLE company_settings 
            ADD COLUMN IF NOT EXISTS smtp_host TEXT DEFAULT '',
            ADD COLUMN IF NOT EXISTS smtp_port INTEGER DEFAULT 587,
            ADD COLUMN IF NOT EXISTS smtp_secure BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS smtp_user TEXT DEFAULT '',
            ADD COLUMN IF NOT EXISTS smtp_pass TEXT DEFAULT '',
            ADD COLUMN IF NOT EXISTS smtp_from TEXT DEFAULT '';
        `);
        
        await client.query('COMMIT');
        console.log('SMTP configuration migration completed successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in SMTP configuration migration:', error);
    } finally {
        client.release();
        process.exit();
    }
};

migrateSmtp();
