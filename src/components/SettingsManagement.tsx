import { useState, useEffect } from 'react';
import { HelpCircle, Settings } from 'lucide-react';
import OdooSettings from './attendance/OdooSettings';
import LogoSettings from './attendance/LogoSettings';
import { api } from '../lib/api';
import { toast } from 'sonner';

interface SettingsManagementProps {
  currentUser?: any;
}

export default function SettingsManagement({ currentUser }: SettingsManagementProps) {
  const [logoPreview, setLogoPreview] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const sett = await api.getSettings();
      if (sett?.logo_url) {
        setLogoPreview(sett.logo_url);
      }
    } catch (e) {
      toast.error('Error al cargar el logotipo');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-1">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Ajustes del Sistema</h2>
          <p className="text-slate-500 font-medium text-sm text-pretty">Configura las credenciales de la API de Odoo, el servidor de correos y la identidad visual de la empresa.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <OdooSettings currentUser={currentUser} />
        </div>
        <div className="lg:col-span-4 space-y-6">
          <LogoSettings 
            logoPreview={logoPreview} 
            onLogoUpdate={(url) => { 
              setLogoPreview(url); 
            }} 
          />

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 text-brand-500/5 rotate-12 group-hover:rotate-45 transition-transform duration-500">
              <Settings size={100} />
            </div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
              <HelpCircle size={14} className="text-brand-500" />
              Guía de Configuración
            </h4>
            <ul className="space-y-5 relative z-10">
              <li className="flex gap-3 group/item">
                <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-brand-600 font-semibold text-xs group-hover/item:bg-brand-600 group-hover/item:text-white transition-all shadow-sm duration-300 flex-shrink-0">01</div>
                <div className="flex-1">
                   <p className="text-slate-900 font-semibold text-sm mb-0.5">URL y Base de Datos</p>
                   <p className="text-slate-500 text-xs font-medium leading-relaxed">Ingresa la URL completa de tu instancia de Odoo y el nombre exacto de la base de datos.</p>
                </div>
              </li>
              <li className="flex gap-3 group/item">
                <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-brand-600 font-semibold text-xs group-hover/item:bg-brand-600 group-hover/item:text-white transition-all shadow-sm duration-300 flex-shrink-0">02</div>
                <div className="flex-1">
                   <p className="text-slate-900 font-semibold text-sm mb-0.5">API Key / Token</p>
                   <p className="text-slate-500 text-xs font-medium leading-relaxed">Te recomendamos generar una Clave de API en los ajustes de usuario de Odoo para mayor seguridad en lugar de tu contraseña habitual.</p>
                </div>
              </li>
              <li className="flex gap-3 group/item">
                <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-brand-600 font-semibold text-xs group-hover/item:bg-brand-600 group-hover/item:text-white transition-all shadow-sm duration-300 flex-shrink-0">03</div>
                <div className="flex-1">
                   <p className="text-slate-900 font-semibold text-sm mb-0.5">Servidor SMTP</p>
                   <p className="text-slate-500 text-xs font-medium leading-relaxed">El servidor SMTP local permite enviar correos automáticos (como recordatorios de cumpleaños o notificaciones) de forma directa.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

