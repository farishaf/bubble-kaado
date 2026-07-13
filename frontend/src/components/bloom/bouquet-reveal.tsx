'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useTranslations } from 'next-intl';
import type { BloomData } from '@/lib/bloom/types';
import { Bouquet } from './bouquet';

type Props = { data: BloomData };

type Phase = 'cover' | 'blooming' | 'bloomed' | 'all-revealed' | 'note' | 'closed';

export function BouquetReveal({ data }: Props) {
  const t = useTranslations('bloom');
  const [opened, setOpened] = useState(false);
  const [phase, setPhase] = useState<Phase>('cover');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const coverRef = useRef<HTMLDivElement>(null);
  const bouquetRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef<HTMLDivElement>(null);

  const flowers = data.bouquet ?? [];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('autoplay') === '1') {
      const id = setTimeout(() => {
        setOpened(true);
        setPhase('blooming');
      }, 200);
      return () => clearTimeout(id);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.body.style.overflow = opened ? '' : 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [opened]);

  useEffect(() => {
    if (phase !== 'blooming') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = gsap.utils.toArray<HTMLElement>('[data-bouquet-slot]');
    const hint = bouquetRef.current?.querySelector<HTMLElement>('[data-bloom-hint]');

    if (reduce) {
      gsap.set(els, { scale: 1, opacity: 1 });
      if (hint) gsap.set(hint, { autoAlpha: 1, y: 0 });
      queueMicrotask(() => setPhase('bloomed'));
      return;
    }

    const tl = gsap.timeline({ onComplete: () => setPhase('bloomed') });
    tl.fromTo(
      els,
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: 'back.out(1.4)',
        stagger: { each: 0.18, from: 'start' },
      }
    );
    if (hint) {
      tl.fromTo(
        hint,
        { autoAlpha: 0, y: 6 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.3'
      );
    }
    return () => {
      tl.kill();
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'all-revealed') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      gsap.set(ctaRef.current, { autoAlpha: 1, y: 0 });
      return;
    }
    const tween = gsap.fromTo(
      ctaRef.current,
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power2.out' }
    );
    return () => {
      tween.kill();
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'note') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      gsap.set([noteRef.current, closingRef.current], { autoAlpha: 1, y: 0 });
      queueMicrotask(() => setPhase('closed'));
      return;
    }
    const tl = gsap.timeline({ onComplete: () => setPhase('closed') });
    tl.fromTo(
      noteRef.current,
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }
    );
    tl.fromTo(
      closingRef.current,
      { autoAlpha: 0, y: 8 },
      { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.3'
    );
    return () => {
      tl.kill();
    };
  }, [phase]);

  const onOpen = () => {
    setOpened(true);
    setPhase('blooming');
  };

  const onTapFlower = (index: number) => {
    if (phase !== 'bloomed' && phase !== 'all-revealed') return;
    setActiveIndex(index);
    setRevealed((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      if (next.size === flowers.length) {
        setTimeout(() => setPhase('all-revealed'), 600);
      }
      return next;
    });
  };

  const onTapOutside = () => {
    if (phase === 'bloomed' || phase === 'all-revealed') {
      setActiveIndex(null);
    }
  };

  const onContinue = () => {
    setActiveIndex(null);
    setPhase('note');
  };

  if (!opened) {
    return (
      <div ref={coverRef} className="fixed inset-0 z-50 bg-paper" data-bloom-cover>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <div data-bloom-cover-text>
            <p className="font-body text-xs uppercase tracking-[0.28em] text-ink-2 mb-6">
              {data.envelope.sender_name ? t('fromLabel', { name: data.envelope.sender_name }) : t('aSmallThing')}
            </p>
            <h1 className="font-display text-[clamp(2.25rem,7vw,4rem)] text-ink leading-[1.05] tracking-[-0.02em] max-w-[18ch] mx-auto">
              {data.envelope.recipient_name
                ? t('forYou', { name: data.envelope.recipient_name })
                : t('forYouAnon')}
            </h1>
            {data.envelope.opening && (
              <p className="mt-8 font-body text-base md:text-lg text-ink-2 max-w-md mx-auto leading-[1.6] italic">
                {data.envelope.opening}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onOpen}
            data-bloom-cover-cta
            className="mt-14 inline-flex items-center justify-center px-7 h-12 bg-ink text-paper font-body font-medium rounded-pill hover:bg-ink-2 transition-colors"
          >
            {t('openBouquet')}
            <span aria-hidden className="ml-2">→</span>
          </button>
          <p className="mt-4 font-body text-[11px] text-ink-3">{t('tapToBloom')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper" onClick={onTapOutside}>
      <div className="mx-auto max-w-2xl px-6 pt-14 pb-20">
        <p className="text-center font-body text-xs uppercase tracking-[0.28em] text-ink-2 mb-2">
          {t('bouquetLabel')}
        </p>
        <h2 className="text-center font-display text-3xl md:text-4xl text-ink tracking-[-0.02em] leading-[1.1] mb-2">
          {t('tapEach')}
        </h2>
        <p data-bloom-hint className="text-center font-body text-sm text-ink-3 mb-10 opacity-0">
          {t('hint')}
        </p>

        <div ref={bouquetRef} className="relative">
          <Bouquet
            flowers={flowers}
            onTap={onTapFlower}
            revealed={revealed}
            activeIndex={activeIndex}
          />
        </div>

        <div ref={ctaRef} className="mt-12 text-center opacity-0">
          <p className="font-body text-sm text-ink-2 mb-5">
            {revealed.size === flowers.length
              ? t('allOpened')
              : t('openedCount', { count: revealed.size, total: flowers.length })}
          </p>
          {revealed.size === flowers.length ? (
            <button
              type="button"
              onClick={onContinue}
              className="inline-flex items-center justify-center px-7 h-12 bg-accent text-accent-ink font-body font-medium rounded-pill hover:bg-accent-2 transition-colors"
            >
              {t('readNote')}
              <span aria-hidden className="ml-2">→</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              className="inline-flex items-center justify-center px-7 h-12 border border-muted text-ink-2 font-body font-medium rounded-pill hover:border-ink-2 hover:text-ink transition-colors"
            >
              {t('resetSelection')}
            </button>
          )}
        </div>

        {phase === 'note' || phase === 'closed' ? (
          <div ref={noteRef} className="mt-20 border-t border-muted-2 pt-12 opacity-0">
            {data.note.heading && (
              <p className="text-center font-body text-xs uppercase tracking-[0.28em] text-accent mb-3">
                {data.note.heading}
              </p>
            )}
            {data.note.body && (
              <p className="mx-auto max-w-md font-display text-xl md:text-2xl text-ink leading-[1.45] text-center">
                {data.note.body}
              </p>
            )}
            <div ref={closingRef} className="mt-10 text-center opacity-0">
              {data.closing.signed && (
                <p className="font-body text-sm text-ink-2 italic">{data.closing.signed}</p>
              )}
              {data.envelope.sender_name && (
                <p className="mt-2 font-display text-2xl text-ink">{data.envelope.sender_name}</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
