'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { FLOWERS, FLOWER_ORDER } from '@/lib/bloom/flowers';
import { Flower } from './flower';

gsap.registerPlugin(useGSAP);

export function FlowerExplorer() {
  const t = useTranslations('bloom.flowers');
  const tBloom = useTranslations('bloom');
  const [active, setActive] = useState<string>('rose');
  const containerRef = useRef<HTMLDivElement>(null);
  const def = FLOWERS[active as keyof typeof FLOWERS];

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const target = containerRef.current?.querySelector('[data-flower-detail]');
      if (target) {
        gsap.fromTo(
          target,
          { autoAlpha: 0, y: 8 },
          { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' }
        );
      }
    });
    return () => mm.revert();
  }, { scope: containerRef, dependencies: [active] });

  return (
    <div ref={containerRef}>
      <div className="grid grid-cols-4 gap-3 md:gap-4">
        {FLOWER_ORDER.map((id) => {
          const f = FLOWERS[id];
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              data-flower-chip={id}
              data-active={isActive || undefined}
              className={`flower-picker__chip ${isActive ? 'is-active' : ''}`}
              aria-pressed={isActive}
              aria-label={f.name}
            >
              <Flower flowerId={id} size={48} variant="picker" />
              <span className="flower-picker__name">
                {t(id as 'rose' | 'tulip' | 'daisy' | 'sunflower' | 'lavender' | 'peony' | 'blossom' | 'lily')}
              </span>
            </button>
          );
        })}
      </div>
      <div data-flower-detail className="mt-8 text-center">
        <p className="font-body text-xs uppercase tracking-[0.25em] text-accent mb-3">
          {def.name}
        </p>
        <p className="font-display text-3xl md:text-4xl text-ink leading-[1.15]">
          {tBloom(`meanings.${def.meaningId}` as 'meanings.love')}
        </p>
      </div>
    </div>
  );
}
