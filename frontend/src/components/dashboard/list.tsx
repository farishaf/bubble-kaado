'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslations } from 'next-intl';
import { DashboardCard } from './card';
import { DashboardEmpty } from './empty';
import { Link } from '@/i18n/routing';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type ApiCard = {
  slug: string;
  url: string;
  status: string;
  template_slug: string;
};

type Props = {
  cards: ApiCard[];
  locale: string;
};

export function DashboardList({ cards, locale }: Props) {
  const t = useTranslations('dashboard');
  const scopeRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set('[data-animate="dashboard-card"]', { autoAlpha: 0, y: 20 });
      ScrollTrigger.batch('[data-animate="dashboard-card"]', {
        onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.5, ease: 'power2.out', overwrite: true }),
        start: 'top 90%',
        once: true,
      });
    });
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set('[data-animate="dashboard-card"]', { autoAlpha: 1, y: 0 });
    });
  }, { scope: scopeRef });

  if (cards.length === 0) {
    return <DashboardEmpty />;
  }

  return (
    <div ref={scopeRef}>
      <div className="flex items-center justify-between mb-8">
        <p className="font-body text-sm text-ink-2">
          {t('count', { n: cards.length })}
        </p>
        <Link
          href="/design"
          className="font-body text-sm px-4 h-9 inline-flex items-center bg-ink text-paper rounded-pill hover:bg-ink-2 transition-colors"
        >
          {t('newCta')}
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {cards.map((card) => (
          <DashboardCard key={card.slug} card={card} locale={locale} />
        ))}
      </div>
    </div>
  );
}