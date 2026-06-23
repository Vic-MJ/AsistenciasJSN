import { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, RefreshCw, Mail, Eye, EyeOff } from 'lucide-react';
import { api, CompanySettings } from '../../lib/api';
import { toast } from 'sonner';

interface OdooSettingsProps {
  currentUser?: any;
}

export default function OdooSettings({ currentUser }: OdooSettingsProps) {
  const isMaster = currentUser?.role === 'master';
  const [settings, setSettings] = useState<Partial<CompanySettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data || {});
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (sectionName: string) => {
    setSaving(true);
    try {
      await api.updateSettings(settings);
      toast.success(`Configuración de ${sectionName} guardada exitosamente`);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const result = await api.testOdooConnection(settings);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error('Error de conexión con Odoo');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al probar conexión');
    } finally {
      setTesting(false);
    }
  };

  if (loading) return <div className="animate-pulse h-64 bg-slate-100 rounded-2xl" />;

  return (
    <div className="space-y-6">
      
      {/* Odoo Settings Card */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
            <Settings size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 leading-tight">Integración Odoo</h3>
            <p className="text-xs text-slate-500 font-medium">Configura las credenciales de acceso a la API para la sincronización de asistencia.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 ml-1">URL de Odoo</label>
            <input
              type="text"
              value={settings.odoo_url || ''}
              onChange={(e) => setSettings({ ...settings, odoo_url: e.target.value })}
              placeholder="https://su-empresa.odoo.com"
              disabled={!isMaster}
              className={`input-premium font-medium text-sm ${!isMaster ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 ml-1">Base de Datos</label>
            <input
              type="text"
              value={settings.odoo_db || ''}
              onChange={(e) => setSettings({ ...settings, odoo_db: e.target.value })}
              placeholder="db_name"
              disabled={!isMaster}
              className={`input-premium font-medium text-sm ${!isMaster ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 ml-1">Usuario / Email</label>
            <input
              type="text"
              value={settings.odoo_username || ''}
              onChange={(e) => setSettings({ ...settings, odoo_username: e.target.value })}
              placeholder="admin@empresa.com"
              disabled={!isMaster}
              className={`input-premium font-medium text-sm ${!isMaster ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 ml-1">API Key / Password</label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={settings.odoo_api_key || ''}
                onChange={(e) => setSettings({ ...settings, odoo_api_key: e.target.value })}
                placeholder="••••••••••••••••"
                disabled={!isMaster}
                className={`input-premium pr-10 font-medium text-sm ${!isMaster ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
              {isMaster && (
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all font-medium text-sm flex items-center justify-center gap-2"
          >
            {testing ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
            Probar Conexión Odoo
          </button>
          {isMaster && (
            <button
              onClick={() => handleSave('Odoo')}
              disabled={saving}
              className="btn-premium flex-1 flex items-center justify-center gap-2"
            >
              {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
              Guardar Conexión
            </button>
          )}
        </div>
      </div>

      {/* SMTP Email Server Configuration */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-pink-50 text-pink-600 rounded-xl">
            <Mail size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 leading-tight">Servidor de Correo (SMTP Local)</h3>
            <p className="text-xs text-slate-500 font-medium">Configura el envío directo de correos desde el servidor de la app (Nodemailer)</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 ml-1">Servidor SMTP</label>
            <input
              type="text"
              value={settings.smtp_host || ''}
              onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
              placeholder="smtp.gmail.com"
              disabled={!isMaster}
              className={`input-premium font-medium text-sm ${!isMaster ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 ml-1">Puerto SMTP</label>
            <input
              type="number"
              value={settings.smtp_port || ''}
              onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="587"
              disabled={!isMaster}
              className={`input-premium font-medium text-sm ${!isMaster ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 ml-1">Usuario / Email SMTP</label>
            <input
              type="text"
              value={settings.smtp_user || ''}
              onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
              placeholder="correo@ejemplo.com"
              disabled={!isMaster}
              className={`input-premium font-medium text-sm ${!isMaster ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 ml-1">Contraseña SMTP</label>
            <input
              type="password"
              value={settings.smtp_pass || ''}
              onChange={(e) => setSettings({ ...settings, smtp_pass: e.target.value })}
              placeholder="••••••••••••••••"
              disabled={!isMaster}
              className={`input-premium font-medium text-sm ${!isMaster ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 ml-1">Remitente ("De")</label>
            <input
              type="text"
              value={settings.smtp_from || ''}
              onChange={(e) => setSettings({ ...settings, smtp_from: e.target.value })}
              placeholder='"Recursos Humanos" <correo@ejemplo.com>'
              disabled={!isMaster}
              className={`input-premium font-medium text-sm ${!isMaster ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
          </div>
          <div className="flex items-center gap-3 pl-1 pt-6">
            <input
              type="checkbox"
              id="smtp_secure"
              checked={!!settings.smtp_secure}
              onChange={(e) => setSettings({ ...settings, smtp_secure: e.target.checked })}
              disabled={!isMaster}
              className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label htmlFor="smtp_secure" className="text-xs font-semibold uppercase tracking-wider text-slate-500 cursor-pointer select-none">
              Usar SSL/TLS (Puerto 465)
            </label>
          </div>
        </div>

        {isMaster && (
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => handleSave('SMTP')}
              disabled={saving}
              className="btn-premium w-full sm:w-auto min-w-[160px] flex items-center justify-center gap-2"
            >
              {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
              Guardar SMTP
            </button>
          </div>
        )}
      </div>

      {/* AI configuration card */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl">
            <Settings size={20} className="text-violet-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 leading-tight">Inteligencia Artificial (Gemini)</h3>
            <p className="text-xs text-slate-500 font-medium">Configura la Gemini API Key para generar textos de felicitación creativos y personalizados.</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 ml-1">Gemini API Key</label>
          <div className="relative">
            <input
              type={showGeminiKey ? 'text' : 'password'}
              value={settings.gemini_api_key || ''}
              onChange={(e) => setSettings({ ...settings, gemini_api_key: e.target.value })}
              placeholder="AIzaSy..."
              disabled={!isMaster}
              className={`input-premium pr-10 font-medium text-sm ${!isMaster ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
            {isMaster && (
              <button
                type="button"
                onClick={() => setShowGeminiKey(!showGeminiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                {showGeminiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}
          </div>
        </div>

        {isMaster && (
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => handleSave('Inteligencia Artificial')}
              disabled={saving}
              className="btn-premium w-full sm:w-auto min-w-[160px] flex items-center justify-center gap-2"
            >
              {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
              Guardar Ajustes de IA
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
