import { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Edit3, Clock, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, Schedule } from '../lib/api';
import { toast } from 'sonner';

export default function ScheduleManagement() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Partial<Schedule> | null>(null);
  
  const [form, setForm] = useState<Omit<Schedule, 'id' | 'created_at'>>({
    name: '',
    entry_time: '09:00',
    exit_time: '18:00',
    breakfast_start_time: '10:00',
    breakfast_end_time: '10:30',
    lunch_start_time: '14:00',
    lunch_end_time: '15:00',
    tolerance_minutes: 15,
  });

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const data = await api.getSchedules();
      setSchedules(data);
    } catch (error) {
      console.error('Error loading schedules:', error);
      toast.error('Error al cargar horarios');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingSchedule?.id) {
        await api.updateSchedule(editingSchedule.id, form);
        toast.success('Horario actualizado exitosamente');
      } else {
        await api.createSchedule(form);
        toast.success('Horario creado exitosamente');
      }
      setEditingSchedule(null);
      resetForm();
      loadSchedules();
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Error al guardar el horario: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setForm({
      name: schedule.name,
      entry_time: schedule.entry_time,
      exit_time: schedule.exit_time,
      breakfast_start_time: schedule.breakfast_start_time,
      breakfast_end_time: schedule.breakfast_end_time,
      lunch_start_time: schedule.lunch_start_time,
      lunch_end_time: schedule.lunch_end_time,
      tolerance_minutes: schedule.tolerance_minutes,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este horario? Los empleados que lo usan quedarán con horario personalizado.')) return;
    try {
      await api.deleteSchedule(id);
      loadSchedules();
      toast.success('Horario eliminado');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Error al eliminar horario');
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      entry_time: '09:00',
      exit_time: '18:00',
      breakfast_start_time: '10:00',
      breakfast_end_time: '10:30',
      lunch_start_time: '14:00',
      lunch_end_time: '15:00',
      tolerance_minutes: 15,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-1">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">
            Catálogo de Jornadas
          </h2>
          <p className="text-slate-500 font-normal text-sm">Diseña y gestiona las plantillas para el control de asistencia.</p>
        </div>
        <button
          onClick={() => { setEditingSchedule({}); resetForm(); }}
          className="btn-premium flex items-center gap-2 group shadow-sm"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="uppercase tracking-wider text-[10px] font-semibold">Nueva Plantilla</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {schedules.map((schedule) => (
            <motion.div
              key={schedule.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all group flex flex-col h-full relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-2.5 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                  <Clock size={20} />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(schedule)}
                    className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-1 mb-6">
                 <h3 className="text-base font-bold text-slate-800 tracking-tight leading-none mb-1.5">{schedule.name}</h3>
                 <div className="flex items-center gap-2">
                    <span className="text-[9px] font-semibold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">Activo</span>
                    <span className="w-1 h-1 rounded-full bg-slate-250" />
                    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{schedule.tolerance_minutes}m Tol.</span>
                 </div>
              </div>

              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-xl border border-slate-100 group-hover:bg-white transition-colors duration-300">
                  <div className="flex items-center gap-2">
                     <div className="w-1 h-6 bg-brand-500 rounded-full" />
                     <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Jornada</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{schedule.entry_time} — {schedule.exit_time}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-indigo-50/30 rounded-xl border border-indigo-100/30 group-hover:bg-white transition-colors duration-300">
                    <span className="block text-[9px] font-semibold text-indigo-500 uppercase tracking-wider mb-1">Desayuno</span>
                    <span className="text-xs font-semibold text-slate-700">{schedule.breakfast_start_time} - {schedule.breakfast_end_time}</span>
                  </div>
                  <div className="p-3 bg-fuchsia-50/30 rounded-xl border border-fuchsia-100/30 group-hover:bg-white transition-colors duration-300">
                    <span className="block text-[9px] font-semibold text-fuchsia-505 uppercase tracking-wider mb-1">Comida</span>
                    <span className="text-xs font-semibold text-slate-700">{schedule.lunch_start_time} - {schedule.lunch_end_time}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {schedules.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200/80">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 shadow-inner">
                <AlertCircle size={32} />
             </div>
             <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-1">Repositorio Vacío</h3>
             <p className="text-slate-500 font-normal text-sm max-w-sm mx-auto">No se han definido plantillas de horario estructurales para la organización.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editingSchedule && (
          <motion.div
            key="edit-schedule-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden border border-slate-200 flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-600 text-white rounded-xl shadow-sm">
                    <Calendar size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                      {editingSchedule.id ? 'Refinar Plantilla' : 'Nueva Estructura'}
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Parámetros Cronológicos</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingSchedule(null)}
                  className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-4 max-h-[50vh] overflow-y-auto px-1 custom-scrollbar">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Alias del Horario</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      placeholder="Ej. MATUTINO CRÍTICO 07:00"
                      className="input-premium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Arranque</label>
                      <input
                        type="time"
                        value={form.entry_time}
                        onChange={(e) => setForm({ ...form, entry_time: e.target.value })}
                        required
                        className="input-premium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Cierre</label>
                      <input
                        type="time"
                        value={form.exit_time}
                        onChange={(e) => setForm({ ...form, exit_time: e.target.value })}
                        required
                        className="input-premium"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50/50 p-4 rounded-xl space-y-6 border border-slate-100">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-3 bg-indigo-500 rounded-full" />
                        <label className="block text-[10px] font-semibold text-slate-450 uppercase tracking-wider">Intervalo Desayuno</label>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <input
                          type="time"
                          value={form.breakfast_start_time}
                          onChange={(e) => setForm({ ...form, breakfast_start_time: e.target.value })}
                          required
                          className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-semibold text-slate-700 p-1"
                        />
                        <div className="px-2 text-[10px] font-semibold text-slate-300 uppercase tracking-wider">—</div>
                        <input
                          type="time"
                          value={form.breakfast_end_time}
                          onChange={(e) => setForm({ ...form, breakfast_end_time: e.target.value })}
                          required
                          className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-semibold text-slate-700 p-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-3 bg-fuchsia-500 rounded-full" />
                        <label className="block text-[10px] font-semibold text-slate-450 uppercase tracking-wider">Intervalo Comida</label>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <input
                          type="time"
                          value={form.lunch_start_time}
                          onChange={(e) => setForm({ ...form, lunch_start_time: e.target.value })}
                          required
                          className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-semibold text-slate-700 p-1"
                        />
                        <div className="px-2 text-[10px] font-semibold text-slate-300 uppercase tracking-wider">—</div>
                        <input
                          type="time"
                          value={form.lunch_end_time}
                          onChange={(e) => setForm({ ...form, lunch_end_time: e.target.value })}
                          required
                          className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-semibold text-slate-700 p-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Margen de Tolerancia (Minutos)</label>
                      <input
                        type="number"
                        min="0"
                        value={form.tolerance_minutes}
                        onChange={(e) => setForm({ ...form, tolerance_minutes: parseInt(e.target.value) || 0 })}
                        required
                        className="input-premium bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingSchedule(null)}
                    className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all font-semibold uppercase tracking-wider text-[10px]"
                  >
                    Descartar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] btn-premium py-2.5 rounded-xl shadow-sm"
                  >
                    <span className="uppercase tracking-wider text-[11px] font-semibold">
                      {editingSchedule.id ? 'Actualizar Plantilla' : 'Confirmar Creación'}
                    </span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
