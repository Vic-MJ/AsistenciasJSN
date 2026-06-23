import { useState, useEffect } from 'react';
import { Trash2, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { api, Employee, Schedule, Area } from '../lib/api';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';

import EmployeeForms from './employee/EmployeeForms';
import EmployeeTable from './employee/EmployeeTable';
import ScheduleModal from './employee/ScheduleModal';
import BulkEditModal from './employee/BulkEditModal';
import UserConversionModal from './employee/UserConversionModal';
import ConfirmationModal from './employee/ConfirmationModal';

interface EmployeeManagementProps {
  currentUser?: any;
}

export default function EmployeeManagement({ currentUser }: EmployeeManagementProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modals visibility state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Employee | null>(null);
  const [convertingEmployee, setConvertingEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  useEffect(() => {
    loadEmployees();
    loadSchedules();
    loadAreas();
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadAreas = async () => {
    try {
      const data = await api.getAreas();
      setAreas(data);
    } catch (error) {
      console.error('Error loading areas:', error);
    }
  };

  const loadSchedules = async () => {
    try {
      const data = await api.getSchedules();
      setSchedules(data);
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  };

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await api.getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (employees.length === 0) {
      toast.error('No hay empleados para exportar');
      return;
    }

    const dataToExport = employees.map(emp => ({
      'ID Sistema': emp.id,
      'Nombre Completo': emp.full_name,
      'No. Empleado': emp.employee_number,
      'Área / Departamento': (emp as any).area_name || emp.department || 'Sin Área',
      'Puesto': emp.position || 'Sin Puesto',
      'Periodo de Pago': emp.payment_period,
      'Plantilla Horario': (emp as any).schedule_name || 'Personalizado',
      'Entrada': emp.entry_time,
      'Salida': emp.exit_time,
      'Tolerancia (min)': emp.tolerance_minutes
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Empleados');
    
    // Auto-size columns based on header length
    const wscols = Object.keys(dataToExport[0]).map(key => ({ wch: Math.max(key.length + 5, 15) }));
    worksheet['!cols'] = wscols;

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(blob, `Directorio_Empleados_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Archivo Excel generado');
  };

  const handleDelete = async () => {
    if (!employeeToDelete) return;
    setLoading(true);
    try {
      await api.deleteEmployee(employeeToDelete);
      await loadEmployees();
      toast.success('Empleado eliminado exitosamente');
      setEmployeeToDelete(null);
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Error al eliminar empleado');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    setLoading(true);
    try {
      await api.deleteAllEmployees();
      await loadEmployees();
      toast.success('Todos los empleados han sido eliminados');
      setShowDeleteAllConfirm(false);
    } catch (error) {
      console.error('Error deleting all employees:', error);
      toast.error('Error al eliminar empleados');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = (filtered: Employee[]) => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(e => e.id));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-1 text-pretty">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">
            Directorio de Personal
          </h2>
          <p className="text-slate-500 font-normal text-sm">Administra el padrón de empleados y sus asignaciones.</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-4 py-2.5 rounded-xl transition-all text-xs font-semibold border border-emerald-100 active:scale-95 shadow-sm"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Exportar Excel</span>
          </button>

          {employees.length > 0 && (
            <button
              onClick={() => setShowDeleteAllConfirm(true)}
              className="flex items-center gap-2 text-rose-600 hover:text-rose-700 bg-rose-50 px-4 py-2.5 rounded-xl transition-all text-xs font-semibold border border-rose-100 active:scale-95 shadow-sm"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Eliminar Todos</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Left Col: Forms */}
        <EmployeeForms onSuccess={loadEmployees} />

        {/* Right Col: List */}
        <div className="lg:col-span-3">
          <EmployeeTable 
            employees={employees}
            areas={areas}
            schedules={schedules}
            users={users}
            currentUser={currentUser}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onClearSelection={() => setSelectedIds([])}
            onOpenBulkModal={() => setShowBulkModal(true)}
            onEditSchedule={setEditingSchedule}
            onDelete={setEmployeeToDelete}
            onConvertToUser={setConvertingEmployee}
          />
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {editingSchedule && (
          <ScheduleModal 
            key="schedule-modal"
            employee={editingSchedule} 
            schedules={schedules} 
            areas={areas} 
            onClose={() => setEditingSchedule(null)} 
            onSuccess={loadEmployees} 
          />
        )}

        {showBulkModal && (
          <BulkEditModal 
            key="bulk-edit-modal"
            selectedIds={selectedIds} 
            schedules={schedules} 
            areas={areas} 
            onClose={() => setShowBulkModal(false)} 
            onSuccess={() => {
              setSelectedIds([]);
              loadEmployees();
            }} 
          />
        )}

        {convertingEmployee && (
          <UserConversionModal 
            key="user-conversion-modal"
            employee={convertingEmployee} 
            existingUser={users.find(u => u.employee_id === convertingEmployee.id)}
            onClose={() => setConvertingEmployee(null)} 
            onSuccess={() => {
              loadUsers();
              loadEmployees();
            }} 
          />
        )}

        {employeeToDelete && (
          <ConfirmationModal
            key="delete-employee-modal"
            title="Eliminar Empleado"
            description="¿Está seguro que desea eliminar a este empleado del sistema? Se perderá la configuración de su horario pero los registros de asistencia históricos podrían verse afectados."
            confirmText="Sí, Eliminar"
            isDestructive={true}
            loading={loading}
            onConfirm={handleDelete}
            onClose={() => setEmployeeToDelete(null)}
          />
        )}

        {showDeleteAllConfirm && (
          <ConfirmationModal
            key="delete-all-modal"
            title="Eliminar Directorio Completo"
            description="¡ADVERTENCIA! Está a punto de eliminar a TODOS los empleados de la base de datos. Esta acción no se puede deshacer y desvinculará todos los registros asociados a ellos."
            confirmText="Borrar Todo"
            requireMatch="ELIMINAR"
            isDestructive={true}
            loading={loading}
            onConfirm={handleDeleteAll}
            onClose={() => setShowDeleteAllConfirm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
