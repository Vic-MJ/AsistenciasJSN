import { pool } from './db';

async function seedOdoo() {
    console.log('Seeding Odoo credentials...');
    try {
        const url = 'https://sm-inovoo-jasana.odoo.com';
        const db = 'sm-inovoo-jasana-main-19453290';
        const username = 'sistemas@uniformesjasana.com';
        const apiKey = '329de5361642f67f599ccf1fb5a006d02019360d';

        const { rows } = await pool.query('SELECT id FROM company_settings LIMIT 1');
        if (rows.length > 0) {
            await pool.query(
                'UPDATE company_settings SET odoo_url = $1, odoo_db = $2, odoo_username = $3, odoo_api_key = $4 WHERE id = $5',
                [url, db, username, apiKey, rows[0].id]
            );
            console.log('Credentials updated in existing settings.');
        } else {
            await pool.query(
                'INSERT INTO company_settings (odoo_url, odoo_db, odoo_username, odoo_api_key) VALUES ($1, $2, $3, $4)',
                [url, db, username, apiKey]
            );
            console.log('Credentials inserted into new settings.');
        }
    } catch (error) {
        console.error('Error seeding Odoo credentials:', error);
    } finally {
        await pool.end();
    }
}

seedOdoo();
