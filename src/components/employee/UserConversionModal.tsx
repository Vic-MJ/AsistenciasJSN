import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, X, AlertCircle, Trash2, Key, RefreshCw, AlertTriangle } from 'lucide-react';
import { Employee, api } from '../../lib/api';
import { toast } from 'sonner';

interface UserConversionModalProps {
  employee: Employee | null;
  existingUser?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserConversionModal({ employee, existingUser, onClose, onSuccess }: UserConversionModalProps) {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'master' | 'admin'>(existingUser?.role || 'master');
  const [showDestitucionConfirm, setShowDestitucionConfirm] = useState(false);

  if (!employee) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!existingUser && !password) {
      toast.error('La contraseña es requerida para un nuevo usuario');
      return;
    }

    if (password && password.length < 4) {
      toast.error('La contraseña debe tener al menos 4 caracteres');
      return;
    }
    
    setLoading(true);
    try {
      if (existingUser) {
        // Edit existing user
        await api.updateUser(existingUser.id, {
          role,
          password: password ? password : undefined
        });
        toast.success('Acceso de usuario actualizado correctamente');
      } else {
        // Create new user
        await api.createUser({
          employee_id: employee.id,
          username: employee.full_name,
          password: password,
          role: role
        });
        toast.success(role === 'master' ? 'Usuario maestro creado exitosamente' : 'Usuario admin creado exitosamente');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleDestituir = async () => {
    if (!existingUser) return;
    setLoading(true);
    try {
      await api.deleteUser(existingUser.id);
      toast.success('El usuario ha sido destituido y su acceso al sistema fue revocado.');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Error al destituir al usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-brand-600 text-white relative">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold tracking-tight">
                {existingUser ? 'Gestionar Acceso' : 'Acceso al Sistema'}
              </h3>
              <p className="text-[10px] font-medium text-white/80 uppercase tracking-wider mt-0.5">
                {existingUser ? 'Modificar privilegios y credenciales' : 'Crear credenciales de acceso'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            {/* Username field (Readonly) */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Usuario (Automático)</label>
              <input
                type="text"
                value={employee.full_name}
                disabled
                className="input-premium py-2 bg-slate-50/50 opacity-60 text-slate-500 cursor-not-allowed font-medium text-sm"
              />
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {existingUser ? 'Nueva Contraseña' : 'Establecer Contraseña'}
                </label>
                {existingUser && (
                  <span className="text-[9px] font-semibold text-indigo-500 uppercase tracking-wider">Dejar en blanco para mantener</span>
                )}
              </div>
              <div className="relative">
                <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  placeholder={existingUser ? '••••••••' : 'Mínimo 4 caracteres'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!existingUser}
                  minLength={4}
                  className="input-premium py-2 pl-9 font-medium text-sm"
                  autoFocus={!existingUser}
                />
              </div>
            </div>

            {/* Role Select field */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Nivel de Acceso</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'master' | 'admin')}
                className="input-premium py-2 font-medium text-sm"
              >
                <option value="master">Usuario Maestro (Acceso Total)</option>
                <option value="admin">Administrador (Gestión Personal)</option>
              </select>
            </div>
          </div>

          {/* Warning or Danger Zone */}
          {existingUser ? (
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <p className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider ml-1">Zona de Destitución</p>
              
              {!showDestitucionConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDestitucionConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all active:scale-[0.98]"
                >
                  <Trash2 size={14} />
                  Destituir Usuario / Revocar Acceso
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-rose-50 border border-rose-100 rounded-xl space-y-3"
                >
                  <div className="flex gap-3">
                    <AlertTriangle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-semibold text-rose-800 leading-normal uppercase tracking-wider">
                      ¿Estás seguro que deseas destituir a este usuario? Se revocará inmediatamente todo acceso al sistema.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowDestitucionConfirm(false)}
                      className="flex-1 py-2 bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleDestituir}
                      disabled={loading}
                      className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                    >
                      {loading ? <RefreshCw size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      Confirmar Destitución
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
              <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-amber-800 leading-relaxed">
                Esta acción habilitará el acceso al sistema para <span className="font-semibold">{employee.full_name}</span> usando su nombre como usuario.
              </p>
            </div>
          )}

          {/* Action buttons */}
          {!showDestitucionConfirm && (
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="btn-glass flex-1 text-sm py-2"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-premium flex-[2] text-sm py-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <span>{existingUser ? 'Guardar Cambios' : 'Confirmar Usuario'}</span>
                )}
              </button>
            </div>
          )}
        </form>
      </motion.div>
    </motion.div>
  );
}
