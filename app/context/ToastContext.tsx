"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="erp-toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`erp-toast ${toast.type}`}>
            <div className="erp-toast-content">
              {toast.type === 'success' ? (
                <CheckCircle2 size={20} className="erp-toast-icon" />
              ) : (
                <AlertCircle size={20} className="erp-toast-icon" />
              )}
              <span className="erp-toast-message">{toast.message}</span>
              <button 
                className="erp-toast-close" 
                onClick={() => removeToast(toast.id)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="erp-toast-progress"></div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
