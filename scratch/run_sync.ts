import { pool } from '../server/db';

const callOdoo = async (url: string, db: string, username: string, apiKey: string, model: string, method: string, args: any[], kwargs: any = {}) => {
    const jsonRpcUrl = `${url.replace(/\/$/, '')}/jsonrpc`;
    const authBody = {
        jsonrpc: '2.0',
        method: 'call',
        params: { service: 'common', method: 'authenticate', args: [db, username, apiKey, {}] },
        id: Date.now()
    };
    const authRes = await fetch(jsonRpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authBody)
    });
    const authData: any = await authRes.json();
    const uid = authData.result;
    const callBody = {
        jsonrpc: '2.0',
        method: 'call',
        params: { service: 'object', method: 'execute_kw', args: [db, uid, apiKey, model, method, args, kwargs] },
        id: Date.now() + 1
    };
    const callRes = await fetch(jsonRpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(callBody)
    });
    const callData: any = await callRes.json();
    return callData.result;
};

async function runSync() {
    const { rows } = await pool.query('SELECT * FROM company_settings LIMIT 1');
    const settings = rows[0];
    
    if (!settings?.odoo_url || !settings?.odoo_api_key) {
        console.error('Odoo settings not configured in DB.');
        process.exit(1);
    }

    try {
        console.log('Running optimized Odoo synchronization...');
        let result: any[] = [];
        
        try {
            result = await callOdoo(
                settings.odoo_url,
                settings.odoo_db,
                settings.odoo_username,
                settings.odoo_api_key,
                'hr.employee',
                'search_read',
                [[]],
                { fields: ['id', 'name', 'birthday', 'work_email', 'private_email', 'x_studio_no_empleado'] }
            );
        } catch (error: any) {
            console.log('Error querying Odoo with work_email, trying fallback without it:', error.message);
            result = await callOdoo(
                settings.odoo_url,
                settings.odoo_db,
                settings.odoo_username,
                settings.odoo_api_key,
                'hr.employee',
                'search_read',
                [[]],
                { fields: ['id', 'name', 'birthday', 'x_studio_no_empleado'] }
            );
        }

        const calculateZodiac = (dateStr: string): string => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            const day = date.getUTCDate();
            const month = date.getUTCMonth() + 1;

            if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return '♈ Aries';
            if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return '♉ Tauro';
            if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return '♊ Géminis';
            if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return '♋ Cáncer';
            if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return '♌ Leo';
            if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return '♍ Virgo';
            if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return '♎ Libra';
            if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return '♏ Escorpio';
            if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return '♐ Sagitario';
            if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return '♑ Capricornio';
            if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return '♒ Acuario';
            return '♓ Piscis';
        };

        const client = await pool.connect();
        let updatedCount = 0;
        try {
            await client.query('BEGIN');
            for (const odooEmp of result) {
                const name = odooEmp.name;
                const birthday = odooEmp.birthday || null;
                const work_email = odooEmp.work_email || null;
                const private_email = odooEmp.private_email || null;
                const zodiac_sign = birthday ? calculateZodiac(birthday) : '';
                const no_empleado = odooEmp.x_studio_no_empleado || '';

                // Try to update by matching Odoo ID to the local employee_number
                let updateRes = await client.query(`
                    UPDATE employees 
                    SET birthday = $1, work_email = $2, zodiac_sign = $3, private_email = $4, no_empleado = $5
                    WHERE employee_number = $6
                    RETURNING id
                `, [birthday, work_email, zodiac_sign, private_email, no_empleado, odooEmp.id.toString()]);

                // Fallback to matching by name if not found by ID
                if (updateRes.rows.length === 0) {
                    updateRes = await client.query(`
                        UPDATE employees 
                        SET birthday = $1, work_email = $2, zodiac_sign = $3, private_email = $4, no_empleado = $5
                        WHERE LOWER(full_name) = LOWER($6)
                        RETURNING id
                    `, [birthday, work_email, zodiac_sign, private_email, no_empleado, name]);
                }
                
                if (updateRes.rows.length > 0) {
                    updatedCount++;
                }
            }
            await client.query('COMMIT');
            console.log(`Success! Synchronized ${updatedCount} employees.`);
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

    } catch (e: any) {
        console.error('Error during synchronization:', e.message);
    } finally {
        process.exit(0);
    }
}

runSync();
