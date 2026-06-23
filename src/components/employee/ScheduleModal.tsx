import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, X, Clock, Briefcase, Users } from 'lucide-react';
import { Area, Schedule, Employee, api } from '../../lib/api';
import { toast } from 'sonner';

interface ScheduleModalProps {
  employee: Employee | null;
  schedules: Schedule[];
  areas: Area[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function ScheduleModal({ employee, schedules, areas, onClose, onSuccess }: ScheduleModalProps) {
  const [loading, setLoading] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    full_name: '',
    employee_number: '',
    no_empleado: '',
    department: '',
    area_id: null as string | null,
    position: '',
    schedule_id: null as string | null,
    entry_time: '09:00',
    exit_time: '18:00',
    breakfast_start_time: '10:00',
    breakfast_end_time: '10:30',
    lunch_start_time: '14:00',
    lunch_end_time: '15:00',
    tolerance_minutes: 15,
    payment_period: 'semanal' as 'semanal' | 'quincenal',
  });

  useEffect(() => {
    if (employee) {
      setScheduleForm({
        full_name: employee.full_name || '',
        employee_number: employee.employee_number || '',
        no_empleado: employee.no_empleado || '',
        department: employee.department || '',
        area_id: employee.area_id || null,
        position: employee.position || '',
        schedule_id: employee.schedule_id || null,
        entry_time: employee.entry_time || '09:00',
        exit_time: employee.exit_time || '18:00',
        breakfast_start_time: employee.breakfast_start_time || '10:00',
        breakfast_end_time: employee.breakfast_end_time || '10:30',
        lunch_start_time: employee.lunch_start_time || '14:00',
        lunch_end_time: employee.lunch_end_time || '15:00',
        tolerance_minutes: employee.tolerance_minutes ?? 15,
        payment_period: employee.payment_period || 'semanal',
      });
    }
  }, [employee]);

  if (!employee) return null;

  const handleScheduleChange = (scheduleId: string | null) => {
    if (!scheduleId) {
      setScheduleForm({ ...scheduleForm, schedule_id: null });
      return;
    }
    const selected = schedules.find(s => s.id === scheduleId);
    if (selected) {
      setScheduleForm({
        ...scheduleForm,
        schedule_id: selected.id,
        entry_time: selected.entry_time,
        exit_time: selected.exit_time,
        breakfast_start_time: selected.breakfast_start_time,
        breakfast_end_time: selected.breakfast_end_time,
        lunch_start_time: selected.lunch_start_time,
        lunch_end_time: selected.lunch_end_time,
        tolerance_minutes: selected.tolerance_minutes,
      });
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    
    setLoading(true);
    try {
      await api.updateEmployee(employee.id, scheduleForm);
      toast.success('Expediente actualizado exitosamente');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Error al actualizar expediente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 text-white rounded-lg shadow-md">
              <Settings size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 leading-tight">Expediente de Personal</h3>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{employee.full_name} • #{employee.employee_number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSaveSchedule} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Nombre Completo</label>
              <input
                type="text"
                value={scheduleForm.full_name}
                onChange={(e) => setScheduleForm({ ...scheduleForm, full_name: e.target.value })}
                className="input-premium font-medium text-sm py-2"
                placeholder="Nombre del empleado"
                required
              />
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">No. Empleado</label>
              <input
                type="text"
                value={scheduleForm.employee_number}
                onChange={(e) => setScheduleForm({ ...scheduleForm, employee_number: e.target.value })}
                className="input-premium font-medium text-sm py-2"
                placeholder="Número de identificación"
                required
              />
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">No. Empleado Odoo</label>
              <input
                type="text"
                value={scheduleForm.no_empleado}
                onChange={(e) => setScheduleForm({ ...scheduleForm, no_empleado: e.target.value })}
                className="input-premium font-medium text-sm py-2"
                placeholder="Número Odoo (Ej. 078)"
              />
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Plantilla Horario</label>
              <div className="relative">
                <select
                  value={scheduleForm.schedule_id || ''}
                  onChange={(e) => handleScheduleChange(e.target.value || null)}
                  className="input-premium pr-10 appearance-none font-medium text-sm py-2"
                >
                  <option value="">Personalizado...</option>
                  {schedules.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <Clock size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            
            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Área / Depto.</label>
              <div className="relative">
                <select
                  value={scheduleForm.area_id || ''}
                  onChange={(e) => {
                    const area = areas.find(a => a.id === e.target.value);
                    setScheduleForm({ 
                      ...scheduleForm, 
                      area_id: e.target.value || null,
                      department: area ? area.name : scheduleForm.department,
                      position: area ? area.position : scheduleForm.position
                    });
                  }}
                  className="input-premium pr-10 appearance-none font-medium text-sm py-2"
                >
                  <option value="">Sin Asignar...</option>
                  {areas.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <Briefcase size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Cargo / Puesto</label>
              <input
                type="text"
                value={scheduleForm.position}
                onChange={(e) => setScheduleForm({ ...scheduleForm, position: e.target.value })}
                className="input-premium font-medium text-sm py-2"
                placeholder="Ej. Auditor de Calidad"
              />
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Departamento (Texto)</label>
              <input
                type="text"
                value={scheduleForm.department}
                onChange={(e) => setScheduleForm({ ...scheduleForm, department: e.target.value })}
                className="input-premium font-medium text-sm py-2"
                placeholder="Ej. Producción"
              />
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Periodo de Pago</label>
              <select
                value={scheduleForm.payment_period}
                onChange={(e) => setScheduleForm({ ...scheduleForm, payment_period: e.target.value as any })}
                className="input-premium appearance-none font-medium text-sm py-2"
              >
                <option value="semanal">Semanal</option>
                <option value="quincenal">Quincenal</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4">
             <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Entrada Oficina</label>
                <input
                  type="time"
                  value={scheduleForm.entry_time}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, entry_time: e.target.value, schedule_id: null })}
                  required
                  className="input-premium bg-white font-semibold text-sm py-2 text-center"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Salida Oficina</label>
                <input
                  type="time"
                  value={scheduleForm.exit_time}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, exit_time: e.target.value, schedule_id: null })}
                  required
                  className="input-premium bg-white font-semibold text-sm py-2 text-center"
                />
              </div>
             </div>

             <hr className="border-slate-200/40" />

             <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'Intervalo Desayuno', start: 'breakfast_start_time', end: 'breakfast_end_time', icon: Users, color: 'text-brand-500', bg: 'bg-brand-50' },
                { label: 'Intervalo Comida', start: 'lunch_start_time', end: 'lunch_end_time', icon: Clock, color: 'text-indigo-500', bg: 'bg-indigo-50' }
              ].map((row, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 ${row.bg} ${row.color} rounded-lg`}>
                      <row.icon size={14} />
                    </div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{row.label}</label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     <input
                      type="time"
                      value={(scheduleForm as any)[row.start]}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, [row.start]: e.target.value, schedule_id: null })}
                      className="input-premium bg-white font-medium text-sm py-2 text-center"
                    />
                    <input
                      type="time"
                      value={(scheduleForm as any)[row.end]}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, [row.end]: e.target.value, schedule_id: null })}
                      className="input-premium bg-white font-medium text-sm py-2 text-center"
                    />
                  </div>
                </div>
              ))}
             </div>

             <div className="pt-1">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1 text-center">Tolerancia de Entrada</label>
              <div className="flex items-center justify-center gap-4">
                 <button 
                   type="button" 
                   onClick={() => setScheduleForm({ ...scheduleForm, tolerance_minutes: Math.max(0, scheduleForm.tolerance_minutes - 5) })}
                   className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all font-semibold text-sm shadow-sm active:scale-95"
                 >-</button>
                 <div className="flex flex-col items-center">
                    <span className="text-xl font-bold text-slate-900 leading-none">{scheduleForm.tolerance_minutes}</span>
                    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Minutos</span>
                 </div>
                 <button 
                   type="button" 
                   onClick={() => setScheduleForm({ ...scheduleForm, tolerance_minutes: scheduleForm.tolerance_minutes + 5 })}
                   className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all font-semibold text-sm shadow-sm active:scale-95"
                 >+</button>
              </div>
             </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-glass flex-1 text-sm py-2"
            >
              Descartar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-premium flex-[2] text-sm py-2"
            >
              {loading ? 'Actualizando...' : 'Actualizar Expediente'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
