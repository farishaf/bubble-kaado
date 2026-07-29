'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { GiftPlayerProps } from '@/lib/gift/types';
import { giftSound } from '@/lib/gift/sound';
import { burstConfetti } from './confetti';
import { GiftEnvelope } from './envelope';
import { GiftLetter, LetterCover, Vinyl } from './letter';
import { Mascot } from './mascot';
import { BlossomScatter } from './motifs';

type Stage = 'intro' | 'ask' | 'yay' | 'envelope' | 'letter';

/** Mascot has 6 drawn moods; the count keeps climbing past this, the face doesn't. */
const MAX_MOOD = 5;

function daysUntil(iso: string): number | null {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

/** "1:30" → 90, "45" → 45, anything else → undefined */
function parseTime(v: string): number | undefined {
  const t = v.trim();
  if (!t) return undefined;
  const m = t.match(/^(?:(\d+):)?(\d{1,4})$/);
  if (!m) return undefined;
  const s = Number(m[1] ?? 0) * 60 + Number(m[2]);
  return Number.isFinite(s) && s >= 0 ? s : undefined;
}

/* ── Uploaded-MP3 bar ───────────────────────────────────────────────── */

function Mp3Bar({
  src,
  start,
  end,
  title,
  artist,
  photo,
  labels,
}: {
  src: string;
  start?: number;
  end?: number;
  title?: string;
  artist?: string;
  photo?: string;
  labels: { play: string; pause: string };
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const seekToStart = () => {
      if (start !== undefined) el.currentTime = start;
    };
    // Stop at the trim point rather than running to the end of the file.
    const onTime = () => {
      if (end !== undefined && el.currentTime >= end) el.pause();
    };
    el.addEventListener('loadedmetadata', seekToStart);
    el.addEventListener('timeupdate', onTime);
    // ponytail: autoplay is best-effort — a browser with no prior gesture
    // vetoes it and the recipient just taps play.
    void el.play().catch(() => {});
    return () => {
      el.removeEventListener('loadedmetadata', seekToStart);
      el.removeEventListener('timeupdate', onTime);
    };
  }, [src, start, end]);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
    } else {
      if (start !== undefined && (end === undefined || el.currentTime >= end)) el.currentTime = start;
      void el.play().catch(() => {});
    }
  };

  return (
    <div className="gift-audiobar" data-playing={playing}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <Vinyl size={54} photo={photo} clipId="gift-vinyl-label-audio" />
      <div className="gift-audiobar__meta">
        {title && <p className="gift-audiobar__title">{title}</p>}
        {artist && <p className="gift-audiobar__artist">{artist}</p>}
      </div>
      <button type="button" className="gift-audiobar__btn" onClick={toggle} aria-label={playing ? labels.pause : labels.play}>
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          {playing ? (
            <path d="M3 2 H5.5 V12 H3 Z M8.5 2 H11 V12 H8.5 Z" fill="currentColor" />
          ) : (
            <path d="M3.5 2 L12 7 L3.5 12 Z" fill="currentColor" />
          )}
        </svg>
      </button>
    </div>
  );
}

function PlusMark() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M6 1 V11 M1 6 H11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** Mouth curve sours a little more with each failed attempt — smile to pleading frown. */
const NO_FACE_MOUTHS = ['M4 9 Q7 11 10 9', 'M4 9.5 H10', 'M4 10 Q7 8 10 10', 'M4 10.5 Q7 7 10 10.5'];

function NoFace({ stage }: { stage: 0 | 1 | 2 | 3 }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <circle cx="3.5" cy="5.5" r="1" fill="currentColor" />
      <circle cx="10.5" cy="5.5" r="1" fill="currentColor" />
      <path d={NO_FACE_MOUTHS[stage]} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* ── Intro parcel ───────────────────────────────────────────────────── */

function Parcel({ opening, label, onOpen }: { opening: boolean; label: string; onOpen: () => void }) {
  return (
    <button
      type="button"
      className={`gift-box ${opening ? 'is-opening' : ''}`}
      onClick={onOpen}
      aria-label={label}
    >
      <svg width="180" height="150" viewBox="0 0 180 150">
        <ellipse className="gift-parcel__shadow" cx="90" cy="142" rx="52" ry="5" />
        {/* box */}
        <rect className="gift-parcel__body" x="32" y="42" width="116" height="94" rx="4" />
        <rect className="gift-parcel__side" x="32" y="42" width="10" height="94" rx="2" />
        {/* washi tape: vertical + corner pieces */}
        <rect className="gift-parcel__tape" x="82" y="28" width="16" height="108" />
        <rect className="gift-parcel__tape-lite" x="24" y="52" width="30" height="11" transform="rotate(-24 39 57)" />
        <rect className="gift-parcel__tape-lite" x="128" y="118" width="30" height="11" transform="rotate(-24 143 123)" />
        {/* lid flap */}
        <g className="gift-parcel__flap">
          <rect className="gift-parcel__side" x="28" y="28" width="124" height="18" rx="3" />
          <rect className="gift-parcel__tape" x="82" y="26" width="16" height="22" />
        </g>
        {/* address label */}
        <rect className="gift-parcel__label" x="46" y="86" width="56" height="34" rx="2" />
        <path className="gift-parcel__ink" d="M53 96 H95 M53 104 H88 M53 112 H78" />
        {/* mini stamp, top-right */}
        <g transform="rotate(4 129 66)">
          <rect x="114" y="52" width="30" height="36" fill="var(--gift-card)" />
          <rect x="117" y="55" width="24" height="30" fill="none" stroke="var(--gift-accent)" strokeWidth="1.4" strokeDasharray="2.5 2" />
          <circle cx="129" cy="68" r="6.5" fill="var(--gift-accent)" />
          <path className="gift-parcel__ink" d="M121 79 H137" />
        </g>
      </svg>
    </button>
  );
}

export function YesNoPlayer({ data }: GiftPlayerProps) {
  const t = useTranslations('gift.player');
  const locale = useLocale();
  const rootRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>('intro');
  const [opening, setOpening] = useState(false);
  const [noCount, setNoCount] = useState(0);
  const [muted, setMuted] = useState(false);

  const recipient = (data.recipient_name || '').trim();
  const sender = (data.sender_name || '').trim();
  const theme = data.theme || 'rose';
  const noLines = useMemo(
    () => (data.no_lines || '').split('\n').map((l) => l.trim()).filter(Boolean),
    [data.no_lines]
  );
  // The button never surrenders, so the lines loop instead of running out.
  const plea = noCount > 0 && noLines.length > 0 ? noLines[(noCount - 1) % noLines.length] : '';
  const days = daysUntil(data.meet_date || '');
  const photos = useMemo(
    () => (data.photos || '').split('\n').map((u) => u.trim()).filter(Boolean),
    [data.photos]
  );
  const source = (data.song_source || 'youtube') === 'mp3' ? 'mp3' : 'youtube';
  const mp3Url = source === 'mp3' ? (data.mp3_url || '').trim() : '';
  const ytId = source === 'youtube' ? youtubeId((data.youtube_url || '').trim()) : null;
  const trim = (data.trim_song || '') === '1';
  const ytStart = trim ? parseTime(data.yt_start || '') : undefined;
  const ytEnd = trim ? parseTime(data.yt_end || '') : undefined;
  const fallbackSongUrl = source === 'youtube' && !ytId ? (data.youtube_url || '').trim() : '';
  const lyrics = useMemo(
    () => (data.lyrics || '').split('\n').map((l) => l.trim()).filter(Boolean),
    [data.lyrics]
  );
  const showVinyl =
    Boolean((data.song_title || '').trim() || (data.song_artist || '').trim()) ||
    lyrics.length > 0 ||
    Boolean(fallbackSongUrl);
  const hasEmbeds = Boolean(ytId) || Boolean(mp3Url);

  const ytSrc = useMemo(() => {
    if (!ytId) return '';
    const q = new URLSearchParams({
      autoplay: '1',
      playsinline: '1',
      cc_load_policy: '1',
      cc_lang_pref: locale,
    });
    if (ytStart !== undefined) q.set('start', String(ytStart));
    if (ytEnd !== undefined) q.set('end', String(ytEnd));
    return `https://www.youtube-nocookie.com/embed/${ytId}?${q.toString()}`;
  }, [ytId, ytStart, ytEnd, locale]);

  const toggleMute = () => {
    giftSound.setMuted(!muted);
    setMuted(!muted);
    if (muted) giftSound.click();
  };

  const onOpen = () => {
    if (opening) return;
    giftSound.open();
    setOpening(true);
    setTimeout(() => setStage('ask'), 620);
  };

  // The button shrinks in place rather than dodging — still intercepted on
  // pointerenter/pointerdown (before a real click lands), so "never pressable"
  // still holds even though it no longer needs to outrun the cursor.
  const onNo = () => {
    giftSound.no(noCount + 1);
    setNoCount((c) => c + 1);
  };

  const onYes = () => {
    giftSound.yes();
    setStage('yay');
  };

  const onReadLetter = () => {
    giftSound.click();
    setStage('envelope');
  };

  const photo = photos[0] || '';
  // Capped so a stubborn recipient can't grow the button out of the panel.
  const yesScale = Math.min(1 + noCount * 0.09, 1.6);
  const noScale = 1 - noCount * 0.13;
  const noFaceStage = Math.min(noCount, 3) as 0 | 1 | 2 | 3;
  // Once it's shrunk past a fair target size, it's gone — matches the promise
  // in the template copy: "sampai tersisa satu jawaban" (until one answer remains).
  const noButtonVisible = noScale > 0.18;

  return (
    <div ref={rootRef} className="gift-root" data-gift-theme={theme}>
      <button
        type="button"
        className="gift-mute"
        onClick={toggleMute}
        aria-label={muted ? t('soundOn') : t('soundOff')}
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

      {stage === 'intro' && (
        <div className="gift-stage">
          <div className="gift-panel gift-enter">
            <div className="gift-panel__band">
              <BlossomScatter />
              <PlusMark />
            </div>
            <div className="gift-panel__body">
              <span className="gift-panel__corner" aria-hidden="true" />
              <p className="gift-eyebrow">
                {recipient ? t('forYou', { name: recipient }) : t('forYouAnon')}
              </p>
              {sender && <p className="gift-from">{t('fromLabel', { name: sender })}</p>}
              <Parcel opening={opening} label={t('open')} onOpen={onOpen} />
              <p className="gift-env__hint">{t('open')}</p>
            </div>
            <div className="gift-panel__foot">
              <span className="kd-shima h-1.5 flex-1" aria-hidden="true" />
            </div>
          </div>
        </div>
      )}

      {stage === 'ask' && (
        <div className="gift-stage">
          <div className="gift-panel gift-panel--bare gift-enter">
            <div className="gift-panel__body">
              <span className="gift-panel__corner" aria-hidden="true" />
              <div key={noCount} className={noCount > 0 ? 'gift-photo--wobble' : ''}>
                <span className="gift-mascot-frame kd-stamp-edge">
                  <Mascot mood={Math.min(noCount, MAX_MOOD) as 0 | 1 | 2 | 3 | 4 | 5} />
                </span>
              </div>
              <h1 className="gift-question">{data.question || ''}</h1>
              <p className="gift-plea" aria-live="polite">{plea}</p>
              <div className="gift-actions">
                <button
                  type="button"
                  className="gift-btn gift-btn--yes"
                  style={{ transform: `scale(${yesScale})` }}
                  onClick={onYes}
                >
                  {data.yes_label || t('yesFallback')}
                </button>
                {noButtonVisible && (
                  <button
                    type="button"
                    aria-disabled="true"
                    className="gift-btn gift-btn--no gift-btn--shrink"
                    style={{ transform: `scale(${noScale})` }}
                    onPointerEnter={onNo}
                    onPointerDown={(e) => {
                      // Touch has no hover, so the tap-down itself triggers the
                      // shrink — the reaction still fires, the press never lands.
                      e.preventDefault();
                      onNo();
                    }}
                    onClick={(e) => e.preventDefault()}
                  >
                    <NoFace stage={noFaceStage} />
                    {data.no_label || t('noFallback')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {stage === 'yay' && (
        <div className="gift-stage">
          <div className="gift-panel gift-enter">
            <div className="gift-panel__band">
              <BlossomScatter />
              <PlusMark />
            </div>
            <div className="gift-panel__body">
              <span className="gift-panel__corner" aria-hidden="true" />
              {photo ? (
                <span className="gift-photo-frame">
                  <img src={photo} alt="" className="gift-photo" />
                </span>
              ) : (
                <span className="gift-mascot-frame kd-stamp-edge">
                  <Mascot mood="happy" />
                </span>
              )}
              <h1 className="gift-success">{data.success_text || ''}</h1>
              <button type="button" className="gift-btn gift-btn--yes" onClick={onReadLetter}>
                {t('readLetter')}
              </button>
            </div>
            <div className="gift-panel__foot">
              <span className="kd-shima h-1.5 flex-1" aria-hidden="true" />
            </div>
          </div>
        </div>
      )}

      {stage === 'envelope' && (
        <div className="gift-stage">
          <div className="gift-enter gift-center">
            <GiftEnvelope
              color={data.envelope_color || 'cream'}
              stampKind={data.stamp_sticker || 'bloom'}
              hintClosed={t('envelopeHintClosed')}
              hintAjar={t('envelopeHintAjar')}
              cover={
                <LetterCover
                  design={data.letter_front || 'classic'}
                  title={recipient ? t('forYou', { name: recipient }) : t('forYouAnon')}
                />
              }
              // Confetti fires as the letter stage mounts, which is the same
              // beat the song starts on — one moment, not two.
              onOpened={() => {
                setStage('letter');
                if (rootRef.current) burstConfetti(rootRef.current);
              }}
            />
          </div>
        </div>
      )}

      {stage === 'letter' && (
        <div className="gift-stage gift-stage--letter">
          <div className="gift-letter-col gift-enter">
            <GiftLetter
              style={data.letter_style}
              front={data.letter_front || 'classic'}
              stampKind={data.stamp || 'love'}
              stampImage={(data.stamp_custom || '').split('\n')[0]?.trim() || undefined}
              stickerSet={data.sticker_set || 'blooms'}
              coverTitle={recipient ? t('forYou', { name: recipient }) : t('forYouAnon')}
              coverHint={t('coverHint')}
              greeting={recipient ? t('letterGreeting', { name: recipient }) : t('letterGreetingAnon')}
              body={data.letter || ''}
              signed={sender}
              photos={photos}
              song={
                showVinyl
                  ? {
                      title: (data.song_title || '').trim(),
                      artist: (data.song_artist || '').trim(),
                      photo,
                      lyrics,
                      playUrl: fallbackSongUrl || undefined,
                      playLabel: t('playSong'),
                    }
                  : null
              }
              labels={{
                flipToBack: t('flipToBack'),
                flipToFront: t('flipToFront'),
                close: t('closeLetter'),
              }}
              onClose={() => setStage('envelope')}
            />

            {hasEmbeds && (
              <div className="gift-song">
                {ytId && (
                  <div className="gift-embed">
                    <iframe
                      src={ytSrc}
                      title={data.song_title || 'YouTube'}
                      allow="autoplay; accelerometer; encrypted-media; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                )}
                {mp3Url && (
                  <Mp3Bar
                    src={mp3Url}
                    start={ytStart}
                    end={ytEnd}
                    title={(data.song_title || '').trim()}
                    artist={(data.song_artist || '').trim()}
                    photo={photo}
                    labels={{ play: t('audioPlay'), pause: t('audioPause') }}
                  />
                )}
              </div>
            )}

            {days !== null && days >= 0 && (
              <p className="gift-countdown">
                {days === 0 ? t('meetToday') : t('daysToGo', { n: days })}
              </p>
            )}

            <div className="gift-footer">
              <a href={`/${locale}/gift`} onClick={() => giftSound.click()}>
                {t('replyCta')}
              </a>
              <span className="gift-footer__brand">Kaado</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
