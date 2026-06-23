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

async function inspect() {
    const { rows } = await pool.query('SELECT * FROM company_settings LIMIT 1');
    const settings = rows[0];
    
    try {
        console.log('Searching for VALLEJO in Odoo...');
        const employees = await callOdoo(
            settings.odoo_url,
            settings.odoo_db,
            settings.odoo_username,
            settings.odoo_api_key,
            'hr.employee',
            'search_read',
            [[['name', 'ilike', 'VALLEJO']]],
            { fields: ['id', 'name', 'x_studio_no_empleado', 'birthday'] }
        );

        console.log('Odoo VALLEJO search results:');
        console.log(employees);
    } catch (e: any) {
        console.error('Error:', e.message);
    } finally {
        process.exit(0);
    }
}

inspect();
