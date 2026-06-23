-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_number text UNIQUE NOT NULL,
  full_name text NOT NULL,
  department text DEFAULT '',
  entry_time time DEFAULT '09:00',
  exit_time time DEFAULT '18:00',
  breakfast_start_time time DEFAULT '10:00',
  breakfast_end_time time DEFAULT '10:30',
  lunch_start_time time DEFAULT '14:00',
  lunch_end_time time DEFAULT '15:00',
  tolerance_minutes integer DEFAULT 15,
  payment_period text DEFAULT 'semanal' CHECK (payment_period IN ('semanal', 'quincenal')),
  created_at timestamptz DEFAULT now(),
  area_id uuid,
  position text DEFAULT ''
);

-- Create areas table
CREATE TABLE IF NOT EXISTS areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  position text NOT NULL DEFAULT '',
  supervisor_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  entry_time time DEFAULT '09:00',
  exit_time time DEFAULT '18:00',
  breakfast_start_time time DEFAULT '10:00',
  breakfast_end_time time DEFAULT '10:30',
  lunch_start_time time DEFAULT '14:00',
  lunch_end_time time DEFAULT '15:00',
  tolerance_minutes integer DEFAULT 15,
  created_at timestamptz DEFAULT now()
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  permission_type text NOT NULL CHECK (permission_type IN ('POR_HORAS', 'SALIDA_ANTICIPADA', 'ENTRADA_TARDE')),
  reason text NOT NULL CHECK (reason IN ('CITA_MEDICA', 'EMERGENCIA_FAMILIAR', 'TRAMITE_DOCUMENTOS', 'CITA_ESCOLAR', 'MOTIVO_PERSONAL', 'OTRO')),
  reason_other text DEFAULT '',
  permission_date date NOT NULL,
  exit_time time,
  entry_time time,
  created_at timestamptz DEFAULT now()
);

-- Create company_settings table
CREATE TABLE IF NOT EXISTS company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url text DEFAULT '',
  company_name text DEFAULT 'JASANA',
  odoo_url text DEFAULT '',
  odoo_db text DEFAULT '',
  odoo_username text DEFAULT '',
  odoo_api_key text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

-- Create attendance_logs table to store historical data from Odoo/Excel
CREATE TABLE IF NOT EXISTS attendance_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  employee_name text, -- fallback for when employee not found in local db
  check_in timestamptz NOT NULL,
  check_out timestamptz,
  worked_hours numeric,
  source text DEFAULT 'odoo', -- 'odoo' or 'excel'
  odoo_id integer, -- unique ID from Odoo to prevent duplicates
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_permissions_employee_id ON permissions(employee_id);
CREATE INDEX IF NOT EXISTS idx_permissions_date ON permissions(permission_date);
CREATE INDEX IF NOT EXISTS idx_employees_number ON employees(employee_number);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_check_in ON attendance_logs(check_in);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_odoo_id ON attendance_logs(odoo_id);

-- Add foreign key constraints that might be missing from initial setup
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'employees_area_id_fkey') THEN
        ALTER TABLE employees ADD CONSTRAINT employees_area_id_fkey FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'areas_supervisor_id_fkey') THEN
        ALTER TABLE areas ADD CONSTRAINT areas_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES employees(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create users table for Master Login
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL, -- Full name of the employee
  password text NOT NULL,
  role text DEFAULT 'master' CHECK (role IN ('master', 'admin', 'user')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
