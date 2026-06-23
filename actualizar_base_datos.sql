-- AGREGAR CAMPOS DE ODOO A LA TABLA DE CONFIGURACIÓN
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS odoo_url TEXT DEFAULT '';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS odoo_db TEXT DEFAULT '';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS odoo_username TEXT DEFAULT '';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS odoo_api_key TEXT DEFAULT '';

-- AGREGAR CAMPO DE PERIODO DE PAGO A LA TABLA DE EMPLEADOS
ALTER TABLE employees ADD COLUMN IF NOT EXISTS payment_period TEXT DEFAULT 'semanal' CHECK (payment_period IN ('semanal', 'quincenal'));

-- CREAR TABLA PARA PERSISTENCIA DE ASISTENCIAS (LOGS)
CREATE TABLE IF NOT EXISTS attendance_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  employee_name text,
  check_in timestamptz NOT NULL,
  check_out timestamptz,
  worked_hours numeric,
  source text DEFAULT 'odoo',
  odoo_id integer UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- ÍNDICES PARA MEJORAR RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_attendance_logs_check_in ON attendance_logs(check_in);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_odoo_id ON attendance_logs(odoo_id);
