

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast } from '../types.ts';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

interface ToastContextType {
  addToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
           <div 
             key={toast.id}
             className={`pointer-events-auto min-w-[300px] max-w-md p-4 rounded-xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-top-4 fade-in duration-300
               ${toast.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 
                 toast.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
                 toast.type === 'warning' ? 'bg-amber-50 border border-amber-200 text-amber-800' :
                 'bg-white border border-slate-200 text-slate-800'}
             `}
           >
              <div className="shrink-0 mt-0.5">
                  {toast.type === 'success' && <CheckCircle2 size={18} className="text-emerald-600"/>}
                  {toast.type === 'error' && <XCircle size={18} className="text-red-600"/>}
                  {toast.type === 'warning' && <AlertTriangle size={18} className="text-amber-600"/>}
                  {toast.type === 'info' && <Info size={18} className="text-indigo-600"/>}
              </div>
              <div className="flex-1 text-sm font-medium leading-tight pt-0.5">{toast.message}</div>
              <button onClick={() => removeToast(toast.id)} className="shrink-0 opacity-50 hover:opacity-100">
                  <X size={16} />
              </button>
           </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};