'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';

interface Item { q: string; a: string }

export function FAQAccordion({ items }: { items: Item[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const iconRefs = useRef<(HTMLSpanElement | null)[]>([]);

  function toggle(i: number) {
    const panel = panelRefs.current[i];
    const icon = iconRefs.current[i];
    if (!panel || !icon) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dur = (ms: number) => (reduceMotion ? 0 : ms);

    // Close previously open item
    if (openIndex !== null && openIndex !== i) {
      const prevPanel = panelRefs.current[openIndex];
      const prevIcon = iconRefs.current[openIndex];
      if (prevPanel) gsap.to(prevPanel, { height: 0, duration: dur(0.3), ease: 'power2.in', overwrite: true });
      if (prevIcon) gsap.to(prevIcon, { rotation: 0, duration: dur(0.2), ease: 'power2.out', overwrite: true });
    }

    if (openIndex === i) {
      gsap.to(panel, { height: 0, duration: dur(0.3), ease: 'power2.in', overwrite: true });
      gsap.to(icon, { rotation: 0, duration: dur(0.2), ease: 'power2.out', overwrite: true });
      setOpenIndex(null);
    } else {
      gsap.to(panel, { height: 'auto', duration: dur(0.4), ease: 'power2.out', overwrite: true });
      gsap.to(icon, { rotation: 45, duration: dur(0.2), ease: 'power2.out', overwrite: true });
      setOpenIndex(i);
    }
  }

  return (
    <div className="divide-y divide-muted-2 border-t border-b border-muted-2">
      {items.map((item, i) => (
        <div key={i} data-animate="faq-item">
          <button
            type="button"
            onClick={() => toggle(i)}
            aria-expanded={openIndex === i}
            className="w-full flex items-center justify-between gap-6 py-5 text-left"
          >
            <span className="font-display text-lg text-ink">{item.q}</span>
            <span
              ref={(el) => { iconRefs.current[i] = el; }}
              aria-hidden
              className="font-body text-xl text-ink-2 flex-shrink-0 inline-block"
            >
              +
            </span>
          </button>
          <div
            ref={(el) => { panelRefs.current[i] = el; }}
            style={{ height: 0, overflow: 'hidden' }}
          >
            <p className="pb-5 font-body text-base text-ink-2 leading-[1.6] max-w-2xl">
              {item.a}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
