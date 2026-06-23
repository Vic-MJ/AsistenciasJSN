import { Upload as UploadIcon, CheckCircle } from 'lucide-react';

interface FileUploadZoneProps {
    odooFile: File | null;
    processing: boolean;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FileUploadZone({ odooFile, processing, onFileChange }: FileUploadZoneProps) {
    return (
    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm group/card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/5 blur-[80px] rounded-full -mr-24 -mt-24 group-hover/card:bg-brand-500/10 transition-colors duration-1000" />

        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-4 relative z-10">
            <div className="w-2 h-2 rounded-full bg-brand-500" />
            Fuente de Datos Maestro (Odoo)
        </h3>

        <div className={`relative border-2 border-dashed rounded-[3rem] p-14 transition-all duration-700 flex flex-col items-center justify-center min-h-[350px] group/drop ${odooFile
                ? 'border-emerald-500/30 bg-emerald-50/20'
                : 'border-slate-100 bg-slate-50/50 hover:border-brand-500/40 hover:bg-white hover:shadow-2xl hover:shadow-brand-500/5'
            }`}>
            <input
                type="file"
                accept=".xlsx,.xls"
                onChange={onFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={processing}
            />

            <div className={`p-8 rounded-[2.2rem] mb-8 transition-all duration-700 ${odooFile
                    ? 'bg-emerald-600 text-white shadow-2xl shadow-emerald-500/20 rotate-0'
                    : 'bg-white text-brand-600 shadow-2xl shadow-slate-200/50 border border-slate-50 scale-100 group-hover/drop:scale-110 group-hover/drop:rotate-6'
                }`}>
                {odooFile ? <CheckCircle size={48} /> : <UploadIcon size={48} />}
            </div>

            <div className="text-center relative z-10">
                <p className="text-2xl font-black text-slate-900 mb-3 tracking-tighter leading-none">
                    {odooFile ? odooFile.name : 'Vincular Reporte de Odoo'}
                </p>
                <p className="text-slate-400 font-medium text-pretty max-w-xs mx-auto text-sm leading-relaxed">
                    {odooFile
                        ? 'Concentrado listo para la engine de conciliación.'
                        : 'Arrastra el concentrado de asistencia aquí o haz clic para localizar el archivo .xlsx'}
                </p>
            </div>

            {processing && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center rounded-[3rem] z-20">
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                           <div className="w-16 h-16 border-4 border-slate-100 rounded-full" />
                           <div className="absolute inset-0 w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                        <p className="text-brand-600 font-black uppercase tracking-[0.3em] text-[10px]">Analizando Transacciones...</p>
                    </div>
                </div>
            )}
        </div>

        <div className="flex flex-wrap items-center gap-6 mt-10">
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Columnas Requeridas:</span>
            <div className="flex flex-wrap gap-3">
                {['Colaborador', 'Check-In', 'Check-Out', 'Horario'].map(tag => (
                    <span key={tag} className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-100/50">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    </div>
    );
}
