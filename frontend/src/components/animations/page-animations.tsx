'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function PageAnimations() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // ── Hero: stagger in on load ──────────────────────────────────────
      gsap.set('[data-animate="hero"]', { autoAlpha: 0, y: 28 });
      gsap.to('[data-animate="hero"]', {
        autoAlpha: 1,
        y: 0,
        duration: 0.75,
        ease: 'power2.out',
        stagger: 0.12,
        delay: 0.08,
      });

      // ── Section headers: fade-up on scroll ───────────────────────────
      document.querySelectorAll('[data-animate="reveal"]').forEach((el) => {
        gsap.set(el, { autoAlpha: 0, y: 22 });
        gsap.to(el, {
          autoAlpha: 1,
          y: 0,
          duration: 0.65,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
        });
      });

      // ── Template cards: stagger batch ────────────────────────────────
      gsap.set('[data-animate="card"]', { autoAlpha: 0, y: 24 });
      ScrollTrigger.batch('[data-animate="card"]', {
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

      // ── How-it-works steps: stagger batch ────────────────────────────
      gsap.set('[data-animate="step"]', { autoAlpha: 0, y: 20 });
      ScrollTrigger.batch('[data-animate="step"]', {
        onEnter: (els) =>
          gsap.to(els, {
            autoAlpha: 1,
            y: 0,
            stagger: 0.14,
            duration: 0.6,
            ease: 'power2.out',
            overwrite: true,
          }),
        start: 'top 88%',
        once: true,
      });

      // ── FAQ items: stagger batch ──────────────────────────────────────
      gsap.set('[data-animate="faq-item"]', { autoAlpha: 0, y: 14 });
      ScrollTrigger.batch('[data-animate="faq-item"]', {
        onEnter: (els) =>
          gsap.to(els, {
            autoAlpha: 1,
            y: 0,
            stagger: 0.07,
            duration: 0.45,
            ease: 'power2.out',
            overwrite: true,
          }),
        start: 'top 88%',
        once: true,
      });
    });

    // Reduced-motion: make everything immediately visible
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set('[data-animate]', { autoAlpha: 1, y: 0 });
    });
  }, []);

  return null;
}
