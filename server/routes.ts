import { Router, Request, Response, NextFunction } from 'express';
import { pool } from './db';
import { employeeSchema, employeeUpdateSchema, permissionSchema, settingsSchema, scheduleSchema, areaSchema, userSchema } from './schemas';
import { ZodError } from 'zod';
import nodemailer from 'nodemailer';

const router = Router();

// Middleware for handling async errors
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Employees
router.get('/employees', asyncHandler(async (req: Request, res: Response) => {
    // Join with schedules and areas to get named references
    const { rows } = await pool.query(`
        SELECT e.*, s.name as schedule_name, a.name as area_name, a.position as area_position
        FROM employees e 
        LEFT JOIN schedules s ON e.schedule_id = s.id 
        LEFT JOIN areas a ON e.area_id = a.id
        ORDER BY e.full_name ASC
    `);
    res.json(rows);
}));

router.post('/employees', asyncHandler(async (req: Request, res: Response) => {
    const validatedData = employeeSchema.parse(req.body);
    const { full_name, employee_number, no_empleado, department, schedule_id, area_id, position, entry_time, exit_time, breakfast_start_time, breakfast_end_time, lunch_start_time, lunch_end_time, tolerance_minutes, payment_period, birthday, zodiac_sign, work_email, private_email } = validatedData as any;
    const { rows } = await pool.query(
        'INSERT INTO employees (full_name, employee_number, no_empleado, department, schedule_id, area_id, position, entry_time, exit_time, breakfast_start_time, breakfast_end_time, lunch_start_time, lunch_end_time, tolerance_minutes, payment_period, birthday, zodiac_sign, work_email, private_email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *',
        [full_name, employee_number, no_empleado || '', department, schedule_id, area_id, position, entry_time, exit_time, breakfast_start_time, breakfast_end_time, lunch_start_time, lunch_end_time, tolerance_minutes, payment_period, birthday, zodiac_sign, work_email, private_email]
    );
    res.json(rows[0]);
}));

router.put('/employees/bulk', asyncHandler(async (req: Request, res: Response) => {
    const { employeeIds, data } = req.body;
    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
        return res.status(400).json({ error: 'No employee IDs provided' });
    }

    const fields = Object.keys(data).filter(f => !['id', 'created_at'].includes(f));
    if (fields.length === 0) {
        return res.status(400).json({ error: 'No data to update' });
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const values = Object.values(data);
    
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (const id of employeeIds) {
            await client.query(`UPDATE employees SET ${setClause} WHERE id = $${values.length + 1}`, [...values, id]);
        }
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}));

router.put('/employees/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validatedData = employeeUpdateSchema.parse(req.body);
    const fields = Object.keys(validatedData);
    if (fields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const values = Object.values(validatedData);
    values.push(id);

    const { rows } = await pool.query(
        `UPDATE employees SET ${setClause} WHERE id = $${values.length} RETURNING *`,
        values
    );
    res.json(rows[0]);
}));

router.delete('/employees/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await pool.query('DELETE FROM employees WHERE id = $1', [id]);
    res.json({ success: true });
}));

// Delete all employees
router.delete('/employees', asyncHandler(async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM permissions');
        await client.query('DELETE FROM employees');
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}));

// Batch insert employees (for Excel upload)
router.post('/employees/batch', asyncHandler(async (req: Request, res: Response) => {
    const employees = req.body;
    if (!Array.isArray(employees)) {
        return res.status(400).json({ error: 'Expected an array of employees' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (const emp of employees) {
            const validated = employeeSchema.parse(emp);
            await client.query(
                `INSERT INTO employees (full_name, employee_number, no_empleado, department, schedule_id, entry_time, exit_time, breakfast_start_time, breakfast_end_time, lunch_start_time, lunch_end_time, tolerance_minutes, payment_period) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
                 ON CONFLICT (employee_number) DO UPDATE SET 
                 full_name = EXCLUDED.full_name, 
                 no_empleado = EXCLUDED.no_empleado,
                 department = EXCLUDED.department,
                 schedule_id = EXCLUDED.schedule_id,
                 entry_time = EXCLUDED.entry_time,
                 exit_time = EXCLUDED.exit_time,
                 breakfast_start_time = EXCLUDED.breakfast_start_time,
                 breakfast_end_time = EXCLUDED.breakfast_end_time,
                 lunch_start_time = EXCLUDED.lunch_start_time,
                 lunch_end_time = EXCLUDED.lunch_end_time,
                 tolerance_minutes = EXCLUDED.tolerance_minutes,
                 payment_period = EXCLUDED.payment_period`,
                [validated.full_name, validated.employee_number, validated.no_empleado || '', validated.department, validated.schedule_id, validated.entry_time, validated.exit_time, validated.breakfast_start_time, validated.breakfast_end_time, validated.lunch_start_time, validated.lunch_end_time, validated.tolerance_minutes, validated.payment_period]
            );
        }
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}));


// Permissions
router.get('/permissions', asyncHandler(async (req: Request, res: Response) => {
    const { rows } = await pool.query('SELECT * FROM permissions ORDER BY created_at DESC');
    res.json(rows);
}));

router.post('/permissions', asyncHandler(async (req: Request, res: Response) => {
    const validated = permissionSchema.parse(req.body);
    const { employee_id, permission_type, reason, reason_other, permission_date, exit_time, entry_time } = validated;
    const { rows } = await pool.query(
        'INSERT INTO permissions (employee_id, permission_type, reason, reason_other, permission_date, exit_time, entry_time) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [employee_id, permission_type, reason, reason_other, permission_date, exit_time, entry_time]
    );
    res.json(rows[0]);
}));

router.put('/permissions/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = permissionSchema.partial().parse(req.body);
    const fields = Object.keys(validated);
    if (fields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const values = Object.values(validated);
    values.push(id);

    const { rows } = await pool.query(
        `UPDATE permissions SET ${setClause} WHERE id = $${values.length} RETURNING *`,
        values
    );
    res.json(rows[0]);
}));

router.delete('/permissions/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await pool.query('DELETE FROM permissions WHERE id = $1', [id]);
    res.json({ success: true });
}));

router.delete('/permissions', asyncHandler(async (req: Request, res: Response) => {
    await pool.query('DELETE FROM permissions');
    res.json({ success: true });
}));

// Areas
router.get('/areas', asyncHandler(async (req: Request, res: Response) => {
    const { rows } = await pool.query(`
        SELECT a.*, e.full_name as supervisor_name 
        FROM areas a 
        LEFT JOIN employees e ON a.supervisor_id = e.id 
        ORDER BY a.name ASC
    `);
    res.json(rows);
}));

router.post('/areas', asyncHandler(async (req: Request, res: Response) => {
    const validatedData = areaSchema.parse(req.body);
    const { name, position, supervisor_id } = validatedData;
    const { rows } = await pool.query(
        'INSERT INTO areas (name, position, supervisor_id) VALUES ($1, $2, $3) RETURNING *',
        [name, position, supervisor_id]
    );
    res.json(rows[0]);
}));

router.put('/areas/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validatedData = areaSchema.partial().parse(req.body);
    const fields = Object.keys(validatedData);
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const values = Object.values(validatedData);
    values.push(id);

    const { rows } = await pool.query(
        `UPDATE areas SET ${setClause} WHERE id = $${values.length} RETURNING *`,
        values
    );
    res.json(rows[0]);
}));

router.delete('/areas/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await pool.query('DELETE FROM areas WHERE id = $1', [id]);
    res.json({ success: true });
}));

// Schedules
router.get('/schedules', asyncHandler(async (req: Request, res: Response) => {
    const { rows } = await pool.query('SELECT * FROM schedules ORDER BY name ASC');
    res.json(rows);
}));

router.post('/schedules', asyncHandler(async (req: Request, res: Response) => {
    const validated = scheduleSchema.parse(req.body);
    const { name, entry_time, exit_time, breakfast_start_time, breakfast_end_time, lunch_start_time, lunch_end_time, tolerance_minutes } = validated;
    const { rows } = await pool.query(
        'INSERT INTO schedules (name, entry_time, exit_time, breakfast_start_time, breakfast_end_time, lunch_start_time, lunch_end_time, tolerance_minutes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [name, entry_time, exit_time, breakfast_start_time, breakfast_end_time, lunch_start_time, lunch_end_time, tolerance_minutes]
    );
    res.json(rows[0]);
}));

router.put('/schedules/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = scheduleSchema.partial().parse(req.body);
    const fields = Object.keys(validated);
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const values = Object.values(validated);
    values.push(id);

    const { rows } = await pool.query(`UPDATE schedules SET ${setClause} WHERE id = $${values.length} RETURNING *`, values);
    res.json(rows[0]);
}));

router.delete('/schedules/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await pool.query('DELETE FROM schedules WHERE id = $1', [id]);
    res.json({ success: true });
}));

// Company Settings
router.get('/settings', asyncHandler(async (req: Request, res: Response) => {
    const { rows } = await pool.query('SELECT * FROM company_settings LIMIT 1');
    res.json(rows[0]);
}));

router.put('/settings', asyncHandler(async (req: Request, res: Response) => {
    const validated = settingsSchema.parse(req.body);
    const fields = Object.keys(validated);
    if (fields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const values = Object.values(validated);

    const { rows } = await pool.query(
        `UPDATE company_settings SET ${setClause} RETURNING *`,
        values
    );
    res.json(rows[0]);
}));

// Odoo Integration
const callOdoo = async (url: string, db: string, username: string, apiKey: string, model: string, method: string, args: any[], kwargs: any = {}) => {
    const jsonRpcUrl = `${url.replace(/\/$/, '')}/jsonrpc`;
    
    // 1. Authenticate
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

    // 2. Call Method
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

router.post('/odoo/test-connection', asyncHandler(async (req: Request, res: Response) => {
    const { odoo_url, odoo_db, odoo_username, odoo_api_key } = req.body;
    
    try {
        const result = await callOdoo(odoo_url, odoo_db, odoo_username, odoo_api_key, 'res.users', 'search_count', [[]]);
        res.json({ success: true, message: 'Conexión exitosa' });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
}));

router.post('/odoo/attendance', asyncHandler(async (req: Request, res: Response) => {
    const { start_date, end_date, employee_ids, payment_period } = req.body;
    
    // Get credentials from DB
    const { rows } = await pool.query('SELECT * FROM company_settings LIMIT 1');
    const settings = rows[0];
    
    if (!settings?.odoo_url || !settings?.odoo_api_key) {
        return res.status(400).json({ error: 'Configuración de Odoo incompleta' });
    }

    const domain: any[] = [
        ['check_in', '>=', start_date],
        ['check_in', '<=', end_date]
    ];

    // Handle filtering by employees or period
    let namesToFilter: string[] = [];
    if (employee_ids && employee_ids.length > 0) {
        const { rows: emps } = await pool.query('SELECT full_name FROM employees WHERE id = ANY($1)', [employee_ids]);
        namesToFilter = emps.map(r => r.full_name);
    } else if (payment_period && payment_period !== 'todos') {
        const { rows: emps } = await pool.query('SELECT full_name FROM employees WHERE payment_period = $1', [payment_period]);
        namesToFilter = emps.map(r => r.full_name);
    }

    try {
        // If we have specific names to filter, we need to find their Odoo IDs first
        if (namesToFilter.length > 0) {
            const odooEmpIds = await callOdoo(
                settings.odoo_url, 
                settings.odoo_db, 
                settings.odoo_username, 
                settings.odoo_api_key, 
                'hr.employee', 
                'search', 
                [[['name', 'in', namesToFilter]]]
            );

            if (odooEmpIds.length === 0) {
                return res.json([]); // No matching employees found in Odoo
            }
            domain.push(['employee_id', 'in', odooEmpIds]);
        }
        const result = await callOdoo(
            settings.odoo_url, 
            settings.odoo_db, 
            settings.odoo_username, 
            settings.odoo_api_key, 
            'hr.attendance', 
            'search_read', 
            [domain], 
            { fields: ['id', 'employee_id', 'check_in', 'check_out', 'worked_hours'] }
        );

        // Get local employees to match by name
        const { rows: localEmps } = await pool.query('SELECT id, full_name FROM employees');
        const empMap = new Map(localEmps.map(e => [e.full_name.toLowerCase(), e.id]));

        // Save to local attendance_logs
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (const rec of result) {
                const empName = rec.employee_id[1];
                const empId = empMap.get(empName.toLowerCase());
                
                await client.query(`
                    INSERT INTO attendance_logs (employee_id, employee_name, check_in, check_out, worked_hours, odoo_id, source)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT (odoo_id) DO UPDATE SET
                    check_in = EXCLUDED.check_in,
                    check_out = EXCLUDED.check_out,
                    worked_hours = EXCLUDED.worked_hours
                `, [
                    empId || null, 
                    empName, 
                    rec.check_in, 
                    rec.check_out === false ? null : rec.check_out, 
                    rec.worked_hours || 0, 
                    rec.id, 
                    'odoo'
                ]);
            }
            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            console.error('Error saving attendance logs:', e);
        } finally {
            client.release();
        }

        // Transform Odoo results to match our AttendanceRecord format
        // Odoo returns date strings in UTC, we append 'Z' so the frontend treats them as UTC
        const transformed = result.map((rec: any) => ({
            id: rec.id,
            empleado: rec.employee_id[1],
            entrada: rec.check_in ? rec.check_in.replace(' ', 'T') + 'Z' : null,
            salida: rec.check_out ? rec.check_out.replace(' ', 'T') + 'Z' : null,
            horasTrabajadas: rec.worked_hours,
            departamento: ''
        }));

        res.json(transformed);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}));

router.post('/odoo/sync-birthdays', asyncHandler(async (req: Request, res: Response) => {
    // Get credentials from DB
    const { rows } = await pool.query('SELECT * FROM company_settings LIMIT 1');
    const settings = rows[0];
    
    if (!settings?.odoo_url || !settings?.odoo_api_key) {
        return res.status(400).json({ error: 'Configuración de Odoo incompleta' });
    }

    try {
        console.log('Syncing employee birthdays from Odoo...');
        
        let result: any[] = [];
        try {
            // Fetch exactly the needed fields that we know exist
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
        } catch (error) {
            console.log('Error querying Odoo with work_email, trying fallback without it:', error);
            // Fallback: only essential fields that are guaranteed to exist
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
                const zodiac_sign = odooEmp.zodiac_sign || (birthday ? calculateZodiac(birthday) : '');
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
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

        res.json({ success: true, message: `Se sincronizaron los cumpleaños de ${updatedCount} empleados.` });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}));

router.post('/generate-birthday-message', asyncHandler(async (req: Request, res: Response) => {
    const { full_name, position, department, zodiac_sign } = req.body;

    if (!full_name) {
        return res.status(400).json({ error: 'El nombre del empleado es requerido' });
    }

    const { rows } = await pool.query('SELECT gemini_api_key FROM company_settings LIMIT 1');
    const settings = rows[0];
    const apiKey = settings?.gemini_api_key || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(400).json({ 
            error: 'No se encontró la Gemini API Key. Configúrala en Ajustes del Sistema para usar la IA.' 
        });
    }

    try {
        const prompt = `Genera un mensaje de felicitación de cumpleaños personalizado e institucional en formato JSON para un empleado.
Datos del cumpleañero:
- Nombre: ${full_name}
- Puesto: ${position || 'Colaborador'}
- Departamento: ${department || 'Área General'}
- Signo del zodiaco: ${zodiac_sign || 'No especificado'}

El JSON devuelto debe tener exactamente esta estructura:
{
  "subject": "Asunto del correo con emojis de celebración",
  "headerText": "Título corto y festivo para el encabezado",
  "bodyText1": "Un párrafo cálido y afectuoso de felicitación institucional (2 o 3 oraciones, deseando éxito y salud en su nuevo año de vida)",
  "bodyText2": "Una frase final de agradecimiento o cierre festivo"
}

Responde ÚNICAMENTE con el objeto JSON válido. No incluyes markdown ni bloques de código.`;

        let activeModel = 'gemini-2.5-flash';
        let geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;
        let response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: 'application/json'
                }
            })
        });

        if (response.status === 404) {
            activeModel = 'gemini-1.5-flash';
            console.log(`Model gemini-2.5-flash returned 404, falling back to ${activeModel}...`);
            geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;
            response = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        responseMimeType: 'application/json'
                    }
                })
            });
        }

        if (!response.ok) {
            const errText = await response.text();
            console.error('Gemini API error body:', errText);
            throw new Error(`Error en API de Gemini: ${response.statusText} - ${errText}`);
        }

        const data: any = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!textResponse) {
            throw new Error('La respuesta de Gemini no contiene texto válido');
        }

        const parsedJson = JSON.parse(textResponse.trim());
        res.json(parsedJson);
    } catch (error: any) {
        console.error('Error generating birthday message with Gemini:', error);
        res.status(500).json({ error: error.message || 'Error al generar el mensaje con IA' });
    }
}));

router.post('/odoo/send-birthday-email', asyncHandler(async (req: Request, res: Response) => {
    const { email_to, subject, body_html, attachments } = req.body;
    
    if (!email_to || !subject || !body_html) {
        return res.status(400).json({ error: 'Faltan campos requeridos (email_to, subject, body_html)' });
    }

    const { rows } = await pool.query('SELECT * FROM company_settings LIMIT 1');
    const settings = rows[0];

    // Priority 1: Send via Direct local SMTP server if SMTP configurations are present in settings or environment
    const smtpHost = settings?.smtp_host || process.env.SMTP_HOST;
    const smtpPort = settings?.smtp_port || Number(process.env.SMTP_PORT || 587);
    const smtpSecure = settings?.smtp_secure !== undefined ? settings.smtp_secure : (process.env.SMTP_SECURE === 'true');
    const smtpUser = settings?.smtp_user || process.env.SMTP_USER;
    const smtpPass = settings?.smtp_pass || process.env.SMTP_PASS;
    const smtpFrom = settings?.smtp_from || process.env.SMTP_FROM || smtpUser;

    if (smtpHost && smtpUser && smtpPass) {
        try {
            console.log(`Sending birthday email to ${email_to} directly via local SMTP server (${smtpHost})...`);
            
            const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: Number(smtpPort),
                secure: !!smtpSecure,
                auth: {
                    user: smtpUser,
                    pass: smtpPass,
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            await transporter.sendMail({
                from: smtpFrom,
                to: email_to,
                subject: subject,
                html: body_html,
                attachments: attachments,
            });

            return res.json({ success: true, message: 'Felicitación enviada con éxito desde el servidor local (SMTP).' });
        } catch (smtpError: any) {
            console.error('Direct SMTP sending failed, falling back to Odoo...', smtpError);
        }
    }

    // Priority 2: Fallback to Odoo if SMTP is not configured or fails
    if (!settings?.odoo_url || !settings?.odoo_api_key) {
        return res.status(400).json({ error: 'Configuración de SMTP local o de Odoo incompleta.' });
    }

    try {
        console.log(`Sending birthday email to ${email_to} via Odoo...`);
        
        const mailId = await callOdoo(
            settings.odoo_url,
            settings.odoo_db,
            settings.odoo_username,
            settings.odoo_api_key,
            'mail.mail',
            'create',
            [{
                subject: subject,
                email_to: email_to,
                body_html: body_html,
                auto_delete: false
            }]
        );

        await callOdoo(
            settings.odoo_url,
            settings.odoo_db,
            settings.odoo_username,
            settings.odoo_api_key,
            'mail.mail',
            'send',
            [[mailId]]
        );

        res.json({ success: true, message: 'Felicitación enviada con éxito a través de Odoo.' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}));

router.get('/attendance-logs', asyncHandler(async (req: Request, res: Response) => {
    const { start_date, end_date } = req.query;
    let query = `
        SELECT l.*, e.full_name as employee_full_name, e.employee_number
        FROM attendance_logs l
        LEFT JOIN employees e ON l.employee_id = e.id
    `;
    const params = [];
    if (start_date && end_date) {
        query += ' WHERE l.check_in >= $1 AND l.check_in <= $2';
        params.push(start_date, end_date);
    }
    query += ' ORDER BY l.check_in DESC';
    
    const { rows } = await pool.query(query, params);
    res.json(rows);
}));

// User Management (Master Users)
router.get('/users', asyncHandler(async (req: Request, res: Response) => {
    const { rows } = await pool.query(`
        SELECT u.*, e.full_name as employee_name, e.employee_number
        FROM users u
        JOIN employees e ON u.employee_id = e.id
        ORDER BY u.username ASC
    `);
    res.json(rows);
}));

router.post('/users', asyncHandler(async (req: Request, res: Response) => {
    const validated = userSchema.parse(req.body);
    const { employee_id, username, password, role } = validated;
    
    // Check if employee already has a user
    const existing = await pool.query('SELECT id FROM users WHERE employee_id = $1', [employee_id]);
    if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Este empleado ya tiene un usuario asignado' });
    }

    const { rows } = await pool.query(
        'INSERT INTO users (employee_id, username, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [employee_id, username, password, role || 'master']
    );
    res.json(rows[0]);
}));

router.delete('/users/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ success: true });
}));

router.put('/users/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role, password } = req.body;

    if (!role) {
        return res.status(400).json({ error: 'El rol es requerido' });
    }

    let query = 'UPDATE users SET role = $1';
    let params = [role];

    if (password && password.trim()) {
        query += ', password = $2 WHERE id = $3 RETURNING *';
        params.push(password, id);
    } else {
        query += ' WHERE id = $2 RETURNING *';
        params.push(id);
    }

    const { rows } = await pool.query(query, params);

    if (rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(rows[0]);
}));

router.post('/login', asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const { rows } = await pool.query(
        'SELECT u.*, e.full_name as employee_name FROM users u JOIN employees e ON u.employee_id = e.id WHERE u.username = $1 AND u.password = $2',
        [username, password]
    );

    if (rows.length === 0) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // In a real app, we would use JWT here. For now, we'll return the user object.
    const user = rows[0];
    delete user.password; // Don't send password back
    res.json(user);
}));

router.post('/auth/forgot-password', asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Nombre de usuario es requerido' });
    }

    // Query user matching username
    const { rows: users } = await pool.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
    );

    if (users.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = users[0];

    if (user.role !== 'master') {
        return res.status(403).json({ error: 'El restablecimiento de contraseña por correo solo está habilitado para usuarios maestros.' });
    }

    if (!user.email || !user.email.trim()) {
        return res.status(400).json({ error: 'Este usuario maestro no tiene un correo electrónico configurado en su perfil. Por favor, contacte a soporte o configúrelo en su perfil.' });
    }

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Update user's password directly to this 6-digit code and set must_change_password = true
    await pool.query(
        'UPDATE users SET password = $1, must_change_password = true WHERE id = $2',
        [code, user.id]
    );

    // Get SMTP settings from company_settings or env
    const { rows: settingsRows } = await pool.query('SELECT * FROM company_settings LIMIT 1');
    const settings = settingsRows[0];

    const smtpHost = settings?.smtp_host || process.env.SMTP_HOST;
    const smtpPort = settings?.smtp_port || Number(process.env.SMTP_PORT || 587);
    const smtpSecure = settings?.smtp_secure !== undefined ? settings.smtp_secure : (process.env.SMTP_SECURE === 'true');
    const smtpUser = settings?.smtp_user || process.env.SMTP_USER;
    const smtpPass = settings?.smtp_pass || process.env.SMTP_PASS;
    const smtpFrom = settings?.smtp_from || process.env.SMTP_FROM || smtpUser;

    if (!smtpHost || !smtpUser || !smtpPass) {
        return res.status(500).json({ 
            error: 'El servidor de correo (SMTP) no está configurado en los Ajustes del Sistema. Por favor, configúrelo en la pestaña Reportes / Odoo > Ajustes Generales.' 
        });
    }

    try {
        console.log(`Sending temporary password recovery email to ${user.email}...`);
        
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: Number(smtpPort),
            secure: !!smtpSecure,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const bodyHtml = `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #334155; background-color: #f8fafc; border-radius: 24px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
  <div style="text-align: center; margin-bottom: 30px;">
    <h2 style="color: #714B67; font-size: 28px; font-weight: 800; margin: 0;">Restablecer Contraseña</h2>
    <p style="color: #64748b; font-size: 14px; margin-top: 8px;">Sistema de Control de Asistencias JASANA</p>
  </div>
  
  <div style="background-color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);">
    <p style="font-size: 16px; line-height: 1.6; margin-top: 0; color: #334155;">Hola,</p>
    <p style="font-size: 16px; line-height: 1.6; color: #334155;">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta de Administrador Maestro (${username}).</p>
    <p style="font-size: 16px; line-height: 1.6; color: #334155;">Tu contraseña temporal de 6 dígitos es:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <span style="display: inline-block; font-family: monospace; font-size: 36px; font-weight: 800; color: #714B67; letter-spacing: 6px; padding: 12px 30px; background-color: #f5f3f5; border: 1.5px dashed #714B67; border-radius: 12px; min-width: 180px;">${code}</span>
    </div>
    
    <p style="font-size: 14px; color: #e11d48; font-weight: 600; line-height: 1.6; margin-bottom: 0;">⚠️ IMPORTANTE: Por razones de seguridad, deberás actualizar esta contraseña temporal inmediatamente después de iniciar sesión.</p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #94a3b8;">
    <p style="margin: 0;">Este es un correo automático. Por favor, no respondas a este mensaje.</p>
  </div>
</div>
        `.trim();

        await transporter.sendMail({
            from: smtpFrom,
            to: user.email,
            subject: 'Tu contraseña temporal - JASANA',
            html: bodyHtml,
        });

        res.json({ success: true, message: 'Se ha enviado un correo con tu contraseña temporal.' });
    } catch (smtpError: any) {
        console.error('SMTP forgot password email sending failed:', smtpError);
        res.status(500).json({ error: `Error al enviar el correo: ${smtpError.message}` });
    }
}));

router.post('/auth/update-password', asyncHandler(async (req: Request, res: Response) => {
    const { username, currentPassword, newPassword } = req.body;

    if (!username || !currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Usuario, contraseña actual y contraseña nueva son requeridos' });
    }

    const { rows } = await pool.query(
        'SELECT * FROM users WHERE username = $1 AND password = $2',
        [username, currentPassword]
    );

    if (rows.length === 0) {
        return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
    }

    const user = rows[0];

    await pool.query(
        'UPDATE users SET password = $1, must_change_password = false WHERE id = $2',
        [newPassword, user.id]
    );

    res.json({ success: true, message: 'Contraseña actualizada con éxito.' });
}));

router.post('/auth/update-profile', asyncHandler(async (req: Request, res: Response) => {
    const { id, username, email, password } = req.body;

    if (!id || !username) {
        return res.status(400).json({ error: 'ID de usuario y nombre de usuario son requeridos' });
    }

    // First check if username is unique for other users
    const { rows: duplicateCheck } = await pool.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [username, id]
    );

    if (duplicateCheck.length > 0) {
        return res.status(409).json({ error: 'El nombre de usuario ya está en uso' });
    }

    let query = 'UPDATE users SET username = $1, email = $2';
    let params = [username, email || ''];

    if (password && password.trim()) {
        query += ', password = $3 WHERE id = $4 RETURNING *';
        params.push(password, id);
    } else {
        query += ' WHERE id = $3 RETURNING *';
        params.push(id);
    }

    const { rows } = await pool.query(query, params);
    
    if (rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const updatedUser = rows[0];
    
    // Fetch full_name from employees
    const { rows: empRows } = await pool.query(
        'SELECT full_name FROM employees WHERE id = $1',
        [updatedUser.employee_id]
    );

    updatedUser.employee_name = empRows[0]?.full_name || updatedUser.username;
    delete updatedUser.password; // Don't return password

    res.json(updatedUser);
}));

// Global Error Handler Middleware (to be used in index.ts)
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);

    if (err instanceof ZodError) {
        return res.status(400).json({
            error: 'Validation failed',
            details: err.issues.map((e: any) => ({ path: e.path, message: e.message }))
        });
    }

    if (err.code === '23505') { // Postgres unique violation
        return res.status(409).json({ error: 'Resource already exists' });
    }

    res.status(500).json({ error: err.message || 'Internal Server Error' });
};

export default router;
