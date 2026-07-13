'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/context';
import { Spinner } from '@/lib/ui/spinner';

type Mode = 'signIn' | 'signUp';

export function AuthModal({ mode, onClose, onSuccess }: { mode: Mode; onClose: () => void; onSuccess?: (mode: Mode) => void }) {
  const t = useTranslations('auth');
  const { signIn, signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = mode === 'signIn'
        ? await signIn(email, password)
        : await signUp(email, password, fullName);
      if (res.error) {
        setError(humanizeAuthError(res.error, mode));
        return;
      }
      onSuccess?.(mode);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const humanizeAuthError = (raw: string, kind: 'signIn' | 'signUp'): string => {
    const m = raw.toLowerCase();
    if (m.includes('over_email_send_rate_limit') || m.includes('email rate limit')) {
      return t('errors.rateLimit');
    }
    if (m.includes('email not confirmed')) {
      return t('errors.emailNotConfirmed');
    }
    if (m.includes('invalid login credentials') || m.includes('invalid credentials')) {
      return t('errors.invalidCredentials');
    }
    if (m.includes('user already registered') || m.includes('already been registered') || m.includes('email_exists')) {
      return t('errors.emailTaken');
    }
    if (m.includes('password') && m.includes('short') || m.includes('weak')) {
      return t('errors.weakPassword');
    }
    if (m.includes('signup') && m.includes('disabled')) {
      return t('errors.signupDisabled');
    }
    return kind === 'signIn' ? t('errors.signInFail') : t('errors.signUpFail');
  };

  const isSignIn = mode === 'signIn';
  const displayedMode = toggling ? (isSignIn ? 'signUp' : 'signIn') : mode;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t('close')}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md bg-paper rounded-lg border border-muted-2 shadow-3 p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('close')}
          className="absolute top-4 right-4 w-8 h-8 inline-flex items-center justify-center text-ink-2 hover:text-ink rounded-md"
        >
          ×
        </button>
        <h2 id="auth-title" className="font-display text-2xl text-ink tracking-tight">
          {displayedMode === 'signIn' ? t('signIn.title') : t('signUp.title')}
        </h2>
        <p className="font-body text-sm text-ink-2 mt-2">
          {displayedMode === 'signIn' ? t('signIn.subtitle') : t('signUp.subtitle')}
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {displayedMode === 'signUp' && (
            <label className="block">
              <span className="font-body text-xs text-ink-2 uppercase tracking-wider">
                {t('signUp.fullName')}
              </span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
                className="mt-1 w-full h-11 px-3 bg-paper-2 border border-muted rounded-md font-body text-ink focus:border-accent focus:outline-none"
              />
            </label>
          )}
          <label className="block">
            <span className="font-body text-xs text-ink-2 uppercase tracking-wider">
              {displayedMode === 'signIn' ? t('signIn.email') : t('signUp.email')}
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="mt-1 w-full h-11 px-3 bg-paper-2 border border-muted rounded-md font-body text-ink focus:border-accent focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="font-body text-xs text-ink-2 uppercase tracking-wider">
              {displayedMode === 'signIn' ? t('signIn.password') : t('signUp.password')}
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={displayedMode === 'signIn' ? 'current-password' : 'new-password'}
              className="mt-1 w-full h-11 px-3 bg-paper-2 border border-muted rounded-md font-body text-ink focus:border-accent focus:outline-none"
            />
          </label>
          {error && (
            <p role="alert" className="font-body text-sm text-danger">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 bg-ink text-paper font-body font-medium rounded-pill hover:bg-ink-2 disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-2"
          >
            {submitting && <Spinner size={14} />}
            {submitting
              ? t('submitting')
              : displayedMode === 'signIn'
                ? t('signIn.submit')
                : t('signUp.submit')}
          </button>
        </form>
        <p className="mt-6 font-body text-sm text-ink-2 text-center">
          {displayedMode === 'signIn' ? t('signIn.noAccount') : t('signUp.haveAccount')}{' '}
          <button
            type="button"
            onClick={() => setToggling((v) => !v)}
            className="text-accent font-medium hover:underline"
          >
            {displayedMode === 'signIn' ? t('signIn.signUpLink') : t('signUp.signInLink')}
          </button>
        </p>
      </div>
    </div>
  );
}