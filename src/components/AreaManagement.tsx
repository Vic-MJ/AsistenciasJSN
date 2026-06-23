import React, { useState, useEffect } from 'react';
import { api, Area, Employee } from '../lib/api';
import { Briefcase, User, Users, MapPin, Trash2, Edit2, Plus, X, Search, ChevronRight, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const AreaManagement = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArea, setEditingArea] = useState<Partial<Area> | null>(null);
  const [viewingMembers, setViewingMembers] = useState<Area | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    name: '',
    position: '',
    supervisor_id: '' as string | null
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [areasData, empsData] = await Promise.all([
        api.getAreas(),
        api.getEmployees()
      ]);
      setAreas(areasData);
      setEmployees(empsData);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingArea?.id) {
        await api.updateArea(editingArea.id, form);
        toast.success('Área actualizada');
      } else {
        await api.createArea(form);
        toast.success('Área creada');
      }
      setEditingArea(null);
      setForm({ name: '', position: '', supervisor_id: '' });
      loadData();
    } catch (error) {
      toast.error('Error al guardar área');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (area: Area) => {
    setEditingArea(area);
    setForm({
      name: area.name,
      position: area.position,
      supervisor_id: area.supervisor_id || ''
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta área?')) return;
    try {
      await api.deleteArea(id);
      toast.success('Área eliminada');
      loadData();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const filteredAreas = areas.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-1">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">Estructura Organizacional</h2>
          <p className="text-slate-500 font-normal text-sm text-pretty">Define departamentos, roles estratégicos y supervisión técnica.</p>
        </div>
        <button
          onClick={() => { setEditingArea({}); setForm({ name: '', position: '', supervisor_id: '' }); }}
          className="btn-premium flex items-center gap-2 group shadow-sm"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="uppercase tracking-wider text-[10px] font-semibold">Registrar Área</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Buscar departamento o posición..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-2.5 bg-white rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-brand-500/20 transition-all font-medium text-slate-800 placeholder:text-slate-400 outline-none text-sm"
              />
            </div>
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
               <button className="p-2 bg-brand-600 text-white rounded-lg shadow-sm active:scale-95 transition-all">
                  <Filter size={16} />
               </button>
               <span className="text-[10px] font-semibold text-slate-450 uppercase tracking-wider pr-4">Filtros</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAreas.map((area) => (
              <motion.div
                layout
                key={area.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200/60 p-6 group hover:border-brand-500/30 hover:shadow-md transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50/50 rounded-bl-2xl group-hover:bg-brand-50 transition-colors duration-500" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-slate-50 text-brand-600 rounded-xl group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-800 tracking-tight group-hover:text-brand-600 transition-colors leading-none mb-1.5">
                          {area.name}
                        </h4>
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                           <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Activo • {area.position}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => handleEdit(area)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-all border border-transparent">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(area.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-transparent">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-auto space-y-6">
                    <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-100 relative group/sup hover:border-indigo-100 hover:bg-indigo-50/20 transition-all">
                       <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Responsable Directo</span>
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold shadow-sm group-hover/sup:scale-105 transition-transform">
                            {area.supervisor_name?.[0] || 'S'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 tracking-tight leading-none mb-0.5">
                              {area.supervisor_name || 'Sin Asignar'}
                            </p>
                            <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Lidera Estrategia</p>
                          </div>
                       </div>
                    </div>

                    <button
                      onClick={() => setViewingMembers(area)}
                      className="w-full flex items-center justify-between p-3 bg-slate-950 text-white rounded-xl hover:bg-brand-600 transition-all shadow-sm active:scale-[0.98] group/btn"
                    >
                      <div className="flex items-center gap-2.5">
                         <div className="p-1.5 bg-white/10 rounded-lg group-hover/btn:rotate-6 transition-transform">
                            <Users size={14} />
                         </div>
                         <span className="text-[10px] font-semibold uppercase tracking-wider">Ver Integrantes</span>
                      </div>
                      <ChevronRight size={14} className="opacity-40 group-hover/btn:opacity-100" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredAreas.length === 0 && !loading && (
              <div className="col-span-full py-20 text-center">
                <div className="flex flex-col items-center gap-6">
                  <div className="p-8 bg-slate-50 rounded-2xl text-slate-200 border border-slate-100 shadow-inner">
                    <Briefcase size={48} />
                  </div>
                  <div className="space-y-1.5">
                     <h4 className="text-lg font-bold text-slate-800 tracking-tight leading-none">Sin coincidencias</h4>
                     <p className="text-slate-400 font-medium max-w-sm mx-auto text-sm leading-relaxed text-pretty">No localizamos departamentos con "{searchTerm}". Intenta buscar por cargo o nombre de área.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-md relative overflow-hidden group">
              <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-brand-500/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-1000" />
              <h3 className="text-lg font-bold mb-0.5 relative z-10 tracking-tight">Estatus Operativo</h3>
              <p className="text-white/40 text-[9px] font-semibold uppercase tracking-wider mb-6 relative z-10">Métricas Generales</p>
              
              <div className="grid grid-cols-1 gap-4 relative z-10">
                <div className="bg-white/5 border border-white/5 backdrop-blur-md p-4 rounded-xl flex items-center gap-4">
                   <div className="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400">
                      <Briefcase size={20} />
                   </div>
                   <div>
                      <div className="text-xl font-bold leading-none">{areas.length}</div>
                      <div className="text-[9px] font-semibold uppercase tracking-wider text-white/30 mt-0.5">Áreas Activas</div>
                   </div>
                </div>
                <div className="bg-white/5 border border-white/5 backdrop-blur-md p-4 rounded-xl flex items-center gap-4">
                   <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Users size={20} />
                   </div>
                   <div>
                      <div className="text-xl font-bold leading-none">{new Set(areas.map(a => a.supervisor_id).filter(id => !!id)).size}</div>
                      <div className="text-[9px] font-semibold uppercase tracking-wider text-white/30 mt-0.5">Supervisores</div>
                   </div>
                </div>
              </div>
           </div>

           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 relative overflow-hidden">
              <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-6">Guía Estructural</h4>
              <ul className="space-y-6 relative z-10">
                <li className="flex gap-3 group">
                  <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-brand-600 font-bold text-[10px] group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm">01</div>
                  <div className="flex-1">
                     <p className="text-slate-800 font-bold text-xs mb-0.5">Jerarquía Clara</p>
                     <p className="text-slate-500 text-xs font-normal leading-normal">Asocia departamentos a responsables para delegar autoridad.</p>
                  </div>
                </li>
                <li className="flex gap-3 group">
                  <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-brand-600 font-bold text-[10px] group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm">02</div>
                  <div className="flex-1">
                     <p className="text-slate-800 font-bold text-xs mb-0.5">Visibilidad</p>
                     <p className="text-slate-500 text-xs font-normal leading-normal">Haz clic en el nombre del área para ver quiénes la integran.</p>
                  </div>
                </li>
              </ul>
            </div>
         </div>
      </div>

      <AnimatePresence>
        {editingArea && (
          <motion.div
            key="editing-area-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-955/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-600 text-white rounded-xl shadow-sm">
                    <Briefcase size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                      {editingArea.id ? 'Refinar Área' : 'Crear Nueva Área'}
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Configuración del organigrama</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingArea(null)}
                  className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Identificador de Departamento</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input-premium"
                      placeholder="Ej. Ingeniería de Planta"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Descripción del Cargo Principal</label>
                    <input
                      type="text"
                      value={form.position}
                      onChange={(e) => setForm({ ...form, position: e.target.value })}
                      className="input-premium"
                      placeholder="Ej. Líder Técnico / Gerente"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Responsable del Área</label>
                    <div className="relative">
                      <select
                        value={form.supervisor_id || ''}
                        onChange={(e) => setForm({ ...form, supervisor_id: e.target.value || null })}
                        className="input-premium appearance-none pr-10"
                      >
                        <option value="">Selecciona quien lidera...</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.full_name} (#{emp.employee_number})</option>
                        ))}
                      </select>
                      <User size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingArea(null)}
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
                      {editingArea.id ? 'Actualizar Registro' : 'Confirmar Creación'}
                    </span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingMembers && (
          <motion.div
            key="viewing-members-modal-overlay"
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
                  <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
                    <Users size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">{viewingMembers.name}</h3>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Personal Asignado • {employees.filter(e => e.area_id === viewingMembers.id).length} Integrantes</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingMembers(null)}
                  className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[50vh] p-6 space-y-3 custom-scrollbar">
                {employees.filter(e => e.area_id === viewingMembers.id).length === 0 ? (
                  <div className="py-16 text-center">
                     <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-250">
                        <Users size={32} />
                     </div>
                     <p className="text-slate-400 font-semibold text-sm">No hay colaboradores en esta sección.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {employees.filter(e => e.area_id === viewingMembers.id).map(emp => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={emp.id} 
                        className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 group hover:border-brand-500/30 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-brand-400 font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                            {emp.full_name[0]}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-sm tracking-tight leading-none mb-1">{emp.full_name}</div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-medium text-slate-400 tracking-wider font-mono">ID {emp.employee_number}</span>
                              <span className="w-1 h-1 rounded-full bg-brand-500" />
                              <span className="text-[9px] font-semibold text-brand-600 uppercase tracking-wider">{emp.position || 'OPERADOR GENERAL'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded-md text-[9px] font-semibold uppercase tracking-wider border border-brand-100/50">Activo</div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                <button
                  onClick={() => setViewingMembers(null)}
                  className="w-full py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold uppercase tracking-wider text-[11px] hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                >
                  Finalizar Vista
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AreaManagement;
