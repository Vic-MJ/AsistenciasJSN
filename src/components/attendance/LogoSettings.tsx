import { Image as ImageIcon, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';

interface LogoSettingsProps {
    logoPreview: string;
    onLogoUpdate: (logoUrl: string) => void;
}

export default function LogoSettings({ logoPreview, onLogoUpdate }: LogoSettingsProps) {
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Error: Por favor seleccione una imagen válida');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            const logoDataUrl = event.target?.result as string;
            try {
                await api.updateSettings({ logo_url: logoDataUrl, company_name: 'JASANA' });
                toast.success('Logo actualizado exitosamente');
                onLogoUpdate(logoDataUrl);
            } catch (error) {
                toast.error('Error al guardar el logo');
                console.error(error);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="glass-card p-6 overflow-hidden relative">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                Branding Institucional
            </h3>

            <div className="relative group/container flex flex-col items-center">
                <div className="relative w-full aspect-video bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center p-6 overflow-hidden mb-6 transition-all duration-500 group-hover/container:shadow-inner group-hover/container:bg-white">
                    {/* Visual texture for the logo background */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'conic-gradient(#000 90deg, transparent 90deg 180deg, #000 180deg 270deg, transparent 270deg)', backgroundSize: '15px 15px' }} />

                    <div className="relative group w-full flex justify-center items-center z-10 transition-all duration-500 group-hover:scale-105">
                        {logoPreview ? (
                            <>
                                <div className="absolute inset-0 bg-brand-500/10 blur-[40px] rounded-full scale-75 group-hover/container:bg-brand-500/20 transition-all duration-700" />
                                <img
                                    src={logoPreview}
                                    alt="Logo"
                                    className="max-h-20 object-contain relative z-10 drop-shadow-lg"
                                />
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <ImageIcon size={28} className="text-slate-200" />
                                <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Identidad Vacía</span>
                            </div>
                        )}
                    </div>
                </div>

                <label className="w-full">
                    <div className="w-full py-2.5 px-4 bg-slate-900 hover:bg-brand-600 text-white rounded-lg text-center text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center gap-2">
                        <Plus size={14} className="text-brand-400" />
                        {logoPreview ? 'Renovar Identidad' : 'Cargar Activo'}
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                    />
                </label>
                <p className="text-[9px] text-slate-400 mt-4 font-semibold uppercase tracking-wider text-center opacity-60">Soportado: PNG / SVG / WEBP</p>
            </div>
        </div>
    );
}

