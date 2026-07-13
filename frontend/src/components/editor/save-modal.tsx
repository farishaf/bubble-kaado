'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { SaveResponse } from '@/lib/templates/types';

type Props = {
  open: boolean;
  onClose: () => void;
  result: SaveResponse | null;
};

export function SaveSuccessModal({ open, onClose, result }: Props) {
  const t = useTranslations('editor');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || !result) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-title"
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t('close')}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md bg-paper rounded-lg border border-muted-2 shadow-3 p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-accent flex items-center justify-center text-accent-ink text-2xl font-display mb-5" aria-hidden>
          ✓
        </div>
        <h2 id="save-title" className="font-display text-2xl text-ink tracking-tight">
          {t('savedTitle')}
        </h2>
        <p className="font-body text-sm text-ink-2 mt-2">
          {t('savedBody')}
        </p>
        <div className="mt-6 p-3 bg-paper-2 border border-muted rounded-md flex items-center gap-2">
          <code className="flex-1 text-left font-mono text-xs text-ink truncate">
            {result.url}
          </code>
          <button
            type="button"
            onClick={() => void copy()}
            className="font-body text-xs px-3 h-8 inline-flex items-center bg-ink text-paper rounded-pill hover:bg-ink-2 transition-colors"
          >
            {copied ? t('copied') : t('copy')}
          </button>
        </div>
        <div className="mt-6 flex gap-2 justify-center">
          <Link
            href="/dashboard"
            className="font-body text-sm px-4 h-10 inline-flex items-center border border-muted text-ink-2 rounded-pill hover:border-ink-2 hover:text-ink transition-colors"
          >
            {t('backToDashboard')}
          </Link>
          <Link
            href={`/i/${result.slug}`}
            className="font-body text-sm px-4 h-10 inline-flex items-center bg-accent text-accent-ink rounded-pill hover:bg-accent-2 transition-colors"
          >
            {t('viewInvite')} →
          </Link>
        </div>
      </div>
    </div>
  );
}