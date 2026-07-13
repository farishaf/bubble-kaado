'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

gsap.registerPlugin(useGSAP);

export type ToastVariant = 'success' | 'error' | 'info';

type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  show: (message: string, options?: { variant?: ToastVariant; duration?: number }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<ToastVariant, { bar: string; icon: string }> = {
  success: { bar: 'border-l-success',     icon: 'text-success' },
  error:   { bar: 'border-l-danger',      icon: 'text-danger' },
  info:    { bar: 'border-l-ink',         icon: 'text-ink' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const show = useCallback<ToastContextValue['show']>((message, options) => {
    const id = `t${++counterRef.current}`;
    const variant = options?.variant ?? 'info';
    const duration = options?.duration ?? (variant === 'error' ? 6000 : 4000);
    setToasts((t) => [...t, { id, message, variant }]);
    setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div
      className="fixed top-4 inset-x-4 md:left-auto md:right-4 md:max-w-sm z-[200] flex flex-col gap-2 pointer-events-none"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const styles = VARIANT_STYLES[toast.variant];

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from(ref.current, {
        x: 24,
        opacity: 0,
        duration: 0.32,
        ease: 'power2.out',
      });
    });
  }, { scope: ref });

  return (
    <div
      ref={ref}
      role={toast.variant === 'error' ? 'alert' : 'status'}
      className={`pointer-events-auto bg-paper border border-muted-2 ${styles.bar} border-l-4 rounded-md shadow-2 pl-3 pr-2 py-2.5 flex items-start gap-3`}
    >
      <ToastIcon variant={toast.variant} className={styles.icon} />
      <p className="font-body text-sm text-ink flex-1 leading-[1.45] pt-0.5">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="-mt-0.5 -mr-1 w-7 h-7 inline-flex items-center justify-center text-ink-3 hover:text-ink rounded-sm"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

function ToastIcon({ variant, className }: { variant: ToastVariant; className?: string }) {
  if (variant === 'success') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
        <path d="M6 10.2l2.8 2.8L14 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (variant === 'error') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
        <path d="M10 5.5v5.5M10 13.5v0.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
      <path d="M10 8.5v5.5M10 6v0.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}