'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useToast } from '@/lib/ui/toast';
import { previewRegistry } from '@/lib/templates/registry';
import { getTemplate } from '@/lib/templates/data';
import { getGiftTemplate } from '@/lib/gift/data';

type ApiCard = {
  slug: string;
  url: string;
  status: string;
  template_slug: string;
};

type Props = {
  card: ApiCard;
  locale: string;
};

export function DashboardCard({ card, locale }: Props) {
  const t = useTranslations('dashboard');
  const tToast = useTranslations('toast');
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const template = getTemplate(card.template_slug);
  const gift = getGiftTemplate(card.template_slug);
  const Cover = previewRegistry.cover;
  const accent = template?.accent ?? 'rose';
  const fakeCover: { [k: string]: string } = {};

  // `Link` (from `@/i18n/routing`) auto-prepends the current locale, so this path must stay locale-free.
  const viewHref = gift
    ? `/g/${card.template_slug}?s=${card.slug}`
    : `/i/${card.slug}`;

  const onCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const link = gift ? `${window.location.origin}/${locale}${viewHref}` : card.url;
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.show(tToast('copied'), { variant: 'success' });
    } catch { /* ignore */ }
  };

  return (
    <div
      data-animate="dashboard-card"
      className="rounded-lg border border-muted-2 bg-paper overflow-hidden flex flex-col"
    >
      <Link href={viewHref} target="_blank" className="block">
        <div className="aspect-[4/3] overflow-hidden border-b border-muted-2">
          {gift ? (
            <div className="w-full h-full flex items-center justify-center bg-paper-2">
              <span aria-hidden className="text-5xl">🎁</span>
            </div>
          ) : (
            <Cover data={fakeCover} accent={accent} />
          )}
        </div>
      </Link>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-lg text-ink truncate">
            {gift?.name ?? template?.name ?? card.template_slug}
          </h3>
          <span className={`font-body text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-pill border ${
            card.status === 'published'
              ? 'border-accent text-accent'
              : 'border-muted text-ink-3'
          }`}>
            {card.status === 'published' ? t('statusPublished') : t('statusDraft')}
          </span>
        </div>
        <p className="mt-1 font-body text-xs text-ink-3 truncate">/{card.slug}</p>
        <div className="mt-4 flex gap-2">
          <Link
            href={viewHref}
            target="_blank"
            className="flex-1 font-body text-xs px-3 h-8 inline-flex items-center justify-center bg-ink text-paper rounded-pill hover:bg-ink-2 transition-colors"
          >
            {t('view')} →
          </Link>
          <button
            type="button"
            onClick={onCopy}
            className="font-body text-xs px-3 h-8 inline-flex items-center border border-muted rounded-pill hover:border-ink-2 hover:text-ink text-ink-2 transition-colors"
          >
            {copied ? t('copied') : t('copy')}
          </button>
        </div>
      </div>
    </div>
  );
}
