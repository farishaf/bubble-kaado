'use client';

import { useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import type { GiftPlayerProps } from '@/lib/gift/types';
import { giftSound } from '@/lib/gift/sound';
import { burstConfetti } from './confetti';
import { GiftLetter } from './letter';
import { Mascot } from './mascot';
import { GiftPuzzle } from './puzzle';
import { GiftSongPlayer, youtubeId } from './song';

gsap.registerPlugin(useGSAP);

type Stage = 'loading' | 'box' | 'puzzle' | 'reveal' | 'letter';

const CLIPPINGS = [0, 1, 2, 3, 4, 5, 6];

function daysUntil(iso: string): number | null {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Stage 1 · delivery truck ─────────────────────────────────────── */

function DeliveryLoader({ wordmark, caption, onDone }: { wordmark: string; caption: string; onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduced()) {
        gsap.delayedCall(0.6, onDone);
        return;
      }
      gsap.to('.pb-truck__wheel', { rotate: 360, duration: 0.7, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
      gsap
        .timeline({ onComplete: onDone })
        .from('.pb-truck', { x: -160, opacity: 0, duration: 0.7, ease: 'power2.out' })
        .to('.pb-truck', { y: -4, duration: 0.28, repeat: 5, yoyo: true, ease: 'sine.inOut' }, '<0.2')
        .to('.pb-truck__parcel', { rotate: -6, duration: 0.34, repeat: 3, yoyo: true, ease: 'sine.inOut' }, '<')
        .call(() => giftSound.whoosh())
        .to('.pb-truck', { x: 190, opacity: 0, duration: 0.62, ease: 'power2.in' })
        .to('.pb-loader__caption', { opacity: 0, duration: 0.3 }, '<');
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="gift-stage gift-center">
      <div className="pb-loader">
        <p className="pb-wordmark">{wordmark}</p>
        <div className="pb-road">
          <div className="pb-truck">
            <svg width="150" height="96" viewBox="0 0 150 96" aria-hidden="true">
              <g className="pb-truck__parcel">
                <rect className="pb-truck__gift" x="26" y="16" width="34" height="30" rx="5" />
                <rect className="pb-truck__ribbon" x="39" y="16" width="8" height="30" />
                <path
                  className="pb-truck__bow"
                  d="M43 16 C36 4 24 8 29 15 C33 19 40 17 43 16 C46 17 53 19 57 15 C62 8 50 4 43 16"
                />
              </g>
              <path className="pb-truck__body" d="M18 46 H86 a6 6 0 0 1 6 6 V72 H12 V52 a6 6 0 0 1 6 -6 Z" />
              <path className="pb-truck__cab" d="M92 52 h20 l16 14 v6 H92 Z" />
              <rect className="pb-truck__window" x="99" y="55" width="17" height="10" rx="2" />
              <circle className="pb-truck__wheel" cx="36" cy="76" r="9" />
              <circle className="pb-truck__wheel" cx="108" cy="76" r="9" />
            </svg>
          </div>
        </div>
        <p className="pb-loader__caption">{caption}</p>
      </div>
    </div>
  );
}

/* ── Stage 2 · the box falls ──────────────────────────────────────── */

function FallingBox({
  eyebrow,
  from,
  hint,
  tagPhoto,
  onOpen,
}: {
  eyebrow: string;
  from: string;
  hint: string;
  tagPhoto: string;
  onOpen: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduced()) return;
      gsap.set('.pb-smoke', { scale: 0, opacity: 0 });
      gsap
        .timeline({ defaults: { ease: 'power2.out' } })
        .from('.pb-box', { y: -420, duration: 1, ease: 'bounce.out' })
        .call(() => giftSound.thud(), undefined, 0.62)
        .to('.pb-smoke', { scale: 1.9, opacity: 0.55, duration: 0.32, stagger: 0.05 }, 0.6)
        .to('.pb-smoke', { scale: 2.6, opacity: 0, y: -26, duration: 0.7, stagger: 0.05 }, '>-0.1')
        .to('.pb-box', { scaleY: 0.86, scaleX: 1.12, duration: 0.12, transformOrigin: '50% 100%' }, 0.6)
        .to('.pb-box', { scaleY: 1, scaleX: 1, duration: 0.5, ease: 'elastic.out(1.2, 0.4)' }, 0.72)
        .from('.pb-tag', { scale: 0, opacity: 0, duration: 0.5, ease: 'back.out(2)' }, 1.05)
        .to('.pb-tag', { rotate: 3, duration: 1.6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="gift-stage gift-center">
      <div className="pb-boxwrap">
        <p className="gift-eyebrow">{eyebrow}</p>
        {from && <p className="gift-from">{from}</p>}

        <div className="pb-scene">
          <span className="pb-smoke pb-smoke--a" aria-hidden="true" />
          <span className="pb-smoke pb-smoke--b" aria-hidden="true" />
          <span className="pb-smoke pb-smoke--c" aria-hidden="true" />
          <div className="pb-box" aria-hidden="true">
            <svg width="188" height="188" viewBox="0 0 120 120">
              <ellipse className="gift-mascot__shadow" cx="60" cy="112" rx="38" ry="5" />
              <g className="gift-box__lid">
                <rect className="gift-box__lid-rect" x="24" y="34" width="72" height="20" rx="6" />
                <path className="gift-box__ribbon" d="M56 34 L56 54 L64 54 L64 34 Z" />
                <path
                  className="gift-box__bow"
                  d="M60 34 C52 20 38 24 44 32 C48 37 56 35 60 34 C64 35 72 37 76 32 C82 24 68 20 60 34"
                />
              </g>
              <rect className="gift-box__base" x="30" y="54" width="60" height="52" rx="8" />
              <rect className="gift-box__ribbon" x="56" y="54" width="8" height="52" />
            </svg>
          </div>

          <button type="button" className="pb-tag" onClick={onOpen} aria-label={hint}>
            <span className="pb-tag__hole" aria-hidden="true" />
            <span
              className="pb-tag__art"
              style={tagPhoto ? { backgroundImage: `url(${tagPhoto})` } : undefined}
              aria-hidden="true"
            >
              {!tagPhoto && (
                <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    className="pb-tag__glyph"
                    d="M3 3h8v5H8v3H3Zm10 0h8v8h-5V8h-3Zm-10 10h5v3h3v5H3Zm13 0h5v8h-8v-5h3Z"
                  />
                </svg>
              )}
            </span>
          </button>
        </div>

        <p className="pb-hint">{hint}</p>
      </div>
    </div>
  );
}

/* ── Stage 4 · the box opens ──────────────────────────────────────── */

function BoxOpening({
  media,
  title,
  cta,
  restart,
  onRead,
  onRestart,
}: {
  media: string;
  title: string;
  cta: string;
  restart: string;
  onRead: () => void;
  onRestart: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      giftSound.paper();
      if (reduced()) return;
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      tl.to('.pb-open__lid', { y: -120, rotate: -22, opacity: 0, duration: 0.7, ease: 'power2.in' });
      gsap.utils.toArray<HTMLElement>('.pb-clip', rootRef.current).forEach((clip, i) => {
        const dir = i % 2 ? 1 : -1;
        tl.fromTo(
          clip,
          { x: 0, y: 0, scale: 0.4, opacity: 0, rotate: 0 },
          {
            x: dir * gsap.utils.random(60, 150),
            y: gsap.utils.random(-190, -70),
            rotate: dir * gsap.utils.random(18, 70),
            scale: gsap.utils.random(0.8, 1.15),
            opacity: 1,
            duration: 0.8,
          },
          0.12 + i * 0.05
        ).to(clip, { y: '+=40', opacity: 0, duration: 0.9, ease: 'power1.in' }, '>-0.35');
      });
      tl.from('.pb-media', { y: 130, scale: 0.5, opacity: 0, duration: 0.8, ease: 'back.out(1.5)' }, 0.45).from(
        '.pb-open__cta',
        { y: 14, opacity: 0, duration: 0.4 },
        '>-0.2'
      );
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="gift-stage gift-center">
      <div className="pb-open">
        <div className="pb-open__scene">
          {CLIPPINGS.map((i) => (
            <span key={i} className="pb-clip" aria-hidden="true">
              <svg width="42" height="30" viewBox="0 0 42 30">
                <rect className="pb-clip__paper" width="42" height="30" rx="2" />
                <path className="pb-clip__line" d="M5 8h32M5 14h26M5 20h30" />
              </svg>
            </span>
          ))}

          <div className="pb-media">
            {media ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={media} alt="" />
            ) : (
              <Mascot mood="happy" />
            )}
          </div>

          <div className="pb-open__box" aria-hidden="true">
            <span className="pb-open__base" />
            <span className="pb-open__lid" />
          </div>
        </div>

        <h1 className="gift-success">{title}</h1>
        <div className="pb-open__cta">
          <button type="button" className="gift-btn gift-btn--yes" onClick={onRead}>
            {cta}
          </button>
          <button type="button" className="gift-btn gift-btn--ghost" onClick={onRestart}>
            {restart}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Player ───────────────────────────────────────────────────────── */

export function PuzzleBoxPlayer({ data }: GiftPlayerProps) {
  const t = useTranslations('gift.puzzlePlayer');
  const tp = useTranslations('gift.player');
  const locale = useLocale();
  const rootRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>('loading');
  const [run, setRun] = useState(0);
  const [muted, setMuted] = useState(false);
  const [soundUnlocked, setSoundUnlocked] = useState(false);

  const recipient = (data.recipient_name || '').trim();
  const sender = (data.sender_name || '').trim();
  const theme = data.theme || 'rose';
  const puzzlePhoto = (data.puzzle_photo || '').trim();
  const revealMedia = (data.reveal_photo || '').trim();
  const letterPhotos = useMemo(
    () => (data.letter_photos || '').split('\n').map((u) => u.trim()).filter(Boolean),
    [data.letter_photos]
  );
  const ytId = youtubeId((data.youtube_url || '').trim());
  const songFile = (data.song_file || '').trim();
  const fallbackSongUrl = !ytId && !songFile ? (data.youtube_url || '').trim() : '';
  const showVinyl = Boolean(ytId) || Boolean(songFile) || Boolean(fallbackSongUrl);
  const days = daysUntil(data.meet_date || '');
  const forYou = recipient ? tp('forYou', { name: recipient }) : tp('forYouAnon');

  const toggleMute = () => {
    giftSound.setMuted(!muted);
    setMuted(!muted);
    if (muted) giftSound.click();
  };

  const onSolved = () => {
    setStage('reveal');
    if (rootRef.current) burstConfetti(rootRef.current);
  };

  const onRestart = () => {
    giftSound.click();
    setRun((r) => r + 1);
    setStage('loading');
  };

  return (
    <div ref={rootRef} className="gift-root" data-gift-theme={theme}>
      <button
        type="button"
        className="gift-mute"
        onClick={toggleMute}
        aria-label={muted ? tp('soundOn') : tp('soundOff')}
        aria-pressed={muted}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M2 6 L5 6 L9 2.5 L9 13.5 L5 10 L2 10 Z" fill="currentColor" />
          {muted ? (
            <path d="M11 5.5 L14.5 10.5 M14.5 5.5 L11 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          ) : (
            <path d="M11.5 5.5 Q13.5 8 11.5 10.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {stage === 'loading' && (
        <DeliveryLoader
          key={`load-${run}`}
          wordmark={t('wordmark')}
          caption={t('loading')}
          onDone={() => setStage('box')}
        />
      )}

      {stage === 'box' && (
        <FallingBox
          key={`box-${run}`}
          eyebrow={forYou}
          from={sender ? tp('fromLabel', { name: sender }) : ''}
          hint={t('boxHint')}
          tagPhoto={puzzlePhoto}
          onOpen={() => {
            setSoundUnlocked(true);
            giftSound.click();
            setStage('puzzle');
          }}
        />
      )}

      {stage === 'puzzle' && (
        <div className="gift-stage gift-center">
          <div className="pb-puzzle gift-enter">
            <p className="gift-eyebrow">{t('puzzleTitle')}</p>
            <GiftPuzzle
              key={`puz-${run}`}
              photo={puzzlePhoto}
              hint={t('puzzleHint')}
              progress={(n) => t('puzzleProgress', { n, total: 5 })}
              pieceLabel={(n) => t('pieceLabel', { n })}
              onSolved={onSolved}
            />
          </div>
        </div>
      )}

      {stage === 'reveal' && (
        <BoxOpening
          key={`open-${run}`}
          media={revealMedia}
          title={data.reveal_text || t('revealTitle')}
          cta={t('openLetter')}
          restart={t('restart')}
          onRead={() => {
            giftSound.click();
            setStage('letter');
          }}
          onRestart={onRestart}
        />
      )}

      {stage === 'letter' && (
        <div className="gift-stage gift-stage--letter">
          <div className="gift-letter-col pb-letter-col gift-enter">
            <GiftLetter
              style={data.letter_style || 'crumple'}
              front={data.letter_front || 'classic'}
              stampKind={data.stamp || 'love'}
              stickerSet={data.sticker_set || 'hearts'}
              coverTitle={forYou}
              coverHint={tp('coverHint')}
              greeting={recipient ? tp('letterGreeting', { name: recipient }) : tp('letterGreetingAnon')}
              body={data.letter || ''}
              signed={sender}
              photos={letterPhotos}
              song={
                showVinyl
                  ? {
                      photo: letterPhotos[0] || revealMedia,
                      playUrl: fallbackSongUrl || undefined,
                      playLabel: tp('playSong'),
                    }
                  : null
              }
              labels={{
                flipToBack: tp('flipToBack'),
                flipToFront: tp('flipToFront'),
                close: tp('closeLetter'),
              }}
              onClose={() => setStage('reveal')}
            />

            <GiftSongPlayer
              ytId={ytId}
              audioUrl={songFile}
              playUrl={ytId ? `https://youtu.be/${ytId}` : fallbackSongUrl || undefined}
              unmute={soundUnlocked}
              muted={muted}
            />

            {days !== null && days >= 0 && (
              <p className="gift-countdown">{days === 0 ? tp('meetToday') : tp('daysToGo', { n: days })}</p>
            )}

            <div className="pb-endcap">
              <button type="button" className="gift-btn gift-btn--yes" onClick={onRestart}>
                {t('restart')}
              </button>
            </div>

            <div className="gift-footer">
              <a href={`/${locale}/gift`} onClick={() => giftSound.click()}>
                {tp('replyCta')}
              </a>
              <span className="gift-footer__brand">{t('wordmark')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
