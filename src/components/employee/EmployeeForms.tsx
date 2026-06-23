import { useState } from 'react';
import { UserPlus, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { api } from '../../lib/api';
import { toast } from 'sonner';

interface EmployeeFormsProps {
  onSuccess: () => void;
}

export default function EmployeeForms({ onSuccess }: EmployeeFormsProps) {
  const [loading, setLoading] = useState(false);
  const [manualForm, setManualForm] = useState({ name: '', number: '', payment_period: 'semanal' as 'semanal' | 'quincenal' });

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.name || !manualForm.number) return;

    setLoading(true);
    try {
      await api.createEmployee({
        full_name: manualForm.name.trim(),
        employee_number: manualForm.number.trim(),
        department: '',
        payment_period: manualForm.payment_period
      });

      onSuccess();
      setManualForm({ name: '', number: '', payment_period: 'semanal' });
      toast.success('Empleado agregado exitosamente');
    } catch (error: any) {
      console.error('Error adding employee:', error);
      if (error.code === '23505') {
        toast.error('Error: El número de empleado ya existe');
      } else {
        toast.error('Error al agregar empleado');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: ['name', 'number'] });

      const employeesToInsert = jsonData
        .slice(1)
        .filter((row: any) => row.name && row.number)
        .map((row: any) => ({
          full_name: String(row.name).trim(),
          employee_number: String(row.number).trim(),
          department: ''
        }));

      if (employeesToInsert.length === 0) {
        toast.error('No se encontraron empleados válidos en el archivo');
        setLoading(false);
        return;
      }

      await api.upsertEmployees(employeesToInsert);

      onSuccess();
      toast.success(`${employeesToInsert.length} empleados cargados exitosamente`);
      e.target.value = '';
    } catch (error) {
      console.error('Error uploading employees:', error);
      toast.error('Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg:col-span-1 space-y-6">
      {/* Manual Add Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm relative overflow-hidden group">
        <div className="flex items-center gap-3.5 mb-6 relative z-10">
          <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
            <UserPlus size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base tracking-tight">Alta Individual</h3>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Registro manual</p>
          </div>
        </div>

        <form onSubmit={handleManualAdd} className="space-y-4 relative z-10">
          <div className="space-y-2">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Nombre Completo</label>
            <input
              type="text"
              placeholder="Juan Pérez García"
              value={manualForm.name}
              onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
              required
              className="input-premium"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">No. de Empleado</label>
            <input
              type="text"
              placeholder="ID Sistema (Ej. 85)"
              value={manualForm.number}
              onChange={(e) => setManualForm({ ...manualForm, number: e.target.value })}
              required
              className="input-premium"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Periodo de Pago</label>
            <select
              value={manualForm.payment_period}
              onChange={(e) => setManualForm({ ...manualForm, payment_period: e.target.value as any })}
              className="input-premium appearance-none font-medium"
            >
              <option value="semanal">Semanal</option>
              <option value="quincenal">Quincenal</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-premium py-2.5 rounded-xl font-semibold uppercase tracking-wider text-[10px] mt-4 shadow-sm"
          >
            <span>{loading ? 'Registrando...' : 'Registrar Empleado'}</span>
          </button>
        </form>
      </div>

      {/* Import Card */}
      <div className="bg-slate-900 rounded-2xl p-6 relative overflow-hidden group shadow-sm">
        <div className="flex items-center gap-3.5 mb-6 relative z-10">
          <div className="p-3 bg-white/10 text-white rounded-xl border border-white/10">
            <Upload size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white text-base tracking-tight">Carga Masiva</h3>
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Importar desde Excel</p>
          </div>
        </div>

        <div className="border border-dashed border-white/20 rounded-xl p-6 hover:border-brand-400 hover:bg-white/5 transition-all duration-300 cursor-pointer group/upload text-center relative overflow-hidden">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelUpload}
            disabled={loading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="relative z-0">
            <div className="mx-auto w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center mb-4 group-hover/upload:scale-105 group-hover/upload:bg-brand-600 transition-all duration-300 shadow-sm">
              <Upload size={20} />
            </div>
            <p className="text-sm font-semibold text-white tracking-tight">Arrastra tu Archivo</p>
            <div className="flex items-center justify-center gap-2 mt-2">
               <div className="w-1 h-1 rounded-full bg-emerald-400" />
               <p className="text-[9px] text-white/40 font-semibold uppercase tracking-wider">Col 1: Nombre | Col 2: No.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
