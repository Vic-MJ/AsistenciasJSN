/*
  ============================================
  SISTEMA DE CONTROL DE ASISTENCIAS Y PERMISOS
  Compatible con PostgreSQL estándar
  ============================================
*/

-- Extensión necesaria para UUID
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- TABLA: SCHEDULES
-- ============================================

CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  
  entry_time time NOT NULL DEFAULT '09:00',
  exit_time time NOT NULL DEFAULT '18:00',

  breakfast_start_time time DEFAULT '10:00',
  breakfast_end_time time DEFAULT '10:30',

  lunch_start_time time DEFAULT '14:00',
  lunch_end_time time DEFAULT '15:00',

  tolerance_minutes integer DEFAULT 15,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- TABLA: EMPLOYEES
-- ============================================

CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_number text UNIQUE NOT NULL,
  full_name text NOT NULL,
  department text DEFAULT '',

  schedule_id uuid REFERENCES schedules(id) ON DELETE SET NULL,

  entry_time time DEFAULT '09:00',
  exit_time time DEFAULT '18:00',

  breakfast_start_time time DEFAULT '10:00',
  breakfast_end_time time DEFAULT '10:30',

  lunch_start_time time DEFAULT '14:00',
  lunch_end_time time DEFAULT '15:00',

  tolerance_minutes integer DEFAULT 15,

  created_at timestamptz DEFAULT now()
);

-- ============================================
-- TABLA: PERMISSIONS
-- ============================================

CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,

  permission_type text NOT NULL
  CHECK (permission_type IN (
    'POR_HORAS',
    'SALIDA_ANTICIPADA',
    'ENTRADA_TARDE'
  )),

  reason text NOT NULL
  CHECK (reason IN (
    'CITA_MEDICA',
    'EMERGENCIA_FAMILIAR',
    'TRAMITE_DOCUMENTOS',
    'CITA_ESCOLAR',
    'MOTIVO_PERSONAL',
    'OTRO'
  )),

  reason_other text DEFAULT '',

  permission_date date NOT NULL,

  exit_time time,
  entry_time time,

  created_at timestamptz DEFAULT now()
);

-- ============================================
-- TABLA: CONFIGURACIÓN DE EMPRESA
-- ============================================

CREATE TABLE IF NOT EXISTS company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url text DEFAULT '',
  company_name text DEFAULT 'JASANA',
  updated_at timestamptz DEFAULT now()
);

-- Insertar configuración inicial
INSERT INTO company_settings (company_name)
VALUES ('JASANA')
ON CONFLICT DO NOTHING;

-- ============================================
-- HABILITAR ROW LEVEL SECURITY
-- ============================================

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ELIMINAR POLÍTICAS SI EXISTEN
-- ============================================

DROP POLICY IF EXISTS employees_select ON employees;
DROP POLICY IF EXISTS employees_insert ON employees;
DROP POLICY IF EXISTS employees_update ON employees;
DROP POLICY IF EXISTS employees_delete ON employees;

DROP POLICY IF EXISTS schedules_all ON schedules;

DROP POLICY IF EXISTS permissions_select ON permissions;
DROP POLICY IF EXISTS permissions_insert ON permissions;
DROP POLICY IF EXISTS permissions_update ON permissions;
DROP POLICY IF EXISTS permissions_delete ON permissions;

DROP POLICY IF EXISTS settings_select ON company_settings;
DROP POLICY IF EXISTS settings_update ON company_settings;

-- ============================================
-- POLÍTICAS: EMPLOYEES
-- ============================================

CREATE POLICY employees_select
ON employees
FOR SELECT
TO PUBLIC
USING (true);

CREATE POLICY employees_insert
ON employees
FOR INSERT
TO PUBLIC
WITH CHECK (true);

CREATE POLICY employees_update
ON employees
FOR UPDATE
TO PUBLIC
USING (true)
WITH CHECK (true);

CREATE POLICY employees_delete
ON employees
FOR DELETE
TO PUBLIC
USING (true);

-- ============================================
-- POLÍTICAS: SCHEDULES
-- ============================================

CREATE POLICY schedules_all
ON schedules
FOR ALL
TO PUBLIC
USING (true)
WITH CHECK (true);

-- ============================================
-- POLÍTICAS: PERMISSIONS
-- ============================================

CREATE POLICY permissions_select
ON permissions
FOR SELECT
TO PUBLIC
USING (true);

CREATE POLICY permissions_insert
ON permissions
FOR INSERT
TO PUBLIC
WITH CHECK (true);

CREATE POLICY permissions_update
ON permissions
FOR UPDATE
TO PUBLIC
USING (true)
WITH CHECK (true);

CREATE POLICY permissions_delete
ON permissions
FOR DELETE
TO PUBLIC
USING (true);

-- ============================================
-- POLÍTICAS: COMPANY SETTINGS
-- ============================================

CREATE POLICY settings_select
ON company_settings
FOR SELECT
TO PUBLIC
USING (true);

CREATE POLICY settings_update
ON company_settings
FOR UPDATE
TO PUBLIC
USING (true)
WITH CHECK (true);

-- ============================================
-- ÍNDICES PARA RENDIMIENTO
-- ============================================

CREATE INDEX IF NOT EXISTS idx_employees_number
ON employees(employee_number);

CREATE INDEX IF NOT EXISTS idx_permissions_employee
ON permissions(employee_id);

CREATE INDEX IF NOT EXISTS idx_permissions_date
ON permissions(permission_date);

-- ============================================
-- TABLA: USUARIOS MAESTROS (LOGIN)
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL, -- Full name of the employee
  password text NOT NULL,
  role text DEFAULT 'master' CHECK (role IN ('master', 'admin', 'user')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_all ON users FOR ALL TO PUBLIC USING (true) WITH CHECK (true);