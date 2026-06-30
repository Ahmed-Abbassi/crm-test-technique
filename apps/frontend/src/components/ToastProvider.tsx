'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import type { ToastData, ToastVariant } from './Toast';
import { ToastContainer } from './Toast';

// ─── Context shape ─────────────────────────────────────────────────────────
interface ToastContextValue {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────
let toastCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((variant: ToastVariant, message: string, duration?: number) => {
    const id = `toast-${++toastCounter}-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, variant, duration }]);
  }, []);

  const value: ToastContextValue = {
    success: (message, duration) => addToast('success', message, duration),
    error: (message, duration) => addToast('error', message, duration),
    info: (message, duration) => addToast('info', message, duration),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return ctx;
}