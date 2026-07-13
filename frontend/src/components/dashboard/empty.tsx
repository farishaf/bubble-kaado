'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export function DashboardEmpty() {
  const t = useTranslations('dashboard');
  return (
    <div className="py-20 md:py-28 text-center" data-animate="dashboard-empty">
      <div className="relative mx-auto w-full max-w-sm">
        <svg
          viewBox="0 0 240 160"
          className="w-full h-auto text-muted-2"
          aria-hidden
        >
          <rect x="40" y="20" width="160" height="120" rx="6" fill="currentColor" opacity="0.25" />
          <rect x="56" y="40" width="128" height="4" rx="2" fill="currentColor" opacity="0.5" />
          <rect x="56" y="56" width="96" height="4" rx="2" fill="currentColor" opacity="0.35" />
          <rect x="56" y="72" width="110" height="4" rx="2" fill="currentColor" opacity="0.35" />
          <circle cx="120" cy="108" r="14" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
          <path
            d="M120 102v6m0 3v.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>
      </div>
      <p className="mt-8 font-display text-2xl md:text-3xl text-ink tracking-[-0.01em]">
        {t('emptyTitle')}
      </p>
      <p className="mt-3 font-body text-base md:text-lg text-ink-2 max-w-md mx-auto leading-[1.55]">
        {t('emptyBody')}
      </p>
      <div className="mt-10 flex items-center justify-center gap-3">
        <Link
          href="/design"
          className="inline-flex items-center px-6 h-12 bg-ink text-paper font-body font-medium rounded-pill hover:bg-ink-2 transition-colors"
        >
          {t('emptyCta')} →
        </Link>
        <a
          href={`mailto:hello@lumio.id?subject=${encodeURIComponent('Need help with my first invitation')}`}
          className="font-body text-sm text-ink-2 hover:text-ink transition-colors px-4 h-12 inline-flex items-center"
        >
          {t('emptyHelp')}
        </a>
      </div>
    </div>
  );
}