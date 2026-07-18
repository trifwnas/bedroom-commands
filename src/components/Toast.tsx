import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertTriangle, Info } from 'lucide-react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface ToastContextValue {
  showToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<number, number>>(new Map());

  const removeToast = useCallback((id: number) => {
    if (timers.current.has(id)) {
      clearTimeout(timers.current.get(id));
      timers.current.delete(id);
    }
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = nextId++;
    setToasts(prev => [...prev.slice(-2), { id, message, type }]);
    const timer = window.setTimeout(() => removeToast(id), 3000);
    timers.current.set(id, timer);
  }, [removeToast]);

  useEffect(() => {
    return () => {
      timers.current.forEach(t => clearTimeout(t));
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-[var(--safe-top)] left-0 right-0 z-[200] flex flex-col items-center gap-2 p-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg backdrop-blur-xl max-w-sm w-full ${
                toast.type === 'success' ? 'bg-[var(--success)] text-white' :
                toast.type === 'error' ? 'bg-[var(--error)] text-white' :
                toast.type === 'warning' ? 'bg-[var(--warning)] text-white' :
                'bg-[var(--surface)]/95 text-[var(--text)] border border-[var(--border)]'
              }`}
            >
              {toast.type === 'success' && <Check size={18} />}
              {toast.type === 'error' && <X size={18} />}
              {toast.type === 'warning' && <AlertTriangle size={18} />}
              {toast.type === 'info' && <Info size={18} className="text-[var(--primary)]" />}
              <span className="text-sm font-medium flex-1">{toast.message}</span>
              <button onClick={() => removeToast(toast.id)} className="shrink-0 p-1 opacity-60 hover:opacity-100">
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue>({ confirm: () => Promise.resolve(false) });

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>(resolve => {
      setState({ ...options, resolve });
    });
  }, []);

  const handleClose = (result: boolean) => {
    state?.resolve(result);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {state && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/50 flex items-center justify-center p-6"
            onClick={() => handleClose(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[var(--surface)] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-[var(--text)] mb-2">{state.title}</h3>
              <p className="text-sm text-[var(--text-sec)] leading-relaxed mb-6">{state.message}</p>
              <div className="flex gap-3">
                <button onClick={() => handleClose(false)}
                  className="flex-1 py-3 rounded-xl border border-[var(--border)] text-[var(--text)] font-semibold active:scale-95 transition">
                  {state.cancelLabel || 'Cancel'}
                </button>
                <button onClick={() => handleClose(true)}
                  className={`flex-1 py-3 rounded-xl font-semibold active:scale-95 transition text-white ${
                    state.danger ? 'bg-red-500' : 'bg-[var(--primary)]'
                  }`}>
                  {state.confirmLabel || 'Confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}
