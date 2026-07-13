'use client';

import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useTranslations } from 'next-intl';
import { Invitation } from './invitation';
import type { Accent, FormData, SectionType } from '@/lib/templates/types';
import { SECTIONS, SECTION_ORDER } from '@/lib/templates/sections';

gsap.registerPlugin(useGSAP);

type Props = {
  template: { id: string; name: string; accent: Accent; sections: SectionType[]; slug: string };
  data: FormData;
  slug: string;
  locale: string;
};

export function CoverReveal({ template, data, slug, locale }: Props) {
  const t = useTranslations('invite');
  const [opened, setOpened] = useState(false);
  const coverRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!opened) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [opened]);

  useGSAP(() => {
    if (!opened) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      gsap.set(coverRef.current, { display: 'none' });
      const next = document.getElementById('invite-section-quote');
      next?.scrollIntoView({ behavior: 'auto' });
      return;
    }
    const tl = gsap.timeline();
    tl.to(coverRef.current, {
      yPercent: -100,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.inOut',
      onComplete: () => {
        if (coverRef.current) coverRef.current.style.display = 'none';
      },
    });
    tl.call(() => {
      const next = document.getElementById('invite-section-quote');
      next?.scrollIntoView({ behavior: 'smooth' });
    }, [], '+=0.1');
  }, [opened]);

  return (
    <>
      <div
        ref={coverRef}
        className="fixed inset-0 z-50 overflow-hidden"
        data-cover
      >
        <div className="absolute inset-0 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <CoverFull data={data} accent={template.accent} />
          </div>
          <div className="bg-gradient-to-t from-paper via-paper/95 to-transparent pt-12 pb-10 px-6 text-center">
            <p className="font-body text-xs uppercase tracking-[0.25em] text-ink-2 mb-3">
              {t('openInvite')}
            </p>
            <button
              type="button"
              onClick={() => setOpened(true)}
              data-animate="cover-cta"
              className="inline-flex items-center justify-center px-7 h-12 bg-ink text-paper font-body font-medium rounded-pill hover:bg-ink-2 transition-colors"
            >
              {t('openButton')} →
            </button>
            <p className="mt-3 font-body text-[10px] text-ink-3">
              {t('openHint')}
            </p>
          </div>
        </div>
      </div>
      <div ref={pageRef} data-invite-page={slug}>
        <Invitation template={template} data={data} opened={opened} />
      </div>
    </>
  );
}

function CoverFull({ data, accent }: { data: FormData; accent: Accent }) {
  const cover = data.cover ?? {};
  const n1 = (cover.couple_name_1 as string) || 'Rina';
  const n2 = (cover.couple_name_2 as string) || 'Budi';
  const date = cover.wedding_date as string | undefined;
  const opening = cover.opening_quote as string | undefined;

  const dark = accent === 'ink';

  return (
    <div className={`min-h-full flex flex-col items-center justify-center text-center px-6 py-16 ${
      dark ? 'bg-ink text-paper' : 'bg-paper text-ink'
    }`}>
      <div className={`w-10 h-10 rounded-full mb-8 ${dark ? 'bg-paper/20' : 'bg-accent'}`} aria-hidden />
      <p className={`font-body text-xs uppercase tracking-[0.25em] ${dark ? 'text-paper/70' : 'text-ink-2'}`}>
        Undangan Pernikahan
      </p>
      <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[1.02] tracking-[-0.02em]">
        {n1}
        <span className={`block my-2 text-3xl md:text-4xl ${dark ? 'text-paper' : 'text-accent'}`}>&</span>
        {n2}
      </h1>
      {date && (
        <p className={`mt-8 font-body text-base ${dark ? 'text-paper/70' : 'text-ink-2'}`}>
          {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date))}
        </p>
      )}
      {opening && (
        <p className={`mt-6 max-w-md font-body text-sm italic ${dark ? 'text-paper/80' : 'text-ink-2'} leading-[1.6]`}>
          {opening}
        </p>
      )}
    </div>
  );
}