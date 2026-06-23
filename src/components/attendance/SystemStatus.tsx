import { Users as UsersIcon, ShieldCheck } from 'lucide-react';

interface SystemStatusProps {
    employeeCount: number;
    permissionCount: number;
}

export default function SystemStatus({ employeeCount, permissionCount }: SystemStatusProps) {
    return (
        <div className="glass-card p-6 overflow-hidden relative group">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                Integridad de Base de Datos
            </h3>

            <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group/item hover:bg-white hover:shadow-md hover:shadow-slate-200/40 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white text-brand-600 rounded-lg shadow-sm border border-slate-100 group-hover/item:scale-105 group-hover/item:bg-brand-600 group-hover/item:text-white transition-all duration-300">
                            <UsersIcon size={18} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Padrón Activo</span>
                            <span className="text-xs font-medium text-slate-500">Colaboradores</span>
                        </div>
                    </div>
                    <div className="text-xl font-bold text-slate-900">
                        {employeeCount}
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group/item hover:bg-white hover:shadow-md hover:shadow-slate-200/40 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white text-indigo-600 rounded-lg shadow-sm border border-slate-100 group-hover/item:scale-105 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all duration-300">
                            <ShieldCheck size={18} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Excepciones</span>
                            <span className="text-xs font-medium text-slate-500">Permisos Vigentes</span>
                        </div>
                    </div>
                    <div className="text-xl font-bold text-slate-900">
                        {permissionCount}
                    </div>
                </div>
            </div>

            <div className="mt-5 pt-5 border-t border-slate-50 flex items-center gap-3">
                <div className="flex -space-x-1.5">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-5 h-5 rounded-full border border-white bg-slate-100" />
                    ))}
                </div>
                <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Sincronización en tiempo real</span>
            </div>
        </div>
    );
}

