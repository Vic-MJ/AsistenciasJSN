import { z } from 'zod';

export const areaSchema = z.object({
    name: z.string().min(1, 'El nombre del área/departamento es requerido'),
    position: z.string().min(1, 'El puesto es requerido'),
    supervisor_id: z.string().uuid().nullable().optional(),
});

export const scheduleSchema = z.object({
    name: z.string().min(1, 'El nombre del horario es requerido'),
    entry_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Hora de entrada inválida').default('09:00'),
    exit_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Hora de salida inválida').default('18:00'),
    breakfast_start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Hora de inicio de desayuno inválida').default('10:00'),
    breakfast_end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Hora de fin de desayuno inválida').default('10:30'),
    lunch_start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Hora de inicio de comida inválida').default('14:00'),
    lunch_end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Hora de fin de comida inválida').default('15:00'),
    tolerance_minutes: z.number().int().min(0).default(15),
});

export const employeeSchema = z.object({
    full_name: z.string().min(1, 'El nombre es requerido'),
    employee_number: z.string().min(1, 'El número de empleado es requerido'),
    no_empleado: z.string().optional().nullable(),
    department: z.string().optional(),
    area_id: z.string().uuid().nullable().optional(),
    position: z.string().optional(),
    schedule_id: z.string().uuid().nullable().optional(),
    entry_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Hora de entrada inválida').optional(),
    exit_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Hora de salida inválida').optional(),
    breakfast_start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Hora de inicio de desayuno inválida').optional(),
    breakfast_end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Hora de fin de desayuno inválida').optional(),
    lunch_start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Hora de inicio de comida inválida').optional(),
    lunch_end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Hora de fin de comida inválida').optional(),
    tolerance_minutes: z.number().int().min(0).optional(),
    payment_period: z.enum(['semanal', 'quincenal']).optional().default('semanal'),
    birthday: z.string().optional().nullable(),
    zodiac_sign: z.string().optional().nullable(),
    work_email: z.string().optional().nullable(),
    private_email: z.string().optional().nullable(),
});

export const employeeUpdateSchema = employeeSchema.partial();

export const permissionSchema = z.object({
    employee_id: z.string().uuid('ID de empleado inválido'),
    permission_type: z.enum(['POR_HORAS', 'SALIDA_ANTICIPADA', 'ENTRADA_TARDE']),
    reason: z.enum(['CITA_MEDICA', 'EMERGENCIA_FAMILIAR', 'TRAMITE_DOCUMENTOS', 'CITA_ESCOLAR', 'MOTIVO_PERSONAL', 'OTRO']),
    reason_other: z.string().optional().default(''),
    permission_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (YYYY-MM-DD)'),
    exit_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Hora de salida inválida').optional().nullable(),
    entry_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Hora de entrada inválida').optional().nullable(),
});

export const settingsSchema = z.object({
    logo_url: z.string().optional(),
    company_name: z.string().min(1).optional(),
    odoo_url: z.string().optional(),
    odoo_db: z.string().optional(),
    odoo_username: z.string().optional(),
    odoo_api_key: z.string().optional(),
    smtp_host: z.string().optional().nullable(),
    smtp_port: z.number().optional().nullable(),
    smtp_secure: z.boolean().optional().nullable(),
    smtp_user: z.string().optional().nullable(),
    smtp_pass: z.string().optional().nullable(),
    smtp_from: z.string().optional().nullable(),
    gemini_api_key: z.string().optional().nullable(),
});

export const userSchema = z.object({
    employee_id: z.string().uuid('ID de empleado inválido'),
    username: z.string().min(1, 'El nombre de usuario es requerido'),
    password: z.string().min(4, 'La contraseña debe tener al menos 4 caracteres'),
    role: z.enum(['master', 'admin', 'user']).default('master'),
});

