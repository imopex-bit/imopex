import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: 'info', // 'info', 'success', 'warning', 'error', 'confirm'
    message: '',
    title: '',
    onConfirm: null,
    onCancel: null,
  });

  const hideAlert = useCallback(() => {
    setAlertConfig(prev => ({ ...prev, isOpen: false }));
    // No reseteamos inmediatamente para permitir la animación de salida
  }, []);

  const showAlert = useCallback((message, type = 'info', title = null) => {
    setAlertConfig({
      isOpen: true,
      type,
      message,
      title: title || (type === 'error' ? 'Error' : type === 'success' ? 'Éxito' : 'Información'),
      onConfirm: hideAlert,
      onCancel: null,
    });
  }, [hideAlert]);

  const showConfirm = useCallback((message, title = 'Confirmar Acción') => {
    return new Promise((resolve) => {
      setAlertConfig({
        isOpen: true,
        type: 'confirm',
        message,
        title,
        onConfirm: () => {
          hideAlert();
          resolve(true);
        },
        onCancel: () => {
          hideAlert();
          resolve(false);
        },
      });
    });
  }, [hideAlert]);

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      
      <AnimatePresence>
        {alertConfig.isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-800 border border-slate-700 w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 sm:p-8 flex flex-col items-center text-center space-y-4">
                
                {/* Icon */}
                <div className={`p-4 rounded-full ${
                  alertConfig.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                  alertConfig.type === 'error' ? 'bg-rose-500/10 text-rose-400' :
                  alertConfig.type === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                  alertConfig.type === 'confirm' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-indigo-500/10 text-indigo-400'
                }`}>
                  {alertConfig.type === 'success' && <CheckCircle2 size={32} />}
                  {alertConfig.type === 'error' && <X size={32} />}
                  {alertConfig.type === 'warning' && <AlertTriangle size={32} />}
                  {alertConfig.type === 'confirm' && <AlertCircle size={32} />}
                  {alertConfig.type === 'info' && <Info size={32} />}
                </div>

                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">{alertConfig.title}</h3>
                  <p className="text-sm text-slate-400 mt-2 font-medium">{alertConfig.message}</p>
                </div>

                <div className="w-full flex gap-3 pt-4">
                  {alertConfig.type === 'confirm' && (
                    <button 
                      onClick={alertConfig.onCancel}
                      className="flex-1 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                    >
                      Cancelar
                    </button>
                  )}
                  <button 
                    onClick={alertConfig.onConfirm}
                    className={`flex-1 py-3 rounded-xl text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all ${
                      alertConfig.type === 'error' ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20' :
                      alertConfig.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' :
                      alertConfig.type === 'warning' ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20' :
                      'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                    }`}
                  >
                    Aceptar
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AlertContext.Provider>
  );
};
