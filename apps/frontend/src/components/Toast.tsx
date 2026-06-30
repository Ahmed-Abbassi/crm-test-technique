'use client';

import { useEffect, useState } from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastData {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

const variantStyles: Record<ToastVariant, { bg: string; border: string; icon: string; iconBg: string; text: string }> = {
  success: {
    bg: '#f0fdf4',
    border: '#86efac',
    icon: '✓',
    iconBg: '#22c55e',
    text: '#166534',
  },
  error: {
    bg: '#fef2f2',
    border: '#fecaca',
    icon: '✕',
    iconBg: '#ef4444',
    text: '#b91c1c',
  },
  info: {
    bg: '#eff6ff',
    border: '#bfdbfe',
    icon: 'i',
    iconBg: '#3b82f6',
    text: '#1e40af',
  },
};

export function ToastItem({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: string) => void }) {
  const [exiting, setExiting] = useState(false);
  const cfg = variantStyles[toast.variant];

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 200);
  };

  useEffect(() => {
    const timer = setTimeout(handleDismiss, toast.duration ?? 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="pointer-events-auto"
      style={{
        animation: exiting ? 'toast-exit 200ms ease-in forwards' : 'toast-enter 300ms ease-out forwards',
      }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border"
        style={{
          background: cfg.bg,
          borderColor: cfg.border,
          minWidth: 320,
          maxWidth: 440,
        }}
      >
        {/* Icon circle */}
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
          style={{ background: cfg.iconBg }}
        >
          {cfg.icon}
        </div>

        {/* Message */}
        <p className="text-sm font-medium flex-1" style={{ color: cfg.text }}>
          {toast.message}
        </p>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: cfg.text }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * Toast container — renders a fixed stack in the top-right corner.
 * Inject the global CSS keyframes once.
 */
export function ToastContainer({ toasts, onDismiss }: { toasts: ToastData[]; onDismiss: (id: string) => void }) {
  return (
    <>
      <style>{`
        @keyframes toast-enter {
          from { opacity: 0; transform: translateX(100%) scale(0.95); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes toast-exit {
          from { opacity: 1; transform: translateX(0) scale(1); }
          to   { opacity: 0; transform: translateX(100%) scale(0.95); }
        }
      `}</style>
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: 440 }}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </div>
    </>
  );
}