import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, LogIn, AlertCircle, Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'sonner';

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await api.login(username, password);
      onLogin(user);
      toast.success(`Bienvenido, ${user.employee_name}`);
    } catch (error: any) {
      toast.error(error.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotUsername.trim()) {
      toast.error('El nombre de usuario es requerido');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await api.forgotPassword(forgotUsername.trim());
      toast.success(res.message || 'Código enviado con éxito');
      setShowForgotPassword(false);
      setUsername(forgotUsername);
      setPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Error al solicitar el código');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8 relative overflow-hidden">
          {/* Top Branding */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 mb-4 relative">
              <div className="absolute inset-0 bg-brand-600 rounded-2xl rotate-6 opacity-10 transition-transform" />
              <div className="relative w-full h-full bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                 <img src="/logo_square.png" alt="Logo" className="w-8 h-8 object-contain" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Panel JASANA</h1>
            <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mt-1">Control de Asistencias</p>
          </div>

          <AnimatePresence mode="wait">
            {!showForgotPassword ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Usuario</label>
                      <div className="relative">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="input-premium py-2.5 pl-12 pr-4 text-sm font-medium text-slate-900"
                          placeholder="Tu nombre completo"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center ml-1">
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Contraseña</label>
                        <button
                          type="button"
                          onClick={() => {
                            setForgotUsername(username);
                            setShowForgotPassword(true);
                          }}
                          className="text-[10px] font-semibold text-brand-600 hover:text-brand-700 uppercase tracking-wider transition-colors"
                        >
                          ¿La olvidaste?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="input-premium py-2.5 pl-12 pr-4 text-sm font-medium text-slate-900"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex gap-3">
                     <AlertCircle size={16} className="text-brand-600 shrink-0 mt-0.5" />
                     <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider">
                       Da de alta nuevos usuarios en el menú de usuarios.
                     </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-premium py-3 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-sm"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="uppercase tracking-wider text-xs font-semibold">Entrar al Sistema</span>
                        <LogIn size={16} />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="forgot-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-slate-800 leading-none">Restablecer Contraseña</h3>
                    <p className="text-slate-500 font-normal text-xs leading-relaxed">
                      Si eres Administrador Maestro, ingresa tu usuario para recibir una contraseña temporal de 6 dígitos en tu correo registrado.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Nombre de Usuario Maestro</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={forgotUsername}
                        onChange={(e) => setForgotUsername(e.target.value)}
                        className="input-premium py-2.5 pl-12 pr-4 text-sm font-medium text-slate-900"
                        placeholder="Ingresa tu usuario maestro"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full btn-premium py-3 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-sm"
                  >
                    {forgotLoading ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <>
                        <span className="uppercase tracking-wider text-xs font-semibold">Enviar Código Temporal</span>
                        <Mail size={16} />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full py-2.5 border border-slate-200 text-slate-500 font-medium rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-[0.98] transition-all"
                  >
                    <ArrowLeft size={14} />
                    Regresar al Login
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <p className="text-center mt-8 text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
          © {new Date().getFullYear()} ClerDevs-Code
        </p>
      </motion.div>
    </div>
  );
}
