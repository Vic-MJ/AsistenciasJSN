import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Key, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'sonner';

interface ChangePasswordModalProps {
  user: any;
  onPasswordChanged: (updatedUser: any) => void;
}

export default function ChangePasswordModal({ user, onPasswordChanged }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 4) {
      toast.error('La nueva contraseña debe tener al menos 4 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await api.updatePassword({
        username: user.username,
        currentPassword,
        newPassword
      });
      
      toast.success('Contraseña actualizada correctamente');
      
      // Update local state by setting must_change_password to false
      onPasswordChanged({
        ...user,
        must_change_password: false
      });
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#714B67] via-rose-500 to-indigo-500" />
        
        <div className="flex flex-col items-center text-center mb-6 pt-3">
          <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 mb-3 shadow-sm">
            <Key size={20} className="animate-pulse" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Actualizar Contraseña</h2>
          <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mt-1">Acceso Temporal Detectado</p>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 mb-5">
          <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-amber-800 leading-normal">
            Por razones de seguridad, debes cambiar tu contraseña temporal de 6 dígitos antes de poder ingresar al panel.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Contraseña Temporal (6 dígitos)</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-premium py-2 pl-9 font-medium text-slate-900 text-sm"
                  placeholder="Código de 6 dígitos"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Nueva Contraseña</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-premium py-2 pl-9 font-medium text-slate-900 text-sm"
                  placeholder="Mínimo 4 caracteres"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Confirmar Nueva Contraseña</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-premium py-2 pl-9 font-medium text-slate-900 text-sm"
                  placeholder="Repite la contraseña"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-premium py-2 rounded-xl flex items-center justify-center gap-2 text-sm mt-6"
          >
            {loading ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <>
                <span>Actualizar y Entrar</span>
                <Key size={14} />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
