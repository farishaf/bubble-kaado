'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function DesignAnimations() {
  const scopeRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set('[data-animate="design-hero"]', { autoAlpha: 0, y: 24 });
      gsap.to('[data-animate="design-hero"]', {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.1,
        delay: 0.08,
      });

      gsap.set('[data-animate="filter-chip"]', { autoAlpha: 0, y: 12 });
      gsap.to('[data-animate="filter-chip"]', {
        autoAlpha: 1,
        y: 0,
        duration: 0.45,
        ease: 'power2.out',
        stagger: 0.05,
        delay: 0.3,
      });

      gsap.set('[data-animate="design-card"]', { autoAlpha: 0, y: 28 });
      ScrollTrigger.batch('[data-animate="design-card"]', {
        onEnter: (els) =>
          gsap.to(els, {
            autoAlpha: 1,
            y: 0,
            stagger: 0.08,
            duration: 0.55,
            ease: 'power2.out',
            overwrite: true,
          }),
        start: 'top 88%',
        once: true,
      });
    });

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set('[data-animate="design-hero"], [data-animate="filter-chip"], [data-animate="design-card"]', {
        autoAlpha: 1,
        y: 0,
      });
    });
  }, { scope: scopeRef });

  return <div ref={scopeRef} aria-hidden className="hidden" />;
}