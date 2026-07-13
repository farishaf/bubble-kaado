'use client';

import { useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslations } from 'next-intl';
import { SECTIONS, SECTION_ORDER } from '@/lib/templates/sections';
import { previewRegistry } from '@/lib/templates/registry';
import type { Accent, FormData, SectionType } from '@/lib/templates/types';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Props = {
  template: { id: string; name: string; accent: Accent; sections: SectionType[]; slug: string };
  data: FormData;
  opened: boolean;
};

export function Invitation({ template, data, opened }: Props) {
  const t = useTranslations('invite');
  const scopeRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!opened) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const sections = gsap.utils.toArray<HTMLElement>('[data-invite-section]');
      sections.forEach((el) => {
        gsap.from(el, {
          autoAlpha: 0,
          y: 30,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          },
        });
      });
    });
  }, { scope: scopeRef, dependencies: [opened] });

  const sectionsToRender = template.sections.length > 0 ? template.sections : SECTION_ORDER;
  const enabledSections = sectionsToRender.filter((stype) => data[stype]?.enabled !== false);

  return (
    <div ref={scopeRef} className="bg-paper">
      {enabledSections.map((stype, idx) => {
        const def = SECTIONS[stype];
        if (!def) return null;
        const Preview = previewRegistry[stype];
        const sectionData = data[stype] ?? {};
        return (
          <div
            key={stype}
            id={idx === 0 ? 'invite-section-cover' : `invite-section-${stype}`}
            data-invite-section
          >
            <Preview data={sectionData} accent={template.accent} />
          </div>
        );
      })}
      <footer className="border-t border-muted-2">
        <div className="mx-auto max-w-3xl px-6 py-8 text-center">
          <p className="font-body text-xs text-ink-3">
            {t('madeWith')} · <a href={`https://lumio.id`} className="underline hover:text-ink-2">Lumio</a>
          </p>
        </div>
      </footer>
    </div>
  );
}