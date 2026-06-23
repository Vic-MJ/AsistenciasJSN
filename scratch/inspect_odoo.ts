import { pool } from '../server/db';

const callOdoo = async (url: string, db: string, username: string, apiKey: string, model: string, method: string, args: any[], kwargs: any = {}) => {
    const jsonRpcUrl = `${url.replace(/\/$/, '')}/jsonrpc`;
    
    const authBody = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
            service: 'common',
            method: 'authenticate',
            args: [db, username, apiKey, {}]
        },
        id: Date.now()
    };

    const authRes = await fetch(jsonRpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authBody)
    });
    
    if (!authRes.ok) throw new Error(`Odoo auth failed: ${authRes.statusText}`);
    const authData: any = await authRes.json();
    if (authData.error) {
        throw new Error(`Odoo auth error: ${authData.error.data?.message || authData.error.message}`);
    }
    
    const uid = authData.result;
    if (!uid) throw new Error('Odoo authentication failed: Invalid credentials');

    const callBody = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
            service: 'object',
            method: 'execute_kw',
            args: [db, uid, apiKey, model, method, args, kwargs]
        },
        id: Date.now() + 1
    };

    const callRes = await fetch(jsonRpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(callBody)
    });
    
    if (!callRes.ok) throw new Error(`Odoo call failed: ${callRes.statusText}`);
    const callData: any = await callRes.json();
    if (callData.error) {
        throw new Error(`Odoo API error: ${callData.error.data?.message || callData.error.message}`);
    }
    
    return callData.result;
};

async function inspect() {
    // Get credentials from DB
    const { rows } = await pool.query('SELECT * FROM company_settings LIMIT 1');
    const settings = rows[0];
    
    if (!settings?.odoo_url || !settings?.odoo_api_key) {
        console.error('Odoo settings not configured in DB.');
        process.exit(1);
    }

    try {
        console.log('Querying Odoo employees to inspect fields...');
        // Search for one employee, e.g. "VALLEJO" or just retrieve the first 5 employees
        const employees = await callOdoo(
            settings.odoo_url,
            settings.odoo_db,
            settings.odoo_username,
            settings.odoo_api_key,
            'hr.employee',
            'search_read',
            [[]],
            { limit: 5 }
        );

        if (employees.length === 0) {
            console.log('No employees found in Odoo.');
            process.exit(0);
        }

        console.log('Fields on first employee:');
        const emp = employees[0];
        console.log(JSON.stringify(emp, null, 2));

        // Let's specifically look for fields containing numbers or having names like registration, barcode, pin, employee_number, etc.
        const allFields = await callOdoo(
            settings.odoo_url,
            settings.odoo_db,
            settings.odoo_username,
            settings.odoo_api_key,
            'hr.employee',
            'fields_get',
            [],
            { attributes: ['string', 'type'] }
        );

        console.log('--- Matching Fields by Name ---');
        for (const [fieldName, fieldMeta] of Object.entries(allFields)) {
            const meta = fieldMeta as any;
            if (
                fieldName.includes('number') || 
                fieldName.includes('no') || 
                fieldName.includes('code') || 
                fieldName.includes('pin') || 
                fieldName.includes('id') ||
                meta.string.toLowerCase().includes('empleado') ||
                meta.string.toLowerCase().includes('número') ||
                meta.string.toLowerCase().includes('id')
            ) {
                console.log(`${fieldName} (${meta.type}): "${meta.string}" -> Value:`, emp[fieldName]);
            }
        }
        
    } catch (e: any) {
        console.error('Error querying Odoo:', e.message);
    } finally {
        process.exit(0);
    }
}

inspect();
