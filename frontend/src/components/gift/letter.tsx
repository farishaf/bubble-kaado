'use client';

import { Fragment, useRef, useState } from 'react';
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

/* ── Signature stamp ─────────────────────────────────────────────── */

function Stamp({ kind }: { kind: string }) {
  if (kind === 'none') return null;
  if (kind === 'original') {
    return (
      <svg className="gift-stamp" width="80" height="80" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          {/* top arc: baseline on path, glyphs extend outward */}
          <path id="gift-stamp-arc-top" d="M15.5,50 a34.5,34.5 0 0,1 69,0" />
          {/* bottom arc drawn counter-clockwise so the text reads upright */}
          <path id="gift-stamp-arc-bottom" d="M7,50 a43,43 0 0,0 86,0" />
        </defs>
        <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="3.5" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <text fontSize="10" letterSpacing="1.5" fontWeight="600" fill="currentColor" fontFamily="var(--font-body)">
          <textPath href="#gift-stamp-arc-top" startOffset="50%" textAnchor="middle">
            · BEST QUALITY ·
          </textPath>
        </text>
        <text fontSize="10" letterSpacing="1.5" fontWeight="600" fill="currentColor" fontFamily="var(--font-body)">
          <textPath href="#gift-stamp-arc-bottom" startOffset="50%" textAnchor="middle">
            · BEST QUALITY ·
          </textPath>
        </text>
        <text
          x="50"
          y="55.5"
          textAnchor="middle"
          fontSize="16.5"
          fontWeight="800"
          letterSpacing="0.5"
          fill="currentColor"
          fontFamily="var(--font-body)"
        >
          ORIGINAL
        </text>
      </svg>
    );
  }
  return (
    <svg className="gift-stamp" width="80" height="80" viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        {/* counter-clockwise bottom arc: upright text inside the ring */}
        <path id="gift-stamp-love-arc" d="M10,50 a40,40 0 0,0 80,0" />
      </defs>
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="3.5" />
      <path
        d="M50 82 C30 66 16 54 16 38 C16 26 25 18 35 18 C41.5 18 47 21.4 50 26.6 C53 21.4 58.5 18 65 18 C75 18 84 26 84 38 C84 54 70 66 50 82 Z"
        fill="currentColor"
        transform="translate(50 39) scale(0.62) translate(-50 -50)"
      />
      <text fontSize="11" letterSpacing="2" fontWeight="700" fill="currentColor" fontFamily="var(--font-body)">
        <textPath href="#gift-stamp-love-arc" startOffset="50%" textAnchor="middle">
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
      <span className="gift-sticker gift-sticker--a" data-para="10"><Shape size={22} /></span>
      <span className="gift-sticker gift-sticker--b" data-para="12"><Shape size={16} /></span>
      <span className="gift-sticker gift-sticker--c" data-para="8"><Shape size={19} /></span>
    </>
  );
}

/* ── Vinyl disc (shared: media column, mobile strip, lyrics back) ── */

export function Vinyl({ size, photo, clipId }: { size: number; photo?: string; clipId: string }) {
  return (
    <div className="gift-vinyl" aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 96 96">
        <defs>
          <clipPath id={clipId}>
            <circle cx="48" cy="48" r="17" />
          </clipPath>
        </defs>
        <circle className="gift-vinyl__disc" cx="48" cy="48" r="46" />
        <circle className="gift-vinyl__groove" cx="48" cy="48" r="38" />
        <circle className="gift-vinyl__groove" cx="48" cy="48" r="31" />
        <circle className="gift-vinyl__groove" cx="48" cy="48" r="24" />
        {photo ? (
          <image
            href={photo}
            x="31"
            y="31"
            width="34"
            height="34"
            clipPath={`url(#${clipId})`}
            preserveAspectRatio="xMidYMid slice"
          />
        ) : (
          <circle className="gift-vinyl__label" cx="48" cy="48" r="17" />
        )}
        <circle className="gift-vinyl__hole" cx="48" cy="48" r="3" />
      </svg>
    </div>
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
  const lyricsRef = useRef<HTMLDivElement>(null);
  const paraRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const flipping = useRef(false);
  const mainRevealed = useRef(false);
  const [face, setFace] = useState<Face>('cover');
  const [typed, setTyped] = useState(false);

  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const paras = body.split('\n').filter((l) => l.trim() !== '');
  const pics = photos ?? [];
  // mobile scatter: photo i floats just before paragraph scatterAt[i]
  const scatterAt = pics.map((_, i) =>
    Math.min(Math.max(0, paras.length - 1), Math.floor((i * paras.length) / Math.max(1, pics.length)))
  );
  const hasSong = Boolean(song && (song.title || song.artist || song.lyrics.length > 0));

  const { contextSafe } = useGSAP(
    () => {
      // Book-opening reveal the first time the main face mounts: the two
      // sheets unfold from the spine like the pages of a book.
      if (face !== 'main') mainRevealed.current = false;
      if (face === 'main' && !mainRevealed.current) {
        mainRevealed.current = true;
        if (!reduced()) {
          // The spread is ONE folded sheet: it lands on the table slightly
          // tilted, then both pages flatten out from the center crease while
          // the fold shadow settles. Photos/polaroids stagger in last.
          const spread = rootRef.current?.querySelector<HTMLElement>('.gift-spread');
          const photosSheet = rootRef.current?.querySelector<HTMLElement>('.gift-sheet--photos');
          const textSheet = rootRef.current?.querySelector<HTMLElement>('.gift-sheet--text');
          const frames = gsap.utils.toArray<HTMLElement>('.gift-frame, .gift-scatter', rootRef.current);
          const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
          if (spread) {
            gsap.set(spread, { transformPerspective: 1600, rotateX: 8, y: 24, scale: 0.97, opacity: 0 });
            if (photosSheet) gsap.set(photosSheet, { transformOrigin: '100% 50%', rotateY: 26 });
            if (textSheet) gsap.set(textSheet, { transformOrigin: '0% 50%', rotateY: -26 });
            tl.addLabel('land')
              .to(spread, { opacity: 1, y: 0, duration: 0.45 }, 'land')
              .to(spread, { rotateX: 0, scale: 1, duration: 0.9 }, 'land')
              .addLabel('flatten', 'land+=0.12');
            if (photosSheet) tl.to(photosSheet, { rotateY: 0, duration: 0.9 }, 'flatten');
            if (textSheet) tl.to(textSheet, { rotateY: 0, duration: 0.9 }, 'flatten+=0.08');
          }
          gsap.set(frames, { opacity: 0, scale: 0.92 });
          tl.to(frames, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.08 }, '-=0.4');
        }
      }

      // Typewriter across the paragraphs on the main face.
      if (face === 'main') {
        const spans = paraRefs.current.filter((s): s is HTMLSpanElement => Boolean(s));
        if (!typed && spans.length > 0) {
          if (reduced()) {
            spans.forEach((el, i) => (el.textContent = paras[i] ?? ''));
            setTyped(true);
          } else {
            const tl = gsap.timeline({ delay: 0.35, onComplete: () => setTyped(true) });
            spans.forEach((el, i) => {
              const text = paras[i] ?? '';
              const proxy = { n: 0 };
              tl.to(proxy, {
                n: text.length,
                duration: Math.min(0.4 + text.length * 0.028, 4),
                ease: 'none',
                snap: { n: 1 },
                onUpdate() {
                  el.textContent = text.slice(0, proxy.n);
                },
                onComplete() {
                  el.textContent = text;
                },
              });
            });
          }
        } else {
          spans.forEach((el, i) => (el.textContent = paras[i] ?? ''));
        }
      }

      // Pointer parallax on the open letter: layers tagged data-para drift at
      // different rates. Desktop pointers only; reduced-motion opts out.
      if (face === 'main' && !reduced() && window.matchMedia('(pointer: fine)').matches) {
        const layers = gsap.utils.toArray<HTMLElement>('[data-para]', rootRef.current);
        const setters = layers.map((el) => ({
          fx: gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power2.out' }),
          fy: gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power2.out' }),
          f: Number(el.dataset.para) || 4,
        }));
        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          for (const s of setters) {
            s.fx(nx * s.f);
            s.fy(ny * s.f);
          }
        };
        window.addEventListener('pointermove', onMove);
        return () => window.removeEventListener('pointermove', onMove);
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
            {/* mobile: vinyl strip pinned above the message */}
            {hasSong && (
              <div className="gift-vinyl-strip" data-para="7">
                <Vinyl size={56} photo={song?.photo} clipId="gift-vinyl-label-strip" />
                <div className="gift-vinyl-strip__meta">
                  {song?.title && <p className="gift-vinyl-strip__title">{song.title}</p>}
                  {song?.artist && <p className="gift-vinyl-strip__artist">{song.artist}</p>}
                </div>
              </div>
            )}
            <div className="gift-spread" data-para="4">
              {(pics.length > 0 || hasSong) && (
                <div className="gift-sheet gift-sheet--photos">
                  <div className="gift-media">
                    {pics.length > 0 && (
                      <div className="gift-media__grid" data-count={pics.length}>
                        {pics.map((src, i) => (
                          <figure key={i} className="gift-frame kd-stamp-edge">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt="" />
                          </figure>
                        ))}
                      </div>
                    )}
                    {hasSong && (
                      <div className="gift-media__vinyl" data-para="9">
                        <Vinyl size={110} photo={song?.photo} clipId="gift-vinyl-label-media" />
                        {(song?.title || song?.artist) && (
                          <p className="gift-media__song">
                            {song?.title && <strong>{song.title}</strong>}
                            {song?.artist}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className={`gift-sheet gift-sheet--text gift-sheet--${variant}`}>
                <p className="gift-letter__text">{greeting}</p>
                <div className="gift-letter__body" aria-label={body}>
                  {paras.map((_, i) => (
                    <Fragment key={i}>
                      {pics.map((src, p) =>
                        scatterAt[p] === i ? (
                          <figure
                            key={p}
                            aria-hidden="true"
                            className={`gift-scatter ${p % 2 === 0 ? 'gift-scatter--l' : 'gift-scatter--r'}`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt="" />
                          </figure>
                        ) : null
                      )}
                      <p className="gift-letter__text gift-letter__para" aria-hidden="true">
                        <span ref={(el) => { paraRefs.current[i] = el; }} />
                        {!typed && i === paras.length - 1 && <span className="gift-letter__caret" aria-hidden="true" />}
                      </p>
                    </Fragment>
                  ))}
                </div>
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
            <div className="gift-vinyl--big">
              <Vinyl size={150} photo={song.photo} clipId="gift-vinyl-label-back" />
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
