import { MessageSquareText, Plus, Trash2, Calendar, FileText } from 'lucide-react';

export interface GlobalObservation {
    date: string;
    text: string;
}

interface GlobalObservationFormProps {
    observations: GlobalObservation[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    onChange: (index: number, field: keyof GlobalObservation, value: string) => void;
}

export default function GlobalObservationForm({ observations, onAdd, onRemove, onChange }: GlobalObservationFormProps) {
    return (
        <div className="glass-card p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Anotaciones Transversales
                </h3>
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                        <MessageSquareText size={12} className="text-brand-500" />
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Incrustación en Reporte</span>
                    </div>
                    <button
                        onClick={onAdd}
                        className="p-2 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100 transition-all shadow-sm"
                        title="Añadir otra anotación"
                    >
                        <Plus size={18} />
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {observations.length === 0 && (
                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Sin anotaciones configuradas</p>
                        <button 
                            onClick={onAdd}
                            className="mt-3 text-[10px] font-semibold text-brand-600 uppercase tracking-wider hover:underline"
                        >
                            Haz clic para añadir la primera
                        </button>
                    </div>
                )}

                {observations.map((obs, index) => (
                    <div key={index} className="grid sm:grid-cols-12 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 relative group animate-in slide-in-from-top-4 duration-300">
                        <div className="sm:col-span-4 space-y-2">
                            <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">
                                <Calendar size={11} /> Vigencia
                            </label>
                            <input
                                type="date"
                                value={obs.date}
                                onChange={(e) => onChange(index, 'date', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none font-medium text-sm text-slate-700 focus:border-brand-500 transition-all shadow-sm"
                            />
                        </div>
                        <div className="sm:col-span-7 space-y-2">
                            <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">
                                <FileText size={11} /> Leyenda Administrativa
                            </label>
                            <input
                                type="text"
                                placeholder="DÍA FESTIVO, SUSPENSIÓN, ETC."
                                value={obs.text}
                                onChange={(e) => onChange(index, 'text', e.target.value.toUpperCase())}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none font-medium text-sm text-slate-700 focus:border-brand-500 transition-all uppercase shadow-sm"
                            />
                        </div>
                        <div className="sm:col-span-1 flex items-end justify-center pb-0.5">
                            <button
                                onClick={() => onRemove(index)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="flex items-center gap-2.5 pt-2">
                <div className="w-1 h-1 rounded-full bg-brand-500/40" />
                <p className="text-[10px] text-slate-400 font-medium italic">Estas observaciones se replicarán automáticamente para todos los empleados en las fechas indicadas.</p>
            </div>
        </div>
    );
}

