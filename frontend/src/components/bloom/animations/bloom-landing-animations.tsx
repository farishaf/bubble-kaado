'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function BloomLandingAnimations() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set('[data-animate="bloom-hero"]', { autoAlpha: 0, y: 24 });
      gsap.to('[data-animate="bloom-hero"]', {
        autoAlpha: 1,
        y: 0,
        duration: 0.75,
        ease: 'power2.out',
        stagger: 0.1,
        delay: 0.08,
      });

      gsap.set('[data-animate="bloom-chip"]', { autoAlpha: 0, y: 12, scale: 0.92 });
      ScrollTrigger.batch('[data-animate="bloom-chip"]', {
        onEnter: (els) =>
          gsap.to(els, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            stagger: 0.06,
            duration: 0.5,
            ease: 'back.out(1.4)',
            overwrite: true,
          }),
        start: 'top 88%',
        once: true,
      });

      gsap.set('[data-animate="reveal"]', { autoAlpha: 0, y: 22 });
      gsap.to('[data-animate="reveal"]', {
        autoAlpha: 1,
        y: 0,
        duration: 0.65,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '[data-animate="reveal"]',
          start: 'top 85%',
          once: true,
        },
      });

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
    });

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set('[data-animate]', { autoAlpha: 1, y: 0, scale: 1 });
    });
  }, []);

  return null;
}
