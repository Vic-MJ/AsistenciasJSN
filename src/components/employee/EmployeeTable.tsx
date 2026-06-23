import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, AlertCircle, Settings, X, Clock, CheckSquare, Square, Briefcase, ShieldCheck, UserCheck, ChevronLeft, ChevronRight, Filter, Trash2 } from 'lucide-react';
import { Employee, Area, Schedule } from '../../lib/api';

interface EmployeeTableProps {
  employees: Employee[];
  areas: Area[];
  schedules: Schedule[];
  users: any[];
  currentUser: any;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (filtered: Employee[]) => void;
  onClearSelection: () => void;
  onOpenBulkModal: () => void;
  onEditSchedule: (emp: Employee) => void;
  onDelete: (id: string) => void;
  onConvertToUser: (emp: Employee) => void;
}

export default function EmployeeTable({
  employees,
  areas,
  schedules: _schedules,
  users,
  currentUser,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onOpenBulkModal,
  onEditSchedule,
  onDelete,
  onConvertToUser
}: EmployeeTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState<string>('');
  const [filterPayment, setFilterPayment] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            emp.employee_number.includes(searchTerm);
      const matchesArea = filterArea ? emp.area_id === filterArea : true;
      const matchesPayment = filterPayment ? emp.payment_period === filterPayment : true;
      
      return matchesSearch && matchesArea && matchesPayment;
    });
  }, [employees, searchTerm, filterArea, filterPayment]);

  const totalPages = Math.ceil(filteredEmployees.length / pageSize);
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, currentPage]);

  // Reset to page 1 if filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, filterArea, filterPayment]);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 flex flex-col h-full max-h-[850px] overflow-hidden">
      <div className="p-4 flex flex-col items-stretch justify-start gap-4 relative border-b border-slate-100">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-sm">
              <Users size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg tracking-tight">Directorio</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">{filteredEmployees.length} Empleados Activos</p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex justify-end gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Buscar colaborador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-6 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-950 focus:ring-2 focus:ring-brand-500/20 focus:bg-white placeholder:text-slate-400 font-medium outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-2.5 rounded-xl">
          <div className="flex items-center gap-1.5 text-slate-400">
             <Filter size={14} />
             <span className="text-[10px] font-semibold uppercase tracking-wider">Filtros</span>
          </div>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          
          <select 
            value={filterArea} 
            onChange={(e) => setFilterArea(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
          >
            <option value="">Todas las Áreas</option>
            {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>

          <select 
            value={filterPayment} 
            onChange={(e) => setFilterPayment(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
          >
            <option value="">Todos los Periodos</option>
            <option value="semanal">Semanal</option>
            <option value="quincenal">Quincenal</option>
          </select>
        </div>

        {/* Bulk Actions Menu (Fixed Bottom) */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div 
              initial={{ y: 100, x: '-50%', opacity: 0 }}
              animate={{ y: -30, x: '-50%', opacity: 1 }}
              exit={{ y: 100, x: '-50%', opacity: 0 }}
              className="fixed bottom-0 left-1/2 px-6 py-4 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center gap-6 z-[100] min-w-[360px] border border-white/10 backdrop-blur-md"
            >
              <div className="flex flex-col">
                 <span className="text-[9px] font-semibold uppercase tracking-wider text-white/40 mb-0.5">Operación Masiva</span>
                 <span className="text-sm font-semibold text-white">
                   {selectedIds.length} Seleccionados
                 </span>
              </div>
              
              <div className="w-px h-8 bg-white/10" />
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={onOpenBulkModal}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-all shadow-sm active:scale-95 flex items-center gap-2"
                >
                  <Settings size={14} />
                  Configurar Lote
                </button>
                
                <button 
                  onClick={onClearSelection}
                  className="p-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-xl transition-all"
                  title="Descartar selección"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="overflow-y-auto flex-1 custom-scrollbar p-2">
        <AnimatePresence mode="wait">
          {employees.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-center py-20"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
                <AlertCircle size={32} className="text-slate-350" />
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">Directorio Vacío</h4>
              <p className="text-slate-500 max-w-xs mx-auto font-normal text-sm leading-relaxed">Agrega personal manualmente o mediante carga masiva de Excel.</p>
            </motion.div>
          ) : filteredEmployees.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center py-16 text-slate-400 font-medium text-sm">
              No se encontraron empleados con los filtros actuales.
            </div>
          ) : (
            <div className="space-y-1">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm">
                  <tr className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="px-4 py-3.5 w-16">
                      <button 
                        onClick={() => onSelectAll(filteredEmployees)}
                        className={`p-2 rounded-lg transition-all ${selectedIds.length > 0 && selectedIds.length === filteredEmployees.length ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-50 text-slate-300 hover:text-slate-500'}`}
                      >
                        {selectedIds.length > 0 && selectedIds.length === filteredEmployees.length ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                    </th>
                    <th className="px-3 py-3.5">Personal</th>
                    <th className="px-3 py-3.5">Ubicación y Rol</th>
                    <th className="px-4 py-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {paginatedEmployees.map((emp) => (
                    <motion.tr 
                      layout
                      key={emp.id} 
                      className={`group border-l-2 transition-all ${selectedIds.includes(emp.id) ? 'border-brand-500 bg-brand-50/5' : 'border-transparent hover:bg-slate-50/50 hover:border-slate-200'}`}
                    >
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => onToggleSelect(emp.id)}
                          className={`p-2 rounded-lg transition-all ${selectedIds.includes(emp.id) ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 text-slate-300 hover:text-slate-500 group-hover:bg-white'}`}
                        >
                          {selectedIds.includes(emp.id) ? <CheckSquare size={14} /> : <Square size={14} />}
                        </button>
                      </td>
                      <td className="px-3 py-3">
                         <div className="flex flex-col">
                             <div className="flex items-center gap-2">
                               <span className="text-sm font-bold text-slate-800 tracking-tight group-hover:text-brand-600 transition-colors">
                                 {emp.full_name}
                               </span>
                               {users.some(u => u.employee_id === emp.id) && (
                                 <span className={`text-[8px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider ${users.find(u => u.employee_id === emp.id)?.role === 'master' ? 'bg-brand-600 text-white' : 'bg-amber-500 text-white'}`}>
                                   {users.find(u => u.employee_id === emp.id)?.role === 'master' ? 'Maestro' : 'Admin'}
                                 </span>
                               )}
                             </div>
                             <span className="text-[10px] font-medium text-slate-450 tracking-wider font-mono mt-0.5">#{emp.employee_number}{emp.no_empleado ? ` (${emp.no_empleado})` : ''}</span>
                          </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {(emp as any).area_name ? (
                            <span className="text-[9px] bg-slate-900 text-white px-2.5 py-1 rounded-md font-semibold uppercase tracking-wider flex items-center gap-1.5">
                              <Briefcase size={10} className="text-brand-400" /> { (emp as any).area_name }
                            </span>
                          ) : (
                            <span className="text-[9px] bg-slate-100 text-slate-400 px-2.5 py-1 rounded-md font-semibold uppercase tracking-wider">Sin Área</span>
                          )}
                          {emp.position ? (
                            <span className="text-[9px] bg-brand-50 text-brand-700 px-2.5 py-1 rounded-md font-semibold uppercase tracking-wider flex items-center gap-1.5 border border-brand-100/50">
                              { emp.position }
                            </span>
                          ) : (
                            <span className="text-[9px] bg-slate-100 text-slate-400 px-2.5 py-1 rounded-md font-semibold uppercase tracking-wider">Sin Puesto</span>
                          )}
                          {(emp as any).schedule_name && (
                            <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-semibold uppercase tracking-wider flex items-center gap-1.5 border border-emerald-100/50">
                              <Clock size={10} /> { (emp as any).schedule_name }
                            </span>
                          )}
                          <span className={`text-[9px] px-2.5 py-1 rounded-md font-semibold uppercase tracking-wider border ${emp.payment_period === 'quincenal' ? 'bg-purple-50 text-purple-700 border-purple-100/50' : 'bg-blue-50 text-blue-700 border-blue-100/50'}`}>
                            {emp.payment_period || 'semanal'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          {currentUser?.role === 'master' && (
                            <>
                              {!users.some(u => u.employee_id === emp.id) ? (
                                <button
                                  onClick={() => onConvertToUser(emp)}
                                  className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                                  title="Dar Acceso al Sistema"
                                >
                                  <ShieldCheck size={18} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => onConvertToUser(emp)}
                                  className="p-2 text-emerald-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                                  title="Editar Credenciales y Acceso"
                                >
                                  <UserCheck size={18} />
                                </button>
                              )}
                            </>
                          )}
                          <button
                            onClick={() => onEditSchedule(emp)}
                            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                            title="Configurar Detalle"
                          >
                            <Settings size={18} />
                          </button>
                          <button
                            onClick={() => onDelete(emp.id)}
                            className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-semibold text-slate-455 uppercase tracking-wider">
            Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredEmployees.length)} de {filteredEmployees.length}
          </p>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, i) => {
                if (i === 0 || i === totalPages - 1 || Math.abs(i + 1 - currentPage) <= 1) {
                  return (
                    <button 
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${currentPage === i + 1 ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      {i + 1}
                    </button>
                  );
                } else if (Math.abs(i + 1 - currentPage) === 2) {
                  return <span key={i} className="text-slate-300 px-1 text-xs">...</span>;
                }
                return null;
              })}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Need to add Trash2 to lucide imports since it wasn't there
