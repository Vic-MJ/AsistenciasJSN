import { useState, useEffect } from 'react';
import { AlertTriangle, Calendar, Users, Clock, Search, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { api, Employee, Permission } from '../lib/api';
import { generateAttendanceReport } from '../utils/excelGenerator';
import { generateIncidentsReport } from '../utils/incidentsGenerator';

// Sub-components
import GlobalObservationForm, { GlobalObservation } from './attendance/GlobalObservationForm';
import ReportActions from './attendance/ReportActions';
import SystemStatus from './attendance/SystemStatus';

export default function AttendanceProcessor() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [processing, setProcessing] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [showPermissionWarning, setShowPermissionWarning] = useState(false);
  const [globalObservations, setGlobalObservations] = useState<GlobalObservation[]>([{ date: '', text: '' }]);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>('06:00');
  const [endTime, setEndTime] = useState<string>('22:00');
  const [periodType, setPeriodType] = useState<'todos' | 'semanal' | 'quincenal'>('todos');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [odooAttendance, setOdooAttendance] = useState<any[]>([]);
  const [useOdooData, setUseOdooData] = useState(false);
  const [autoExit, setAutoExit] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [emp, perm, sett] = await Promise.all([api.getEmployees(), api.getPermissions(), api.getSettings()]);
      setEmployees(emp); setPermissions(perm); if (sett?.logo_url) setLogoPreview(sett.logo_url);
    } catch (e) { toast.error('Error cargando datos'); }
  };



  const handleFetchOdooData = async () => {
    setProcessing(true);
    try {
      const data = await api.fetchOdooAttendance({
        start_date: `${startDate} ${startTime}:00`,
        end_date: `${endDate} ${endTime}:00`,
        employee_ids: selectedEmployeeIds.length > 0 ? selectedEmployeeIds : undefined,
        payment_period: periodType !== 'todos' ? periodType : undefined
      });
      if (!data.length) { toast.error('No hay registros'); return; }
      const filtered = data.filter(r => {
        const d = new Date(r.entrada), m = d.getHours() * 60 + d.getMinutes();
        const s = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
        const e = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
        return m >= s && m <= e;
      });
      setOdooAttendance(filtered); setUseOdooData(true);
      toast.success(`${data.length} registros obtenidos`);
    } catch (e: any) { toast.error(e.message); } finally { setProcessing(false); }
  };

  const handleGenerateClick = () => {
    if (!useOdooData) { toast.error('Obtenga datos de Odoo primero'); return; }
    if (permissions.length > 0) setShowPermissionWarning(true); else processAndGenerate();
  };

  const processAndGenerate = async () => {
    setShowPermissionWarning(false); setProcessing(true);
    try {
      try {
        toast.info('Sincronizando números de empleado desde Odoo...');
        await api.syncBirthdays();
      } catch (error) {
        console.warn('Odoo sync failed, generating report with cached data:', error);
      }
      const freshEmployees = await api.getEmployees();
      setEmployees(freshEmployees);

      if (!useOdooData) { toast.error('No hay registros válidos'); return; }
      const records = odooAttendance.map(r => ({ ...r, entrada: new Date(r.entrada), salida: r.salida ? new Date(r.salida) : null }));

      await generateAttendanceReport(records, freshEmployees, permissions, logoPreview, startDate, endDate, globalObservations, autoExit);
      toast.success('Reporte generado');
    } catch (e) { toast.error('Error al generar'); } finally { setProcessing(false); }
  };

  const handleIncidentsClick = async () => {
    if (!useOdooData) { toast.error('Obtenga datos de Odoo primero'); return; }
    setProcessing(true);
    try {
      try {
        toast.info('Sincronizando números de empleado desde Odoo...');
        await api.syncBirthdays();
      } catch (error) {
        console.warn('Odoo sync failed, generating report with cached data:', error);
      }
      const freshEmployees = await api.getEmployees();
      setEmployees(freshEmployees);

      const records = odooAttendance.map(r => ({ ...r, entrada: new Date(r.entrada), salida: r.salida ? new Date(r.salida) : new Date(r.entrada) }));

      await generateIncidentsReport(records, freshEmployees, permissions, startDate, endDate, globalObservations);
      toast.success('Incidencias generadas');
    } catch (e) { toast.error('Error'); } finally { setProcessing(false); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AnimatePresence>
        {showPermissionWarning && (
          <motion.div
            key="permission-warning-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center z-[120] p-4"
          >
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-lg relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-brand-500 to-emerald-500" />
              <div className="flex flex-col items-center text-center gap-6 mb-8">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><AlertTriangle size={32} /></div>
                <div><h3 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">Cruces de Información</h3><p className="text-slate-500 font-normal text-sm leading-normal">Se han identificado <span className="text-brand-600 font-semibold">{permissions.length} autorizaciones</span>.</p></div>
              </div>
              <div className="flex gap-3"><button onClick={() => setShowPermissionWarning(false)} className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-500 rounded-xl font-semibold uppercase tracking-wider text-[10px]">Cerrar</button><button onClick={processAndGenerate} className="flex-[2] btn-premium py-2.5 rounded-xl font-semibold text-xs">Confirmar y Generar</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-slate-800 tracking-tight">Motor de Inteligencia Operativa</h2><p className="text-slate-500 font-normal text-sm text-pretty">Integración de datos de Odoo para el cálculo avanzado de incidencias y asistencia.</p></div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
            <div className="flex items-center gap-3"><div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><Search size={18} /></div><h3 className="text-base font-bold text-slate-800">Filtros de Asistencia</h3></div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 ml-1 flex items-center gap-1.5"><Calendar size={10} /> Fecha Inicio</label>
                <div className="flex gap-2"><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-xs text-slate-800" /><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-20 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-xs text-slate-800" /></div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 ml-1 flex items-center gap-1.5"><Calendar size={10} /> Fecha Fin</label>
                <div className="flex gap-2"><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-xs text-slate-800" /><input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-20 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-xs text-slate-800" /></div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 ml-1 flex items-center gap-1.5"><Clock size={10} /> Tipo de Periodo</label>
                <select value={periodType} onChange={(e) => setPeriodType(e.target.value as any)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-xs text-slate-800 appearance-none cursor-pointer">
                  <option value="todos">Todos los empleados</option><option value="semanal">Semanal</option><option value="quincenal">Quincenal</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 ml-1 flex items-center gap-1.5"><Users size={10} /> Empleados</label>
                <select multiple value={selectedEmployeeIds} onChange={(e) => setSelectedEmployeeIds(Array.from(e.target.selectedOptions, o => o.value))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-xs text-slate-800 h-24">
                  {employees.filter(emp => periodType === 'todos' || emp.payment_period === periodType).map(emp => (<option key={emp.id} value={emp.id}>{emp.full_name}</option>))}
                </select>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100"><button onClick={handleFetchOdooData} disabled={processing} className="w-full btn-premium py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-xs shadow-sm">{processing ? <RefreshCw className="animate-spin" size={16} /> : <Download size={16} />} <span>OBTENER ASISTENCIAS DESDE ODOO</span></button></div>
          </div>
          <GlobalObservationForm observations={globalObservations} onAdd={() => setGlobalObservations([...globalObservations, { date: '', text: '' }])} onRemove={(idx) => setGlobalObservations(globalObservations.filter((_, i) => i !== idx))} onChange={(idx, f, v) => { const n = [...globalObservations]; n[idx][f] = v; setGlobalObservations(n); }} />
          <ReportActions processing={processing} hasFile={useOdooData} autoExit={autoExit} onAutoExitChange={setAutoExit} onGenerateAttendance={handleGenerateClick} onGenerateIncidents={handleIncidentsClick} />
        </div>
        <div className="lg:col-span-4 space-y-6">
          <SystemStatus employeeCount={employees.length} permissionCount={permissions.length} />
        </div>
      </div>
    </div>
  );
}
