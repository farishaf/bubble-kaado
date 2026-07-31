'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/context';
import { useToast } from '@/lib/ui/toast';
import { Spinner } from '@/lib/ui/spinner';
import { uploadAsset, removeAsset, assetPathFromUrl } from '@/lib/supabase/storage';

const MAX_BYTES = 12 * 1024 * 1024;

// An mp3 arrives as audio/mpeg (occasionally audio/mp3, or blank on some
// browsers) — accept by type when there is one, otherwise by extension.
const AUDIO_EXT = ['mp3', 'm4a', 'aac', 'ogg', 'wav'];

function isAudio(file: File): boolean {
  if (file.type) return file.type.startsWith('audio/');
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  return AUDIO_EXT.includes(ext);
}

type Props = {
  value: string;
  onChange: (next: string) => void;
  fieldLabel?: string;
};

export function AudioUploader({ value, onChange, fieldLabel }: Props) {
  const t = useTranslations('editor');
  const tToast = useTranslations('toast');
  const { user } = useAuth();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPick = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!user) {
      toast.show(tToast('signInToUpload'), { variant: 'info' });
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setError(null);
    const reject = (msg: string) => {
      setError(msg);
      toast.show(msg, { variant: 'error' });
      if (inputRef.current) inputRef.current.value = '';
    };
    if (!isAudio(file)) return reject(t('uploadNotAudio'));
    if (file.size > MAX_BYTES) return reject(t('uploadAudioTooBig'));

    setUploading(true);
    try {
      const { url } = await uploadAsset(file, user.id);
      onChange(url);
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
    const path = assetPathFromUrl(value);
    if (path) {
      try { await removeAsset(path); } catch { /* ignore */ }
    }
    onChange('');
  };

  return (
    <div>
      {fieldLabel && (
        <span className="font-body text-xs text-ink-2 uppercase tracking-wider">{fieldLabel}</span>
      )}
      {value ? (
        <div className="mt-2 rounded-md border border-muted p-3">
          <audio src={value} controls preload="metadata" className="w-full" />
          <button
            type="button"
            onClick={() => void onRemove()}
            className="mt-2 font-body text-xs text-ink-2 hover:text-danger underline underline-offset-4 transition-colors"
          >
            {t('removeAudio')}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-2 w-full h-16 rounded-md border border-dashed border-muted flex flex-col items-center justify-center text-ink-2 hover:border-ink-2 hover:text-ink transition-colors disabled:opacity-60"
        >
          {uploading ? <Spinner size={18} /> : <span className="font-display text-xl leading-none">+</span>}
          <span className="mt-1 font-body text-[10px] uppercase tracking-widest">
            {uploading ? t('uploading') : t('addAudio')}
          </span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="audio/mpeg,audio/mp4,audio/aac,audio/ogg,audio/wav,.mp3,.m4a,.aac,.ogg,.wav"
        onChange={(e) => void onPick(e.target.files)}
        className="hidden"
      />
      {error && <p role="alert" className="mt-2 font-body text-xs text-danger">{error}</p>}
    </div>
  );
}
