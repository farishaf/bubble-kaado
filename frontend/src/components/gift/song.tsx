'use client';

import { useEffect, useRef, useState } from 'react';

export function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  destroy: () => void;
  getVideoData: () => { title?: string };
};

type YTApi = {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string;
      playerVars?: Record<string, number | string>;
      events?: {
        onReady?: (e: { target: YTPlayer }) => void;
        onError?: () => void;
      };
    }
  ) => YTPlayer;
};

let ytApiPromise: Promise<YTApi> | null = null;

function loadYtApi(): Promise<YTApi> {
  if (!ytApiPromise) {
    ytApiPromise = new Promise((resolve) => {
      const w = window as Window & { YT?: YTApi; onYouTubeIframeAPIReady?: () => void };
      if (w.YT?.Player) {
        resolve(w.YT);
        return;
      }
      const prev = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve(w.YT!);
      };
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      s.async = true;
      document.body.appendChild(s);
    });
  }
  return ytApiPromise;
}

/**
 * The sender's song, playing quietly in the background as a spinning vinyl —
 * never a visible video box. YouTube embeds start muted (always allowed) and
 * only unmute once `unmute` turns true from a real tap, which mobile browsers
 * require before they'll let sound through. Some videos have embedding
 * disabled by the uploader (YT error 101/150/153) — nothing we can fix from
 * here, so we just fall back to a "listen on YouTube" link.
 */
export function GiftSongPlayer({
  ytId,
  audioUrl,
  playUrl,
  unmute,
  muted,
}: {
  ytId: string | null;
  audioUrl: string;
  playUrl?: string;
  unmute: boolean;
  muted: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [errored, setErrored] = useState(false);
  const [ytReady, setYtReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [title, setTitle] = useState('');
  const wantsSound = unmute && !muted;

  useEffect(() => {
    if (!ytId) return;
    const host = hostRef.current;
    if (!host) return;
    const target = document.createElement('div');
    host.appendChild(target);
    let cancelled = false;
    void loadYtApi().then((YT) => {
      if (cancelled) return;
      playerRef.current = new YT.Player(target, {
        videoId: ytId,
        playerVars: { autoplay: 1, mute: 1, playsinline: 1, controls: 0 },
        events: {
          onReady: (e) => {
            if (cancelled) return;
            setYtReady(true);
            setTitle(e.target.getVideoData().title || '');
          },
          onError: () => setErrored(true),
        },
      });
    });
    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
      host.replaceChildren();
      setYtReady(false);
      setTitle('');
    };
  }, [ytId]);

  useEffect(() => {
    if (!ytReady) return;
    if (wantsSound) playerRef.current?.unMute();
    else playerRef.current?.mute();
    if (paused) playerRef.current?.pauseVideo();
    else playerRef.current?.playVideo();
  }, [ytReady, wantsSound, paused]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.muted = !wantsSound;
    if (paused) {
      el.pause();
    } else if (wantsSound && el.paused) {
      void el.play().catch(() => {});
    }
  }, [wantsSound, paused]);

  if (!ytId && !audioUrl) return null;

  return (
    <div className="gift-vinyl-card">
      <button
        type="button"
        className="gift-vinyl-toggle"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? 'Putar lagu' : 'Jeda lagu'}
        aria-pressed={paused}
      >
        <div className={`gift-vinyl${paused ? ' is-paused' : ''}`} aria-hidden="true">
          <svg width="72" height="72" viewBox="0 0 96 96">
            <circle className="gift-vinyl__disc" cx="48" cy="48" r="46" />
            <circle className="gift-vinyl__groove" cx="48" cy="48" r="38" />
            <circle className="gift-vinyl__groove" cx="48" cy="48" r="31" />
            <circle className="gift-vinyl__groove" cx="48" cy="48" r="24" />
            <circle className="gift-vinyl__label" cx="48" cy="48" r="17" />
            <circle className="gift-vinyl__hole" cx="48" cy="48" r="3" />
          </svg>
          <span className="gift-vinyl-toggle__icon" aria-hidden="true">
            {paused ? (
              <svg width="14" height="14" viewBox="0 0 16 16"><path d="M4 2 L14 8 L4 14 Z" fill="currentColor" /></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 16 16">
                <rect x="4" y="2" width="3" height="12" fill="currentColor" />
                <rect x="9" y="2" width="3" height="12" fill="currentColor" />
              </svg>
            )}
          </span>
        </div>
      </button>
      {title && <p className="gift-vinyl-title-text">{title}</p>}
      {errored && playUrl && (
        <a
          className="gift-btn gift-btn--small"
          href={playUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Dengerin di YouTube
        </a>
      )}
      {ytId && <div ref={hostRef} className="gift-yt-hidden" aria-hidden="true" />}
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} loop playsInline preload="auto" muted={!wantsSound} />
      )}
    </div>
  );
}
