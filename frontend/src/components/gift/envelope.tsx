'use client';

import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Observer } from 'gsap/Observer';
import { giftSound } from '@/lib/gift/sound';
import { StampSticker, Postmark } from './stamps';

gsap.registerPlugin(useGSAP, Observer);

type Props = {
  color: string;
  stampKind: string;
  hintClosed: string;
  hintAjar: string;
  cover: ReactNode;
  onOpened: () => void;
};

const ENV_COLORS = ['cream', 'rose', 'kraft', 'sky', 'airmail', 'airmail-bold'];

function DecorMark({ className }: { className: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M9 2 V16 M2 9 H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SwipeCue() {
  return (
    <svg className="gift-env__swipe-arrow" width="20" height="26" viewBox="0 0 20 26" aria-hidden="true">
      <path d="M10 24 V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M3 11 L10 3.5 L17 11"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GiftEnvelope({ color, stampKind, hintClosed, hintAjar, cover, onOpened }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const idleRef = useRef<gsap.core.Timeline | null>(null);
  const observerRef = useRef<Observer | null>(null);
  const stepRef = useRef(0);
  const [hint, setHint] = useState(hintClosed);
  const [ajar, setAjar] = useState(false);
  const env = ENV_COLORS.includes(color) ? color : 'cream';

  const { contextSafe } = useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return;
      // Pumpkin-style squash & stretch idle bounce
      idleRef.current = gsap
        .timeline({ repeat: -1, repeatDelay: 0.9, delay: 0.4 })
        .to('.gift-env__bounce', { y: -22, scaleY: 1.06, scaleX: 0.96, duration: 0.38, ease: 'power2.out' })
        .to('.gift-env__shadow', { scaleX: 0.78, opacity: 0.05, duration: 0.38, ease: 'power2.out' }, '<')
        .to('.gift-env__decor', { y: -6, duration: 0.38, ease: 'power2.out', stagger: 0.03 }, '<')
        .to('.gift-env__bounce', { y: 0, scaleY: 0.9, scaleX: 1.08, duration: 0.3, ease: 'power2.in' })
        .to('.gift-env__shadow', { scaleX: 1, opacity: 0.1, duration: 0.3, ease: 'power2.in' }, '<')
        .to('.gift-env__decor', { y: 0, duration: 0.3, ease: 'power2.in', stagger: 0.03 }, '<')
        .to('.gift-env__bounce', { scaleY: 1, scaleX: 1, duration: 0.34, ease: 'elastic.out(1.4, 0.5)' });
    },
    { scope: rootRef }
  );

  // Step 2: the letter is pulled out. Reached by swipe-up, ArrowUp, or Enter —
  // never by a plain tap, so the reveal always costs a deliberate gesture.
  // eslint-disable-next-line react-hooks/refs -- contextSafe-wrapped handler, refs read on gesture, not render
  const pullOut = contextSafe(() => {
    if (stepRef.current !== 1) return;
    stepRef.current = 2;
    setAjar(false);
    observerRef.current?.disable();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    giftSound.click();
    gsap
      .timeline({ onComplete: onOpened })
      .to('.gift-env__letter', {
        y: '-130%',
        scale: 1.12,
        duration: reduced ? 0.01 : 0.5,
        ease: 'power2.inOut',
      })
      // depth split: envelope sinks fast, near decor flies past, far decor lags
      .to(
        '.gift-env__body, .gift-env__shadow',
        { y: 90, opacity: 0, duration: reduced ? 0.01 : 0.45, ease: 'power2.in' },
        '-=0.3'
      )
      .to('.gift-env__decor--a, .gift-env__decor--d', { y: 60, opacity: 0, duration: reduced ? 0.01 : 0.4, ease: 'power2.in' }, '<')
      .to('.gift-env__decor--b, .gift-env__decor--c', { y: 24, opacity: 0, duration: reduced ? 0.01 : 0.5, ease: 'power2.in' }, '<')
      .to('.gift-env__letter', { opacity: 0, duration: reduced ? 0.01 : 0.22, ease: 'power1.in' }, '-=0.1')
      .to('.gift-env__hint, .gift-env__swipe', { opacity: 0, duration: 0.2 }, 0);
  });

  // The Observer stays disabled until the flap is open, so a swipe over a sealed
  // envelope still scrolls the page normally.
  useGSAP(
    () => {
      const observer = Observer.create({
        target: rootRef.current,
        type: 'touch,pointer,wheel',
        tolerance: 20,
        preventDefault: true,
        onUp: () => pullOut(),
      });
      observer.disable();
      observerRef.current = observer;
      return () => {
        observerRef.current = null;
        observer.kill();
      };
    },
    { scope: rootRef, dependencies: [pullOut] }
  );

  // eslint-disable-next-line react-hooks/refs -- contextSafe-wrapped event handler, refs read on click, not render
  const onClick = contextSafe(() => {
    if (stepRef.current !== 0) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    stepRef.current = 1;
    giftSound.open();
    idleRef.current?.kill();
    setHint(hintAjar);
    setAjar(true);
    observerRef.current?.enable();
    gsap
      .timeline()
      .to('.gift-env__bounce', { y: 0, scaleX: 1, scaleY: 1, duration: 0.18, ease: 'power2.out' })
      .to('.gift-env__seal', { scale: 0.4, opacity: 0, duration: reduced ? 0.01 : 0.25, ease: 'power2.in' })
      .to('.gift-env__flap', {
        rotateX: -180,
        duration: reduced ? 0.01 : 0.55,
        ease: 'power2.inOut',
        onUpdate() {
          const rx = Number(gsap.getProperty('.gift-env__flap', 'rotateX'));
          if (rx <= -90) gsap.set('.gift-env__flap', { zIndex: 1 });
        },
      })
      // parallax: near decor drifts further than far decor while the flap opens
      .to('.gift-env__decor--a, .gift-env__decor--d', { y: -26, duration: reduced ? 0.01 : 0.6, ease: 'power2.out' }, '<')
      .to('.gift-env__decor--b, .gift-env__decor--c', { y: -10, duration: reduced ? 0.01 : 0.6, ease: 'power2.out' }, '<')
      .to('.gift-env__letter', { y: '-58%', duration: reduced ? 0.01 : 0.5, ease: 'back.out(1.4)' }, '-=0.15');
  });

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (stepRef.current === 1 && (e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      pullOut();
    }
  };

  return (
    <div ref={rootRef} className="gift-env-wrap" data-ajar={ajar}>
      <DecorMark className="gift-env__decor gift-env__decor--a" />
      <DecorMark className="gift-env__decor gift-env__decor--b" />
      <DecorMark className="gift-env__decor gift-env__decor--c" />
      <DecorMark className="gift-env__decor gift-env__decor--d" />
      <button
        type="button"
        className="gift-env"
        data-env={env}
        onClick={onClick}
        onKeyDown={onKeyDown}
        aria-label={hint}
      >
        <div className="gift-env__bounce">
          <div className="gift-env__body">
            <div className="gift-env__back" />
            <div className="gift-env__letter" aria-hidden="true">
              {cover}
            </div>
            <div className="gift-env__front" />
            <div className="gift-env__lines" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <span className="gift-env__stampsticker">
              <StampSticker kind={stampKind} />
            </span>
            <Postmark />
            <div className="gift-env__flap" />
            <span className="gift-env__seal" />
          </div>
        </div>
        <div className="gift-env__shadow" aria-hidden="true" />
      </button>
      {ajar && (
        <span className="gift-env__swipe" aria-hidden="true">
          <SwipeCue />
        </span>
      )}
      <p className="gift-env__hint" aria-live="polite">
        {hint}
      </p>
    </div>
  );
}
