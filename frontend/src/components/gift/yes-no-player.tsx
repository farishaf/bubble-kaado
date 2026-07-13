'use client';

import { useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { GiftPlayerProps } from '@/lib/gift/types';
import { giftSound } from '@/lib/gift/sound';
import { burstConfetti } from './confetti';
import { GiftEnvelope } from './envelope';
import { GiftLetter, LetterCover } from './letter';
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

function spotifyEmbedUrl(url: string): string | null {
  const m = url.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(track|album|playlist|episode)\/([A-Za-z0-9]+)/i);
  return m ? `https://open.spotify.com/embed/${m[1].toLowerCase()}/${m[2]}` : null;
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
  const spEmbed = spotifyEmbedUrl((data.spotify_url || '').trim());
  const fallbackSongUrl =
    !ytId && !spEmbed ? (data.youtube_url || data.spotify_url || '').trim() : '';
  const lyrics = useMemo(
    () => (data.lyrics || '').split('\n').map((l) => l.trim()).filter(Boolean),
    [data.lyrics]
  );
  const showVinyl =
    Boolean((data.song_title || '').trim() || (data.song_artist || '').trim()) ||
    lyrics.length > 0 ||
    Boolean(fallbackSongUrl);
  const hasEmbeds = Boolean(ytId) || Boolean(spEmbed);

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
    giftSound.no(noCount + 1);
    setNoCount((c) => Math.min(c + 1, MAX_NO));
    setNoJump({ x: (Math.random() - 0.5) * 72, y: (Math.random() - 0.5) * 40 });
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
  const noScale = Math.max(0.3, 1 - noCount * 0.15);

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
          <div className="gift-enter gift-center">
            <p className="gift-eyebrow">
              {recipient ? t('forYou', { name: recipient }) : t('forYouAnon')}
            </p>
            {sender && <p className="gift-from">{t('fromLabel', { name: sender })}</p>}
            <div className={`gift-box ${opening ? 'is-opening' : ''}`} aria-hidden="true">
              <svg width="150" height="150" viewBox="0 0 120 120">
                <ellipse className="gift-mascot__shadow" cx="60" cy="112" rx="36" ry="5" />
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
            <button type="button" className="gift-btn gift-btn--yes" onClick={onOpen}>
              {t('open')}
            </button>
          </div>
        </div>
      )}

      {stage === 'ask' && (
        <div className="gift-stage">
          <div className="gift-card gift-enter">
            {photo ? (
              <img
                key={noCount}
                src={photo}
                alt=""
                className={`gift-photo ${noCount > 0 ? 'gift-photo--wobble' : ''}`}
              />
            ) : (
              <div key={noCount} className={noCount > 0 ? 'gift-photo--wobble' : ''}>
                <Mascot mood={Math.min(noCount, 5) as 0 | 1 | 2 | 3 | 4 | 5} />
              </div>
            )}
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
                  className="gift-btn gift-btn--no"
                  style={{ transform: `translate(${noJump.x}px, ${noJump.y}px) scale(${noScale})` }}
                  onClick={onNo}
                >
                  {data.no_label || t('noFallback')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {stage === 'yay' && (
        <div className="gift-stage">
          <div className="gift-card gift-enter">
            {photo ? <img src={photo} alt="" className="gift-photo" /> : <Mascot mood="happy" />}
            <h1 className="gift-success">{data.success_text || ''}</h1>
            <button type="button" className="gift-btn gift-btn--yes" onClick={onReadLetter}>
              {t('readLetter')}
            </button>
          </div>
        </div>
      )}

      {stage === 'envelope' && (
        <div className="gift-stage">
          <div className="gift-enter gift-center">
            <GiftEnvelope
              color={data.envelope_color || 'cream'}
              toLabel={recipient ? t('forYou', { name: recipient }) : t('forYouAnon')}
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
                {ytId && (
                  <div className="gift-embed">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${ytId}`}
                      title={data.song_title || 'YouTube'}
                      allow="accelerometer; encrypted-media; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                )}
                {spEmbed && (
                  <iframe
                    className="gift-embed--spotify"
                    src={spEmbed}
                    title={data.song_title || 'Spotify'}
                    allow="encrypted-media"
                    loading="lazy"
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
