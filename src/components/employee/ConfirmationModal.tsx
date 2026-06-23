import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { BaseModalProps } from './types';

interface ConfirmationModalProps extends BaseModalProps {
  title: string;
  description: string;
  confirmText: string;
  onConfirm: () => void;
  isDestructive?: boolean;
  requireMatch?: string;
  loading?: boolean;
}

export default function ConfirmationModal({
  title,
  description,
  confirmText,
  onConfirm,
  onClose,
  isDestructive = false,
  requireMatch,
  loading = false
}: ConfirmationModalProps) {
  const [matchText, setMatchText] = useState('');

  const canConfirm = !requireMatch || matchText === requireMatch;

  const handleConfirm = () => {
    if (canConfirm && !loading) {
      onConfirm();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100"
      >
        <div className={`p-5 flex items-center justify-between ${isDestructive ? 'bg-rose-600 text-white' : 'bg-brand-600 text-white'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold tracking-tight">{title}</h3>
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

        <div className="p-5 space-y-5">
          <p className="text-slate-600 font-medium leading-relaxed text-sm text-pretty">
            {description}
          </p>

          {requireMatch && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">
                Escribe "{requireMatch}" para confirmar
              </label>
              <input
                type="text"
                value={matchText}
                onChange={(e) => setMatchText(e.target.value)}
                placeholder={requireMatch}
                className="input-premium font-medium text-sm py-2 bg-slate-50/50 border-rose-200 focus:border-rose-500 focus:ring-rose-500/20"
                autoFocus
              />
            </div>
          )}

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
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm || loading}
              className={`flex-[1.5] py-2 rounded-xl transition-all font-semibold uppercase tracking-wider text-xs shadow-md ${
                !canConfirm || loading
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : isDestructive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                  : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/20'
              }`}
            >
              <span>{loading ? 'Procesando...' : confirmText}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
