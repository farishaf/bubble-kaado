'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/context';
import { useToast } from '@/lib/ui/toast';
import { Spinner } from '@/lib/ui/spinner';
import { uploadImage, removeImage, imagePathFromUrl } from '@/lib/supabase/storage';

type Props = {
  value: string;
  onChange: (next: string) => void;
  fieldLabel?: string;
};

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_SECONDS = 5 * 60;

/** Reads duration from metadata alone — no decode, so a 10 MB file costs nothing. */
function readDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    const done = (v: number | null) => {
      URL.revokeObjectURL(url);
      resolve(v);
    };
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => done(Number.isFinite(audio.duration) ? audio.duration : null);
    audio.onerror = () => done(null);
    audio.src = url;
  });
}

function clock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function AudioUploader({ value, onChange, fieldLabel }: Props) {
  const t = useTranslations('editor');
  const tToast = useTranslations('toast');
  const { user } = useAuth();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ name: string; duration: number | null } | null>(null);

  const onPick = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!user) {
      toast.show(tToast('signInToUpload'), { variant: 'info' });
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setError(null);
    try {
      if (!file.type.startsWith('audio/')) {
        setError(t('audioNotAudio'));
        return;
      }
      if (file.size > MAX_BYTES) {
        setError(t('audioTooBig'));
        return;
      }
      // ponytail: unreadable metadata (null) is let through rather than blocked —
      // the size cap already bounds the damage.
      const duration = await readDuration(file);
      if (duration !== null && duration > MAX_SECONDS) {
        setError(t('audioTooLong'));
        return;
      }
      setUploading(true);
      const { url } = await uploadImage(file, user.id);
      const oldPath = imagePathFromUrl(value);
      onChange(url);
      setMeta({ name: file.name, duration });
      if (oldPath) {
        try { await removeImage(oldPath); } catch { /* ignore */ }
      }
      toast.show(tToast('uploaded'), { variant: 'success' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : t('uploadFailed');
      setError(msg);
      toast.show(msg, { variant: 'error' });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const onRemove = async () => {
    const path = imagePathFromUrl(value);
    onChange('');
    setMeta(null);
    if (path) {
      try { await removeImage(path); } catch { /* ignore */ }
    }
  };

  return (
    <div>
      {fieldLabel && (
        <span className="font-body text-xs text-ink-2 uppercase tracking-wider">{fieldLabel}</span>
      )}
      {value ? (
        <div className="mt-2 flex items-center gap-3 rounded-sm border border-muted-2 bg-paper px-3 py-2.5">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="shrink-0 text-kd-forest">
            <path d="M6 12.5 V3.5 L13 2 V11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="4.5" cy="12.5" r="2" fill="currentColor" />
            <circle cx="11.5" cy="11" r="2" fill="currentColor" />
          </svg>
          <div className="min-w-0 flex-1">
            <p className="font-body text-xs text-ink truncate">{meta?.name ?? t('audioReady')}</p>
            {meta?.duration != null && (
              <p className="font-body text-[10px] text-ink-3 tabular-nums">{clock(meta.duration)}</p>
            )}
          </div>
          <audio src={value} controls preload="none" className="h-8 max-w-[168px]" />
          <button
            type="button"
            onClick={() => void onRemove()}
            aria-label={t('audioRemove')}
            className="shrink-0 w-6 h-6 rounded-full border border-muted text-ink-2 text-xs flex items-center justify-center hover:border-ink-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kd-forest transition-colors"
          >
            ×
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-2 w-full h-16 rounded-sm border border-dashed border-muted flex flex-col items-center justify-center gap-1 text-ink-2 hover:border-ink-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kd-forest disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? <Spinner size={18} /> : <span className="font-display text-2xl leading-none">+</span>}
          <span className="font-body text-[10px] uppercase tracking-widest">
            {uploading ? t('uploading') : t('audioAdd')}
          </span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="audio/mpeg,audio/mp4,audio/x-m4a,.mp3,.m4a"
        onChange={(e) => void onPick(e.target.files)}
        className="hidden"
      />
      {error && <p role="alert" className="mt-2 font-body text-xs text-danger">{error}</p>}
    </div>
  );
}
