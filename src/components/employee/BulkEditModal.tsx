import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, X, Clock, Briefcase, AlertCircle } from 'lucide-react';
import { Area, Schedule, api } from '../../lib/api';
import { toast } from 'sonner';

interface BulkEditModalProps {
  selectedIds: string[];
  schedules: Schedule[];
  areas: Area[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkEditModal({ selectedIds, schedules, areas, onClose, onSuccess }: BulkEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    area_id: '',
    schedule_id: '',
    department: '',
    position: '',
    payment_period: ''
  });

  const handleApply = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      const dataToUpdate: any = {};
      if (bulkForm.schedule_id) dataToUpdate.schedule_id = bulkForm.schedule_id;
      if (bulkForm.area_id) dataToUpdate.area_id = bulkForm.area_id;
      if (bulkForm.department) dataToUpdate.department = bulkForm.department;
      if (bulkForm.position) dataToUpdate.position = bulkForm.position;
      if (bulkForm.payment_period) dataToUpdate.payment_period = bulkForm.payment_period;

      if (bulkForm.schedule_id) {
        const s = schedules.find(x => x.id === bulkForm.schedule_id);
        if (s) {
          dataToUpdate.entry_time = s.entry_time;
          dataToUpdate.exit_time = s.exit_time;
          dataToUpdate.breakfast_start_time = s.breakfast_start_time;
          dataToUpdate.breakfast_end_time = s.breakfast_end_time;
          dataToUpdate.lunch_start_time = s.lunch_start_time;
          dataToUpdate.lunch_end_time = s.lunch_end_time;
          dataToUpdate.tolerance_minutes = s.tolerance_minutes;
        }
      }

      await api.bulkUpdateEmployees(selectedIds, dataToUpdate);
      toast.success(`Se actualizaron ${selectedIds.length} empleados`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Error en actualización masiva');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-600 text-white rounded-lg shadow-md">
              <CheckSquare size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 leading-tight">Edición en Bloque</h3>
              <div className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mt-1 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Modificando {selectedIds.length} Perfiles
              </div>
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

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Asignar Horario Común</label>
              <div className="relative">
                <select
                  value={bulkForm.schedule_id}
                  onChange={(e) => setBulkForm({ ...bulkForm, schedule_id: e.target.value })}
                  className="input-premium pr-10 appearance-none font-medium text-sm py-2"
                >
                  <option value="">Mantener horarios actuales...</option>
                  {schedules.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.entry_time} - {s.exit_time})</option>
                  ))}
                </select>
                <Clock size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-500 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Nueva Área / Departamento</label>
              <div className="relative">
                <select
                  value={bulkForm.area_id}
                  onChange={(e) => {
                    const area = areas.find(a => a.id === e.target.value);
                    setBulkForm({ 
                      ...bulkForm, 
                      area_id: e.target.value,
                      department: area ? area.name : '',
                    });
                  }}
                  className="input-premium pr-10 appearance-none font-medium text-sm py-2"
                >
                  <option value="">Mantener áreas actuales...</option>
                  {areas.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <Briefcase size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cyan-500 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Sobrescribir Puesto</label>
              <input
                type="text"
                value={bulkForm.position}
                onChange={(e) => setBulkForm({ ...bulkForm, position: e.target.value })}
                className="input-premium font-medium text-sm py-2"
                placeholder="Ej. Operador A (Opcional)"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Periodo de Pago</label>
              <select
                value={bulkForm.payment_period}
                onChange={(e) => setBulkForm({ ...bulkForm, payment_period: e.target.value })}
                className="input-premium pr-10 appearance-none font-medium text-sm py-2"
              >
                <option value="">Mantener periodos actuales...</option>
                <option value="semanal">Semanal</option>
                <option value="quincenal">Quincenal</option>
              </select>
            </div>
          </div>
          <div className="p-4 bg-slate-900 rounded-xl border border-white/10 flex gap-3">
            <AlertCircle size={20} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] font-medium text-slate-300 leading-normal">
              Atención: Los campos seleccionados sobrescribirán la información actual de todos los empleados marcados. <span className="text-white font-semibold underline">Esta acción es definitiva.</span>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-glass flex-1 text-sm py-2"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              disabled={loading || (!bulkForm.schedule_id && !bulkForm.area_id && !bulkForm.position)}
              className="btn-premium flex-[2] text-sm py-2"
            >
              Confirmar y Aplicar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
