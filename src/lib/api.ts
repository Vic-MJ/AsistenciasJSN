const API_URL = '/api';

export interface Area {
    id: string;
    name: string;
    position: string;
    supervisor_id: string | null;
    supervisor_name?: string;
    created_at?: string;
}

export interface Schedule {
    id: string;
    name: string;
    entry_time: string;
    exit_time: string;
    breakfast_start_time: string;
    breakfast_end_time: string;
    lunch_start_time: string;
    lunch_end_time: string;
    tolerance_minutes: number;
    created_at: string;
}

export interface Employee {
    id: string;
    employee_number: string;
    no_empleado?: string | null;
    full_name: string;
    department: string;
    area_id?: string | null;
    area_name?: string;
    position?: string;
    schedule_id?: string | null;
    schedule_name?: string;
    entry_time?: string;
    exit_time?: string;
    breakfast_start_time?: string;
    breakfast_end_time?: string;
    lunch_start_time?: string;
    lunch_end_time?: string;
    tolerance_minutes?: number;
    payment_period?: 'semanal' | 'quincenal';
    birthday?: string | null;
    zodiac_sign?: string | null;
    work_email?: string | null;
    private_email?: string | null;
    created_at: string;
}

export interface Permission {
    id: string;
    employee_id: string;
    permission_type: 'POR_HORAS' | 'SALIDA_ANTICIPADA' | 'ENTRADA_TARDE';
    reason: 'CITA_MEDICA' | 'EMERGENCIA_FAMILIAR' | 'TRAMITE_DOCUMENTOS' | 'CITA_ESCOLAR' | 'MOTIVO_PERSONAL' | 'OTRO';
    reason_other: string;
    permission_date: string;
    exit_time: string | null;
    entry_time: string | null;
    created_at: string;
}

export interface CompanySettings {
    id: string;
    logo_url: string;
    company_name: string;
    odoo_url?: string;
    odoo_db?: string;
    odoo_username?: string;
    odoo_api_key?: string;
    smtp_host?: string;
    smtp_port?: number;
    smtp_secure?: boolean;
    smtp_user?: string;
    smtp_pass?: string;
    smtp_from?: string;
    gemini_api_key?: string;
    updated_at: string;
}

export const api = {
    // Employees
    getEmployees: async (): Promise<Employee[]> => {
        const res = await fetch(`${API_URL}/employees`);
        if (!res.ok) throw new Error('Failed to fetch employees');
        return res.json();
    },

    createEmployee: async (employee: Omit<Employee, 'id' | 'created_at'>): Promise<Employee> => {
        const res = await fetch(`${API_URL}/employees`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employee),
        });
        if (!res.ok) throw new Error('Failed to create employee');
        return res.json();
    },

    updateEmployee: async (id: string, employee: Partial<Omit<Employee, 'id' | 'created_at'>>): Promise<Employee> => {
        const res = await fetch(`${API_URL}/employees/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employee),
        });
        if (!res.ok) throw new Error('Failed to update employee');
        return res.json();
    },

    deleteEmployee: async (id: string): Promise<void> => {
        const res = await fetch(`${API_URL}/employees/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete employee');
    },

    deleteAllEmployees: async (): Promise<void> => {
        const res = await fetch(`${API_URL}/employees`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete all employees');
    },

    upsertEmployees: async (employees: Omit<Employee, 'id' | 'created_at'>[]): Promise<void> => {
        const res = await fetch(`${API_URL}/employees/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employees)
        });
        if (!res.ok) throw new Error('Failed to upsert employees');
    },

    // Permissions
    getPermissions: async (): Promise<Permission[]> => {
        const res = await fetch(`${API_URL}/permissions`);
        if (!res.ok) throw new Error('Failed to fetch permissions');
        return res.json();
    },

    createPermission: async (permission: Omit<Permission, 'id' | 'created_at'>): Promise<Permission> => {
        const res = await fetch(`${API_URL}/permissions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(permission),
        });
        if (!res.ok) throw new Error('Failed to create permission');
        return res.json();
    },

    updatePermission: async (id: string, permission: Omit<Permission, 'id' | 'created_at'>): Promise<Permission> => {
        const res = await fetch(`${API_URL}/permissions/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(permission),
        });
        if (!res.ok) throw new Error('Failed to update permission');
        return res.json();
    },

    deletePermission: async (id: string): Promise<void> => {
        const res = await fetch(`${API_URL}/permissions/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete permission');
    },

    deleteAllPermissions: async (): Promise<void> => {
        const res = await fetch(`${API_URL}/permissions`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete all permissions');
    },

    // Settings
    getSettings: async (): Promise<CompanySettings> => {
        const res = await fetch(`${API_URL}/settings`);
        if (!res.ok) throw new Error('Failed to fetch settings');
        return res.json();
    },

    updateSettings: async (settings: Partial<CompanySettings>): Promise<CompanySettings> => {
        const res = await fetch(`${API_URL}/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
        if (!res.ok) throw new Error('Failed to update settings');
        return res.json();
    },

    // Schedules
    getSchedules: async (): Promise<Schedule[]> => {
        const res = await fetch(`${API_URL}/schedules`);
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to fetch schedules');
        }
        return res.json();
    },

    createSchedule: async (schedule: Omit<Schedule, 'id' | 'created_at'>): Promise<Schedule> => {
        const res = await fetch(`${API_URL}/schedules`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(schedule),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to create schedule');
        }
        return res.json();
    },

    updateSchedule: async (id: string, schedule: Partial<Omit<Schedule, 'id' | 'created_at'>>): Promise<Schedule> => {
        const res = await fetch(`${API_URL}/schedules/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(schedule),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to update schedule');
        }
        return res.json();
    },

    deleteSchedule: async (id: string): Promise<void> => {
        const res = await fetch(`${API_URL}/schedules/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to delete schedule');
        }
    },

    // Areas
    getAreas: async (): Promise<Area[]> => {
        const res = await fetch(`${API_URL}/areas`);
        if (!res.ok) throw new Error('Failed to fetch areas');
        return res.json();
    },

    createArea: async (area: Omit<Area, 'id' | 'created_at'>): Promise<Area> => {
        const res = await fetch(`${API_URL}/areas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(area),
        });
        if (!res.ok) throw new Error('Failed to create area');
        return res.json();
    },

    updateArea: async (id: string, area: Partial<Omit<Area, 'id' | 'created_at'>>): Promise<Area> => {
        const res = await fetch(`${API_URL}/areas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(area),
        });
        if (!res.ok) throw new Error('Failed to update area');
        return res.json();
    },

    deleteArea: async (id: string): Promise<void> => {
        const res = await fetch(`${API_URL}/areas/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete area');
    },

    // Bulk Management
    bulkUpdateEmployees: async (employeeIds: string[], data: Partial<Employee>): Promise<void> => {
        const res = await fetch(`${API_URL}/employees/bulk`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeIds, data }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Failed bulk update');
        }
    },

    // Odoo
    testOdooConnection: async (settings: Partial<CompanySettings>): Promise<{ success: boolean; message: string }> => {
        const res = await fetch(`${API_URL}/odoo/test-connection`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
        return res.json();
    },

    fetchOdooAttendance: async (params: { start_date: string; end_date: string; employee_ids?: string[]; payment_period?: 'semanal' | 'quincenal' }): Promise<any[]> => {
        const res = await fetch(`${API_URL}/odoo/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Error al obtener datos de Odoo');
        }
        return res.json();
    },
    
    getAttendanceLogs: async (startDate?: string, endDate?: string): Promise<any[]> => {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        const res = await fetch(`${API_URL}/attendance-logs?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch attendance logs');
        return res.json();
    },

    // Users
    getUsers: async (): Promise<any[]> => {
        const res = await fetch(`${API_URL}/users`);
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
    },

    createUser: async (userData: { employee_id: string; username: string; password: string; role?: string }): Promise<any> => {
        const res = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to create user');
        }
        return res.json();
    },

    deleteUser: async (id: string): Promise<void> => {
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete user');
    },

    updateUser: async (id: string, userData: { role: string; password?: string }): Promise<any> => {
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to update user');
        }
        return res.json();
    },

    login: async (username: string, password: string): Promise<any> => {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Login failed');
        }
        return res.json();
    },

    syncBirthdays: async (): Promise<{ success: boolean; message: string }> => {
        const res = await fetch(`${API_URL}/odoo/sync-birthdays`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to sync birthdays');
        }
        return res.json();
    },

    sendBirthdayEmail: async (emailData: { email_to: string; subject: string; body_html: string; attachments?: any[] }): Promise<{ success: boolean; message: string }> => {
        const res = await fetch(`${API_URL}/odoo/send-birthday-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to send birthday email');
        }
        return res.json();
    },

    forgotPassword: async (username: string): Promise<{ success: boolean; message: string }> => {
        const res = await fetch(`${API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to request temporary password');
        }
        return res.json();
    },

    updatePassword: async (passwordData: { username: string; currentPassword: string; newPassword: string }): Promise<{ success: boolean; message: string }> => {
        const res = await fetch(`${API_URL}/auth/update-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(passwordData),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to update password');
        }
        return res.json();
    },

    updateProfile: async (profileData: { id: string; username: string; email: string; password?: string }): Promise<any> => {
        const res = await fetch(`${API_URL}/auth/update-profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to update profile');
        }
        return res.json();
    },

    generateBirthdayMessage: async (params: { full_name: string; position?: string; department?: string; zodiac_sign?: string }): Promise<{ subject: string; headerText: string; bodyText1: string; bodyText2: string }> => {
        const res = await fetch(`${API_URL}/generate-birthday-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Error al generar el mensaje con IA');
        }
        return res.json();
    }
};


