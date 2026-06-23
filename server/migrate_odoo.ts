import { pool } from './db';

const migrateOdoo = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log('Adding Odoo fields to company_settings and payment_period to employees...');
        
        await client.query(`
            ALTER TABLE company_settings 
            ADD COLUMN IF NOT EXISTS odoo_url text DEFAULT '',
            ADD COLUMN IF NOT EXISTS odoo_db text DEFAULT '',
            ADD COLUMN IF NOT EXISTS odoo_username text DEFAULT '',
            ADD COLUMN IF NOT EXISTS odoo_api_key text DEFAULT '';
        `);

        await client.query(`
            ALTER TABLE employees 
            ADD COLUMN IF NOT EXISTS payment_period text DEFAULT 'semanal' 
            CHECK (payment_period IN ('semanal', 'quincenal'));
        `);
        
        await client.query('COMMIT');
        console.log('Odoo migration completed successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in odoo migration:', error);
    } finally {
      client.release();
      process.exit();
    }
};

migrateOdoo();
