import { useState, useEffect } from 'react';
import { Trash2, Edit2, Calendar, AlertCircle, History, Filter, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, Employee, Permission } from '../lib/api';
import { toast } from 'sonner';

const PERMISSION_TYPES = {
  POR_HORAS: 'Por Horas',
  SALIDA_ANTICIPADA: 'Salida Anticipada',
  ENTRADA_TARDE: 'Entrada Tarde'
};

const REASONS = {
  CITA_MEDICA: 'Cita Médica',
  EMERGENCIA_FAMILIAR: 'Emergencia Familiar',
  TRAMITE_DOCUMENTOS: 'Trámite de Documentos',
  CITA_ESCOLAR: 'Cita Escolar',
  MOTIVO_PERSONAL: 'Motivo Personal',
  OTRO: 'Otro (Especificar)'
};

export default function PermissionForm() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [permissions, setPermissions] = useState<(Permission & { employee?: Employee })[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const [form, setForm] = useState({
    employee_id: '',
    permission_type: 'POR_HORAS' as Permission['permission_type'],
    reason: 'CITA_MEDICA' as Permission['reason'],
    reason_other: '',
    permission_date: '',
    exit_time: '',
    entry_time: ''
  });

  useEffect(() => {
    loadEmployees();
    loadPermissions();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await api.getEmployees();
      setEmployees(data);
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar empleados');
    }
  };

  const loadPermissions = async () => {
    try {
      const [perms, emps] = await Promise.all([
        api.getPermissions(),
        api.getEmployees()
      ]);
      const permissionsWithEmployees = perms.map((perm) => ({
        ...perm,
        employee: emps.find((e) => e.id === perm.employee_id)
      }));
      setPermissions(permissionsWithEmployees);
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar permisos');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.permission_type === 'POR_HORAS' && (!form.exit_time || !form.entry_time)) {
      toast.error('Error: Permiso por horas requiere ambos horarios');
      return;
    }
    if (form.permission_type === 'SALIDA_ANTICIPADA' && !form.exit_time) {
      toast.error('Error: Salida anticipada requiere hora de salida');
      return;
    }
    if (form.permission_type === 'ENTRADA_TARDE' && !form.entry_time) {
      toast.error('Error: Entrada tarde requiere hora de entrada');
      return;
    }
    if (form.reason === 'OTRO' && !form.reason_other.trim()) {
      toast.error('Error: Debe especificar el motivo');
      return;
    }

    const permissionData = {
      employee_id: form.employee_id,
      permission_type: form.permission_type,
      reason: form.reason,
      reason_other: form.reason_other,
      permission_date: form.permission_date,
      exit_time: form.exit_time || null,
      entry_time: form.entry_time || null
    };

    try {
      if (editingId) {
        await api.updatePermission(editingId, permissionData);
        toast.success('Permiso actualizado exitosamente');
      } else {
        await api.createPermission(permissionData);
        toast.success('Permiso registrado exitosamente');
      }
      resetForm();
      loadPermissions();
    } catch (error) {
      toast.error(editingId ? 'Error al actualizar permiso' : 'Error al registrar permiso');
      console.error(error);
    }
  };

  const resetForm = () => {
    setForm({
      employee_id: '',
      permission_type: 'POR_HORAS',
      reason: 'CITA_MEDICA',
      reason_other: '',
      permission_date: '',
      exit_time: '',
      entry_time: ''
    });
    setEditingId(null);
  };

  const handleEdit = (perm: Permission) => {
    setForm({
      employee_id: perm.employee_id,
      permission_type: perm.permission_type,
      reason: perm.reason,
      reason_other: perm.reason_other || '',
      permission_date: perm.permission_date,
      exit_time: perm.exit_time || '',
      entry_time: perm.entry_time || ''
    });
    setEditingId(perm.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este permiso?')) return;

    try {
      await api.deletePermission(id);
      toast.success('Permiso eliminado exitosamente');
      loadPermissions();
    } catch (error) {
      toast.error('Error al eliminar permiso');
      console.error(error);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm(`¿Está seguro de eliminar los ${displayedPermissions.length} permisos visibles? Esta acción no se puede deshacer.`)) return;

    try {
      await Promise.all(displayedPermissions.map(p => api.deletePermission(p.id)));
      toast.success('Permisos eliminados exitosamente');
      loadPermissions();
    } catch (error) {
      toast.error('Error al eliminar permisos');
      console.error(error);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Fecha no válida';
    const dateToParse = dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`;
    const date = new Date(dateToParse);
    if (isNaN(date.getTime())) return 'Fecha no válida';

    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const getPayrollWeekStart = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysSinceFriday = (dayOfWeek + 2) % 7;
    const start = new Date(today);
    start.setDate(today.getDate() - daysSinceFriday);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const getFilteredPermissions = (active: boolean) => {
    const weekStart = getPayrollWeekStart();
    const weekStartStr = weekStart.toISOString().split('T')[0];

    return permissions.filter(perm => {
      let dateStr = '';
      if (typeof perm.permission_date === 'string') {
        dateStr = perm.permission_date.split('T')[0];
      } else {
        try {
          dateStr = new Date(perm.permission_date).toISOString().split('T')[0];
        } catch (e) { return false; }
      }

      if (active) {
        return dateStr >= weekStartStr;
      } else {
        return dateStr < weekStartStr;
      }
    });
  };

  const activePermissions = getFilteredPermissions(true);
  const historyPermissions = getFilteredPermissions(false);
  const displayedPermissions = showHistory ? historyPermissions : activePermissions;

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
            Logística de Excepciones
          </h2>
          <p className="text-slate-500 font-medium text-lg text-pretty">Gestión técnica de autorizaciones, permisos especiales y movilidad del personal.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
          <div className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-sm sticky top-8">
            <div className="flex items-center gap-6 mb-12">
              <div className="p-5 bg-brand-600 text-white rounded-[2rem] shadow-2xl shadow-brand-500/30">
                <Plus size={32} />
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
                  {editingId ? 'Refinar Permiso' : 'Registrar Acción'}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Protocolo de Asistencia</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">
                    Seleccionar Colaborador
                  </label>
                  <select
                    value={form.employee_id}
                    onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
                    required
                    className="input-premium py-6 font-black text-lg"
                  >
                    <option value="">Buscar en nómina...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.full_name} (#{emp.employee_number})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">
                      Clasificación
                    </label>
                    <select
                      value={form.permission_type}
                      onChange={(e) => setForm({ ...form, permission_type: e.target.value as Permission['permission_type'] })}
                      required
                      className="input-premium py-5 font-black text-base"
                    >
                      {Object.entries(PERMISSION_TYPES).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">
                      Categoría
                    </label>
                    <select
                      value={form.reason}
                      onChange={(e) => setForm({ ...form, reason: e.target.value as Permission['reason'] })}
                      required
                      className="input-premium py-5 font-black text-base"
                    >
                      {Object.entries(REASONS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <AnimatePresence>
                  {form.reason === 'OTRO' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100"
                    >
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">
                        Justificación Específica
                      </label>
                      <input
                        type="text"
                        value={form.reason_other}
                        onChange={(e) => setForm({ ...form, reason_other: e.target.value })}
                        required={form.reason === 'OTRO'}
                        className="input-premium py-4"
                        placeholder="Describa el motivo del permiso..."
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">
                      Fecha de Incidencia
                    </label>
                    <div className="relative group">
                      <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-400" size={24} />
                      <input
                        type="date"
                        value={form.permission_date}
                        onChange={(e) => setForm({ ...form, permission_date: e.target.value })}
                        required
                        className="input-premium py-6 font-black text-lg pr-14"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    {(form.permission_type === 'POR_HORAS' || form.permission_type === 'SALIDA_ANTICIPADA') && (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">
                          Hora Retiro
                        </label>
                        <input
                          type="time"
                          value={form.exit_time}
                          onChange={(e) => setForm({ ...form, exit_time: e.target.value })}
                          required
                          className="input-premium py-5 font-black text-lg text-rose-500"
                        />
                      </motion.div>
                    )}

                    {(form.permission_type === 'POR_HORAS' || form.permission_type === 'ENTRADA_TARDE') && (
                      <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">
                          Hora Retorno
                        </label>
                        <input
                          type="time"
                          value={form.entry_time}
                          onChange={(e) => setForm({ ...form, entry_time: e.target.value })}
                          required
                          className="input-premium py-5 font-black text-lg text-emerald-500"
                        />
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-6 pt-6 border-t border-slate-50">
                <button
                  type="submit"
                  className="flex-[2] btn-premium py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-brand-600/30"
                >
                  {editingId ? 'Actualizar Registro' : 'Confirmar Folio'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 bg-slate-100 text-slate-500 rounded-[2rem] hover:bg-slate-200 transition-all font-black uppercase tracking-[0.2em] text-[10px]"
                  >
                    Salir
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white rounded-[4rem] flex flex-col h-full min-h-[900px] border border-slate-100 overflow-hidden shadow-sm">
            <div className="p-12 border-b border-slate-50 flex flex-col xl:flex-row items-center justify-between gap-10 bg-slate-50/50">
              <div className="flex items-center gap-6">
                <div className={`p-5 rounded-[2rem] shadow-2xl transition-all duration-700 ${showHistory ? 'bg-slate-900 text-brand-400' : 'bg-brand-600 text-white shadow-brand-500/40'}`}>
                  {showHistory ? <History size={32} /> : <Filter size={32} />}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-3xl tracking-tighter">
                    {showHistory ? 'Archivo Histórico' : 'Vigencia de Ciclo'}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">
                    {showHistory
                      ? 'Depósito de registros anteriores'
                      : 'Relación de autorizaciones del periodo actual'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`
                        flex-1 sm:flex-none px-8 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all border shadow-sm
                        ${showHistory
                      ? 'bg-brand-600 text-white border-brand-500 shadow-xl shadow-brand-500/20'
                      : 'bg-white text-slate-900 border-slate-100 hover:bg-slate-50'
                    }
                    `}
                >
                  {showHistory ? 'Ver Activos' : 'Ir al Historial'}
                </button>

                {displayedPermissions.length > 0 && (
                  <button
                    onClick={handleDeleteAll}
                    className="p-5 text-rose-500 bg-white hover:bg-rose-50 rounded-[1.5rem] border border-slate-100 hover:border-rose-100 transition-all shadow-sm hover:shadow-xl hover:shadow-rose-500/10"
                  >
                    <Trash2 size={24} />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar p-12 space-y-8">
              <AnimatePresence mode="wait">
                {displayedPermissions.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-32 text-center"
                  >
                    <div className="w-28 h-28 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-100 shadow-inner">
                      <AlertCircle size={64} className="text-slate-200" />
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight">Sin Movimientos</h4>
                    <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2">No se han detectado registros para la vista seleccionada en este ciclo.</p>
                  </motion.div>
                ) : (
                  <div className="grid gap-6">
                    {displayedPermissions.map((perm) => (
                      <motion.div
                        layout
                        key={perm.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-8 rounded-[3rem] border border-slate-100 group hover:border-brand-500/30 hover:shadow-2xl hover:shadow-brand-500/5 transition-all relative overflow-hidden"
                      >
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[1.8rem] bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-400 font-black text-lg shadow-xl group-hover:bg-brand-600 group-hover:text-white transition-all duration-500">
                              {perm.employee?.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-xl font-black text-slate-900 tracking-tighter leading-none mb-3 group-hover:text-brand-600 transition-colors">
                                {perm.employee?.full_name || 'Personal sin identificación'}
                              </h4>
                              <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                  ID {perm.employee?.employee_number}
                                </span>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                  <Calendar size={12} className="text-brand-500" />
                                  {formatDate(perm.permission_date)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 border-t xl:border-t-0 pt-6 xl:pt-0 border-slate-50">
                            <div className="px-5 py-2.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-black uppercase tracking-widest">
                              {PERMISSION_TYPES[perm.permission_type]}
                            </div>
                            <div className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest max-w-[180px] truncate shadow-lg shadow-slate-900/20">
                              {perm.reason === 'OTRO' ? perm.reason_other : REASONS[perm.reason]}
                            </div>

                            <div className="flex items-center gap-4 xl:pl-6 xl:border-l border-slate-100">
                              {perm.exit_time && (
                                <div className="flex flex-col">
                                   <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Salida</span>
                                   <span className="text-sm font-black text-rose-600 tracking-tight">{perm.exit_time}</span>
                                </div>
                              )}
                              {perm.entry_time && (
                                <div className="flex flex-col">
                                   <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Entrada</span>
                                   <span className="text-sm font-black text-emerald-600 tracking-tight">{perm.entry_time}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-3 xl:opacity-0 group-hover:opacity-100 transition-all border-t xl:border-t-0 pt-6 xl:pt-0 border-slate-50">
                            <button
                              onClick={() => handleEdit(perm)}
                              className="p-4 text-slate-400 hover:text-brand-600 hover:bg-white rounded-[1.2rem] transition-all shadow-sm hover:shadow-md border border-transparent hover:border-slate-100"
                            >
                              <Edit2 size={20} />
                            </button>
                            <button
                              onClick={() => handleDelete(perm.id)}
                              className="p-4 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-[1.2rem] transition-all border border-transparent hover:border-rose-100"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
