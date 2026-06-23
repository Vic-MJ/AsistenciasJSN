import { pool } from './db';

const migrateAi = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log('Adding Gemini API key column to company_settings table...');
        
        await client.query(`
            ALTER TABLE company_settings 
            ADD COLUMN IF NOT EXISTS gemini_api_key TEXT DEFAULT '';
        `);
        
        await client.query('COMMIT');
        console.log('Gemini API key migration completed successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in Gemini API key migration:', error);
    } finally {
        client.release();
        process.exit();
    }
};

migrateAi();
