import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, X, Save, RefreshCw, BadgeAlert } from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'sonner';

interface ProfileModalProps {
  user: any;
  onClose: () => void;
  onProfileUpdated: (updatedUser: any) => void;
}

export default function ProfileModal({ user, onClose, onProfileUpdated }: ProfileModalProps) {
  const [username, setUsername] = useState(user.username || '');
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error('El nombre de usuario es requerido');
      return;
    }

    if (password && password.length < 4) {
      toast.error('La contraseña debe tener al menos 4 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await api.updateProfile({
        id: user.id,
        username: username.trim(),
        email: email.trim(),
        password: password ? password : undefined
      });

      // Keep role and other fields that might be lost in DB response
      const mergedUser = {
        ...user,
        ...updatedUser
      };

      toast.success('Perfil actualizado con éxito');
      onProfileUpdated(mergedUser);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4 font-sans"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 relative overflow-hidden"
      >
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-500 to-indigo-500" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
        >
          <X size={18} />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-900 text-brand-400 rounded-xl flex items-center justify-center shadow-md font-bold text-base">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Mi Perfil</h2>
              <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mt-0.5">Configuración de Usuario Maestro</p>
            </div>
          </div>

          {!email && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex gap-3 mb-4">
              <BadgeAlert size={20} className="text-rose-500 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-rose-800 leading-normal">
                Aún no has configurado un correo electrónico. Agrégalo ahora para habilitar la recuperación de contraseña.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Nombre de Usuario</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-premium py-2 pl-9 font-medium text-slate-900 text-sm"
                    placeholder="Usuario de acceso"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Correo Electrónico (Para Recuperación)</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-premium py-2 pl-9 font-medium text-slate-900 text-sm"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 my-4 pt-4 space-y-3">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider ml-1">Cambiar Contraseña (Opcional)</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Nueva Contraseña</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-premium py-2 pl-9 font-medium text-slate-900 text-sm"
                        placeholder="Nueva clave"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Confirmar Contraseña</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input-premium py-2 pl-9 font-medium text-slate-900 text-sm"
                        placeholder="Repite clave"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-glass flex-1 text-sm py-2"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-premium flex-1 text-sm py-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <>
                    <span>Guardar</span>
                    <Save size={14} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
