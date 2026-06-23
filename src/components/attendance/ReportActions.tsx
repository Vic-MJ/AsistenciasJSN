import { FileSpreadsheet, AlertCircle } from 'lucide-react';

interface ReportActionsProps {
    processing: boolean;
    hasFile: boolean;
    autoExit: boolean;
    onAutoExitChange: (val: boolean) => void;
    onGenerateAttendance: () => void;
    onGenerateIncidents: () => void;
}

export default function ReportActions({
    processing,
    hasFile,
    autoExit,
    onAutoExitChange,
    onGenerateAttendance,
    onGenerateIncidents
}: ReportActionsProps) {
    return (
        <div className="glass-card p-6 relative overflow-hidden group">
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full group-hover:bg-indigo-500/10 transition-colors duration-1000" />

            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-3 relative z-10">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Salidas de Información
            </h3>

            {/* Auto Exit Toggle Switch */}
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100/50 mb-6 relative z-10 hover:bg-slate-100/10 transition-all duration-300">
                <label className="relative flex items-center cursor-pointer select-none gap-3.5 w-full">
                    <input
                        type="checkbox"
                        checked={autoExit}
                        onChange={(e) => onAutoExitChange(e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 relative transition-colors duration-300"></div>
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Colocar Salida Automáticamente</span>
                        <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">Asigna hora de salida oficial a los faltantes de check-out</span>
                    </div>
                </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                <button
                    onClick={onGenerateAttendance}
                    disabled={processing || !hasFile}
                    className="btn-premium flex items-center justify-center gap-3 py-4 rounded-xl shadow-md active:scale-95 disabled:opacity-30 disabled:grayscale group disabled:cursor-not-allowed text-white bg-brand-600 hover:bg-brand-700 transition-all duration-300"
                >
                    <div className="p-2 bg-white/20 rounded-lg group-hover:rotate-6 transition-transform duration-300">
                       <FileSpreadsheet size={20} />
                    </div>
                    <div className="flex flex-col items-start text-left">
                       <span className="text-xs font-semibold uppercase tracking-wider">{processing ? 'Procesando...' : 'Asistencias'}</span>
                       {!processing && <span className="text-[9px] font-medium opacity-80 uppercase tracking-wider mt-0.5">Reporte Maestro</span>}
                    </div>
                </button>

                <button
                    onClick={onGenerateIncidents}
                    disabled={processing || !hasFile}
                    className="bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-3 py-4 rounded-xl shadow-md active:scale-95 disabled:opacity-30 disabled:grayscale transition-all group disabled:cursor-not-allowed"
                >
                    <div className="p-2 bg-white/10 rounded-lg group-hover:scale-105 transition-transform duration-300">
                       <AlertCircle size={20} className="text-brand-400" />
                    </div>
                    <div className="flex flex-col items-start text-left">
                       <span className="text-xs font-semibold uppercase tracking-wider">Incidencias</span>
                       <span className="text-[9px] font-medium opacity-65 uppercase tracking-wider mt-0.5">Control de Desvíos</span>
                    </div>
                </button>
            </div>

            {!hasFile && (
                <div className="mt-6 flex items-center justify-center gap-2 py-3 bg-slate-50 rounded-xl border border-slate-100 relative z-10">
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse" />
                   <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                       Carga requerida para habilitar outputs
                   </p>
                </div>
            )}
        </div>
    );
}
