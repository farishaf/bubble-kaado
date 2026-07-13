'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { giftSound } from '@/lib/gift/sound';

gsap.registerPlugin(useGSAP);

export type GiftLetterStyle = 'plain' | 'ruled' | 'vintage';
type Face = 'cover' | 'main' | 'back';

/* ── Front cover designs ─────────────────────────────────────────── */

function Sparkle({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 18 18" aria-hidden="true">
      <path d="M9 0 L10.8 7.2 L18 9 L10.8 10.8 L9 18 L7.2 10.8 L0 9 L7.2 7.2 Z" fill="currentColor" />
    </svg>
  );
}

function HeartShape({ className, size = 16 }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 14 C4 10.8 1 8.4 1 5.4 C1 3.2 2.8 1.6 4.8 1.6 C6.1 1.6 7.3 2.3 8 3.4 C8.7 2.3 9.9 1.6 11.2 1.6 C13.2 1.6 15 3.2 15 5.4 C15 8.4 12 10.8 8 14 Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Bloom({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <g fill="currentColor">
        <circle cx="10" cy="4.5" r="3.4" />
        <circle cx="15.5" cy="8.5" r="3.4" />
        <circle cx="13.4" cy="14.8" r="3.4" />
        <circle cx="6.6" cy="14.8" r="3.4" />
        <circle cx="4.5" cy="8.5" r="3.4" />
      </g>
      <circle cx="10" cy="10" r="2.6" fill="var(--gift-card)" />
    </svg>
  );
}

export function LetterCover({ design, title }: { design: string; title: string }) {
  const d = design === 'stars' || design === 'hearts' ? design : 'classic';
  return (
    <div className={`gift-cover gift-cover--${d}`}>
      {d === 'classic' && (
        <>
          <span className="gift-cover__frame" aria-hidden="true" />
          <Sparkle className="gift-cover__orn gift-cover__orn--tl" />
          <Sparkle className="gift-cover__orn gift-cover__orn--br" />
        </>
      )}
      {d === 'stars' && (
        <>
          <Sparkle className="gift-cover__orn gift-cover__orn--tl" />
          <Sparkle className="gift-cover__orn gift-cover__orn--tr" size={12} />
          <Sparkle className="gift-cover__orn gift-cover__orn--ml" size={12} />
          <Sparkle className="gift-cover__orn gift-cover__orn--br" />
          <Sparkle className="gift-cover__orn gift-cover__orn--bl" size={12} />
        </>
      )}
      {d === 'hearts' && (
        <>
          <HeartShape className="gift-cover__orn gift-cover__orn--tl" />
          <HeartShape className="gift-cover__orn gift-cover__orn--tr" size={12} />
          <HeartShape className="gift-cover__orn gift-cover__orn--ml" size={12} />
          <HeartShape className="gift-cover__orn gift-cover__orn--br" />
          <HeartShape className="gift-cover__orn gift-cover__orn--bl" size={12} />
        </>
      )}
      <p className="gift-cover__title">{title}</p>
      <svg className="gift-cover__flourish" width="90" height="14" viewBox="0 0 90 14" aria-hidden="true">
        <path
          d="M2 8 C 20 2, 40 12, 58 6 S 84 4, 88 7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/* ── Stamp ───────────────────────────────────────────────────────── */

function Stamp({ kind }: { kind: string }) {
  if (kind === 'none') return null;
  if (kind === 'original') {
    return (
      <svg className="gift-stamp" width="76" height="76" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <path id="gift-stamp-arc" d="M50,50 m-33,0 a33,33 0 1,1 66,0 a33,33 0 1,1 -66,0" />
        </defs>
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 4" />
        <text fontSize="11" letterSpacing="2.4" fill="currentColor" fontFamily="var(--font-body)">
          <textPath href="#gift-stamp-arc" startOffset="0%">BEST QUALITY</textPath>
          <textPath href="#gift-stamp-arc" startOffset="50%">BEST QUALITY</textPath>
        </text>
        <text
          x="50"
          y="55"
          textAnchor="middle"
          fontSize="15"
          fontWeight="700"
          letterSpacing="1.5"
          fill="currentColor"
          fontFamily="var(--font-body)"
        >
          ORIGINAL
        </text>
      </svg>
    );
  }
  return (
    <svg className="gift-stamp" width="76" height="76" viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <path id="gift-stamp-love-arc" d="M50,54 m-35,0 a35,35 0 1,1 70,0 a35,35 0 1,1 -70,0" />
      </defs>
      <path
        d="M50 82 C30 66 16 54 16 38 C16 26 25 18 35 18 C41.5 18 47 21.4 50 26.6 C53 21.4 58.5 18 65 18 C75 18 84 26 84 38 C84 54 70 66 50 82 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
      />
      <text fontSize="12" letterSpacing="2.2" fontWeight="700" fill="currentColor" fontFamily="var(--font-body)">
        <textPath href="#gift-stamp-love-arc" startOffset="25%" textAnchor="middle">
          MADE WITH LOVE
        </textPath>
      </text>
    </svg>
  );
}

/* ── Stickers ────────────────────────────────────────────────────── */

function Stickers({ set }: { set: string }) {
  if (set !== 'hearts' && set !== 'stars' && set !== 'blooms') return null;
  const Shape = set === 'hearts' ? HeartShape : set === 'stars' ? Sparkle : Bloom;
  return (
    <>
      <span className="gift-sticker gift-sticker--a"><Shape size={22} /></span>
      <span className="gift-sticker gift-sticker--b"><Shape size={16} /></span>
      <span className="gift-sticker gift-sticker--c"><Shape size={19} /></span>
    </>
  );
}

/* ── Letter ──────────────────────────────────────────────────────── */

type Song = {
  title?: string;
  artist?: string;
  photo?: string;
  lyrics: string[];
  playUrl?: string;
  playLabel?: string;
};

type Props = {
  style?: string;
  front?: string;
  stampKind?: string;
  stickerSet?: string;
  coverTitle: string;
  coverHint: string;
  greeting: string;
  body: string;
  signed?: string;
  photos?: string[];
  song?: Song | null;
  labels: { flipToBack: string; flipToFront: string; close: string };
  onClose: () => void;
};

export function GiftLetter({
  style = 'plain',
  front = 'classic',
  stampKind = 'love',
  stickerSet = 'hearts',
  coverTitle,
  coverHint,
  greeting,
  body,
  signed,
  photos,
  song,
  labels,
  onClose,
}: Props) {
  const variant: GiftLetterStyle = style === 'ruled' || style === 'vintage' ? style : 'plain';
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLSpanElement>(null);
  const lyricsRef = useRef<HTMLDivElement>(null);
  const flipping = useRef(false);
  const mainRevealed = useRef(false);
  const [face, setFace] = useState<Face>('cover');
  const [typed, setTyped] = useState(false);

  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const { contextSafe } = useGSAP(
    () => {
      // Spread reveal (photo + text sheets) the first time the main face mounts.
      if (face !== 'main') mainRevealed.current = false;
      if (face === 'main' && !mainRevealed.current) {
        mainRevealed.current = true;
        if (!reduced()) {
          const sheets = gsap.utils.toArray<HTMLElement>('.gift-sheet', rootRef.current);
          const frames = gsap.utils.toArray<HTMLElement>('.gift-frame', rootRef.current);
          gsap.set(sheets, { opacity: 0, y: 18 });
          gsap.set(frames, { opacity: 0, scale: 0.92 });
          gsap
            .timeline()
            .to(sheets, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.12 })
            .to(frames, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out', stagger: 0.08 }, '-=0.25');
        }
      }

      // Typewriter on the main face; lyric walk on the back face.
      if (face === 'main' && bodyRef.current && !typed) {
        const el = bodyRef.current;
        if (reduced()) {
          el.textContent = body;
          setTyped(true);
          return;
        }
        const proxy = { i: 0 };
        gsap.to(proxy, {
          i: body.length,
          duration: Math.min(1.2 + body.length * 0.028, 8),
          ease: 'none',
          delay: 0.35,
          snap: { i: 1 },
          onUpdate() {
            el.textContent = body.slice(0, proxy.i);
          },
          onComplete() {
            el.textContent = body;
            setTyped(true);
          },
        });
      } else if (face === 'main' && bodyRef.current) {
        bodyRef.current.textContent = body;
      }
      if (face === 'back' && lyricsRef.current && song && song.lyrics.length > 0) {
        const lines = gsap.utils.toArray<HTMLElement>('.gift-lyrics__line', lyricsRef.current);
        gsap.set(lines, { opacity: 0.35 });
        const tl = gsap.timeline({ delay: 0.5 });
        lines.forEach((line, i) => {
          tl.to(line, { opacity: 1, scale: 1.03, duration: reduced() ? 0.01 : 0.35, ease: 'power2.out' }, i * 1.4);
          tl.to(
            lyricsRef.current,
            { scrollTop: Math.max(0, line.offsetTop - 80), duration: reduced() ? 0.01 : 0.4, ease: 'power2.inOut' },
            i * 1.4
          );
          if (i > 0) tl.to(lines[i - 1], { opacity: 0.5, scale: 1, duration: 0.35 }, i * 1.4);
        });
      }
    },
    { scope: rootRef, dependencies: [face, typed] }
  );

  // eslint-disable-next-line react-hooks/refs -- contextSafe-wrapped event handler, refs read on click, not render
  const flipTo = contextSafe((next: Face) => {
    if (flipping.current || !cardRef.current) return;
    flipping.current = true;
    giftSound.click();
    const dur = reduced() ? 0.04 : 1;
    gsap
      .timeline({ onComplete: () => (flipping.current = false) })
      .to(cardRef.current, {
        rotateY: 90,
        duration: 0.26 * dur,
        ease: 'power2.in',
        onComplete: () => setFace(next),
      })
      .set(cardRef.current, { rotateY: -90 })
      .to(cardRef.current, { rotateY: 0, duration: 0.34 * dur, ease: 'power2.out' });
  });

  // eslint-disable-next-line react-hooks/refs -- contextSafe-wrapped event handler, refs read on click, not render
  const close = contextSafe(() => {
    if (flipping.current || !rootRef.current) return;
    flipping.current = true;
    giftSound.click();
    gsap.to(rootRef.current, {
      rotateX: -70,
      scale: 0.7,
      opacity: 0,
      transformOrigin: '50% 100%',
      duration: reduced() ? 0.01 : 0.45,
      ease: 'power2.in',
      onComplete: onClose,
    });
  });

  return (
    <div ref={rootRef} className="gift-letter3d">
      <div ref={cardRef} className="gift-letter3d__card">
        {face === 'cover' && (
          <button type="button" className="gift-lface gift-lface--cover" onClick={() => flipTo('main')}>
            <LetterCover design={front} title={coverTitle} />
            <span className="gift-cover__hint">{coverHint}</span>
          </button>
        )}

        {face === 'main' && (
          <div className="gift-lface gift-lface--main">
            <Stickers set={stickerSet} />
            <div className="gift-spread">
              {photos && photos.length > 0 && (
                <div className="gift-sheet gift-sheet--photos">
                  <div className="gift-sheet__grid" data-count={photos.length}>
                    {photos.map((src, i) => (
                      <figure key={i} className="gift-frame">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" />
                      </figure>
                    ))}
                  </div>
                </div>
              )}
              <div className={`gift-sheet gift-sheet--text gift-sheet--${variant}`}>
                <p className="gift-letter__text">{greeting}</p>
                <p className="gift-letter__text gift-letter__body" aria-label={body}>
                  <span ref={bodyRef} aria-hidden="true" />
                  {!typed && <span className="gift-letter__caret" aria-hidden="true" />}
                </p>
                {(signed || stampKind !== 'none') && (
                  <div className="gift-letter__sign">
                    {signed && <p className="gift-letter__text gift-letter__signed">— {signed}</p>}
                    <Stamp kind={stampKind} />
                  </div>
                )}
              </div>
            </div>
            <div className="gift-lface__actions">
              {song && (
                <button type="button" className="gift-btn gift-btn--ghost" onClick={() => flipTo('back')}>
                  {labels.flipToBack}
                </button>
              )}
              <button type="button" className="gift-btn gift-btn--ghost" onClick={close}>
                {labels.close}
              </button>
            </div>
          </div>
        )}

        {face === 'back' && song && (
          <div className="gift-lface gift-lface--back">
            <div className="gift-vinyl gift-vinyl--big" aria-hidden="true">
              <svg width="150" height="150" viewBox="0 0 96 96">
                <defs>
                  <clipPath id="gift-vinyl-label-back">
                    <circle cx="48" cy="48" r="17" />
                  </clipPath>
                </defs>
                <circle className="gift-vinyl__disc" cx="48" cy="48" r="46" />
                <circle className="gift-vinyl__groove" cx="48" cy="48" r="38" />
                <circle className="gift-vinyl__groove" cx="48" cy="48" r="31" />
                <circle className="gift-vinyl__groove" cx="48" cy="48" r="24" />
                {song.photo ? (
                  <image
                    href={song.photo}
                    x="31"
                    y="31"
                    width="34"
                    height="34"
                    clipPath="url(#gift-vinyl-label-back)"
                    preserveAspectRatio="xMidYMid slice"
                  />
                ) : (
                  <circle className="gift-vinyl__label" cx="48" cy="48" r="17" />
                )}
                <circle className="gift-vinyl__hole" cx="48" cy="48" r="3" />
              </svg>
            </div>
            {(song.title || song.artist) && (
              <p className="gift-lback__song">
                {song.title}
                {song.title && song.artist ? ' · ' : ''}
                <span>{song.artist}</span>
              </p>
            )}
            {song.lyrics.length > 0 && (
              <div ref={lyricsRef} className="gift-lyrics">
                {song.lyrics.map((line, i) => (
                  <p key={i} className="gift-lyrics__line">
                    {line}
                  </p>
                ))}
              </div>
            )}
            {song.playUrl && (
              <a
                className="gift-btn gift-btn--small"
                href={song.playUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => giftSound.click()}
              >
                {song.playLabel}
              </a>
            )}
            <div className="gift-lface__actions">
              <button type="button" className="gift-btn gift-btn--ghost" onClick={() => flipTo('main')}>
                {labels.flipToFront}
              </button>
              <button type="button" className="gift-btn gift-btn--ghost" onClick={close}>
                {labels.close}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
