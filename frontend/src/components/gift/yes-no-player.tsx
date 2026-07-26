'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { GiftPlayerProps } from '@/lib/gift/types';
import { giftSound } from '@/lib/gift/sound';
import { burstConfetti } from './confetti';
import { GiftEnvelope } from './envelope';
import { GiftLetter, LetterCover, Vinyl } from './letter';
import { Mascot } from './mascot';

type Stage = 'intro' | 'ask' | 'yay' | 'envelope' | 'letter';

const MAX_NO = 5;

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

function spotifyUri(url: string): string | null {
  const m = url.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(track|album|playlist|episode)\/([A-Za-z0-9]+)/i);
  return m ? `spotify:${m[1].toLowerCase()}:${m[2]}` : null;
}

type SpotifyController = {
  destroy: () => void;
  play: () => void;
  addListener: (event: string, cb: () => void) => void;
};

type SpotifyIframeApi = {
  createController: (
    el: HTMLElement,
    options: { uri: string; height?: number | string; width?: number | string },
    cb: (controller: SpotifyController) => void
  ) => void;
};

let spotifyApiPromise: Promise<SpotifyIframeApi> | null = null;

function loadSpotifyApi(): Promise<SpotifyIframeApi> {
  if (!spotifyApiPromise) {
    spotifyApiPromise = new Promise((resolve) => {
      (window as Window & { onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void }).onSpotifyIframeApiReady =
        resolve;
      const s = document.createElement('script');
      s.src = 'https://open.spotify.com/embed/iframe-api/v1';
      s.async = true;
      document.body.appendChild(s);
    });
  }
  return spotifyApiPromise;
}

function SpotifyEmbed({ uri }: { uri: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const target = document.createElement('div');
    host.appendChild(target);
    let controller: SpotifyController | null = null;
    let cancelled = false;
    void loadSpotifyApi().then((api) => {
      if (cancelled) return;
      api.createController(target, { uri, height: 152 }, (c) => {
        if (cancelled) {
          c.destroy();
          return;
        }
        controller = c;
        // ponytail: autoplay via iFrame API; the browser can still veto audio
        // without a fresh gesture — the embed then just shows its play button
        c.addListener('ready', () => c.play());
      });
    });
    return () => {
      cancelled = true;
      controller?.destroy();
      host.replaceChildren();
    };
  }, [uri]);

  return <div ref={hostRef} className="gift-embed--spotify" />;
}

/* ── YouTube audio-only ("mp3") bar via the IFrame API ─────────────── */

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  destroy: () => void;
};

type YTNamespace = {
  Player: new (
    el: HTMLElement,
    options: {
      videoId: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: () => void;
        onStateChange?: (e: { data: number }) => void;
      };
    }
  ) => YTPlayer;
  PlayerState: { PLAYING: number };
};

let ytApiPromise: Promise<YTNamespace> | null = null;

function loadYouTubeApi(): Promise<YTNamespace> {
  if (!ytApiPromise) {
    ytApiPromise = new Promise((resolve) => {
      const w = window as Window & { YT?: YTNamespace; onYouTubeIframeAPIReady?: () => void };
      if (w.YT?.Player) {
        resolve(w.YT);
        return;
      }
      w.onYouTubeIframeAPIReady = () => resolve(w.YT as YTNamespace);
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      s.async = true;
      document.body.appendChild(s);
    });
  }
  return ytApiPromise;
}

function YouTubeAudioBar({
  videoId,
  start,
  end,
  ccLang,
  title,
  artist,
  photo,
  labels,
}: {
  videoId: string;
  start?: number;
  end?: number;
  ccLang: string;
  title?: string;
  artist?: string;
  photo?: string;
  labels: { play: string; pause: string };
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const target = document.createElement('div');
    host.appendChild(target);
    let cancelled = false;
    void loadYouTubeApi().then((YT) => {
      if (cancelled) return;
      playerRef.current = new YT.Player(target, {
        videoId,
        playerVars: {
          autoplay: 1,
          playsinline: 1,
          cc_load_policy: 1,
          cc_lang_pref: ccLang,
          ...(start !== undefined ? { start } : {}),
          ...(end !== undefined ? { end } : {}),
        },
        events: {
          onStateChange: (e) => setPlaying(e.data === YT.PlayerState.PLAYING),
        },
      });
    });
    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
      host.replaceChildren();
    };
  }, [videoId, start, end, ccLang]);

  const toggle = () => {
    const p = playerRef.current;
    if (!p) return;
    if (playing) p.pauseVideo();
    else p.playVideo();
  };

  return (
    <div className="gift-audiobar" data-playing={playing}>
      <div className="gift-audiobar__host" ref={hostRef} aria-hidden="true" />
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
  const [noJump, setNoJump] = useState({ x: 0, y: 0 });
  const [muted, setMuted] = useState(false);

  const recipient = (data.recipient_name || '').trim();
  const sender = (data.sender_name || '').trim();
  const theme = data.theme || 'rose';
  const dodge = (data.no_mode || 'dodge') !== 'classic';
  const noLines = useMemo(
    () => (data.no_lines || '').split('\n').map((l) => l.trim()).filter(Boolean),
    [data.no_lines]
  );
  const plea = noCount > 0 && noLines.length > 0 ? noLines[Math.min(noCount, noLines.length) - 1] : '';
  const days = daysUntil(data.meet_date || '');
  const photos = useMemo(
    () => (data.photos || '').split('\n').map((u) => u.trim()).filter(Boolean),
    [data.photos]
  );
  const ytId = youtubeId((data.youtube_url || '').trim());
  const ytStart = parseTime(data.yt_start || '');
  const ytEnd = parseTime(data.yt_end || '');
  const audioOnly = (data.song_mode || 'video') === 'audio';
  const spUri = spotifyUri((data.spotify_url || '').trim());
  const fallbackSongUrl =
    !ytId && !spUri ? (data.youtube_url || data.spotify_url || '').trim() : '';
  const lyrics = useMemo(
    () => (data.lyrics || '').split('\n').map((l) => l.trim()).filter(Boolean),
    [data.lyrics]
  );
  const showVinyl =
    Boolean((data.song_title || '').trim() || (data.song_artist || '').trim()) ||
    lyrics.length > 0 ||
    Boolean(fallbackSongUrl);
  const hasEmbeds = Boolean(ytId) || Boolean(spUri);

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

  const onNo = () => {
    if (noCount >= MAX_NO) return;
    giftSound.no(noCount + 1);
    setNoCount((c) => Math.min(c + 1, MAX_NO));
    setNoJump({
      x: (Math.random() - 0.5) * (dodge ? 140 : 72),
      y: (Math.random() - 0.5) * (dodge ? 70 : 40),
    });
  };

  const onYes = () => {
    giftSound.yes();
    setStage('yay');
    if (rootRef.current) burstConfetti(rootRef.current);
  };

  const onReadLetter = () => {
    giftSound.click();
    setStage('envelope');
  };

  const photo = photos[0] || '';
  const yesScale = 1 + noCount * 0.09;
  const noScale = dodge ? 1 : Math.max(0.3, 1 - noCount * 0.15);

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
              <span className="kd-kicker">{t('introKicker')}</span>
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
              <strong>Kaado</strong>
              <span>26</span>
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
                  <Mascot mood={Math.min(noCount, 5) as 0 | 1 | 2 | 3 | 4 | 5} />
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
                {noCount < MAX_NO && (
                  <button
                    type="button"
                    className={`gift-btn gift-btn--no ${dodge ? 'gift-btn--dodge' : ''}`}
                    style={{ transform: `translate(${noJump.x}px, ${noJump.y}px) scale(${noScale})` }}
                    onPointerEnter={dodge ? onNo : undefined}
                    onClick={dodge ? (e) => e.preventDefault() : onNo}
                  >
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
              <span className="kd-kicker">{t('yayKicker')}</span>
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
              <strong>Kaado</strong>
              <span>26</span>
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
              onOpened={() => setStage('letter')}
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
              stickerSet={data.sticker_set || 'hearts'}
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
                {ytId &&
                  (audioOnly ? (
                    <YouTubeAudioBar
                      videoId={ytId}
                      start={ytStart}
                      end={ytEnd}
                      ccLang={locale}
                      title={(data.song_title || '').trim()}
                      artist={(data.song_artist || '').trim()}
                      photo={photo}
                      labels={{ play: t('audioPlay'), pause: t('audioPause') }}
                    />
                  ) : (
                    <div className="gift-embed">
                      <iframe
                        src={ytSrc}
                        title={data.song_title || 'YouTube'}
                        allow="autoplay; accelerometer; encrypted-media; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  ))}
                {spUri && <SpotifyEmbed uri={spUri} />}
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
