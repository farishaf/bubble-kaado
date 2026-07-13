'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/context';
import { useToast } from '@/lib/ui/toast';
import { Spinner } from '@/lib/ui/spinner';
import { uploadImage, removeImage, imagePathFromUrl } from '@/lib/supabase/storage';

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  maxItems?: number;
  fieldLabel?: string;
  /** caption per slot index telling where that photo will appear */
  slotHints?: string[];
};

export function PhotoUploader({ value, onChange, maxItems = 12, fieldLabel, slotHints }: Props) {
  const t = useTranslations('editor');
  const tToast = useTranslations('toast');
  const { user } = useAuth();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = Math.max(0, maxItems - value.length);

  const onPick = async (files: FileList | null) => {
    if (!files) return;
    if (!user) {
      toast.show(tToast('signInToUpload'), { variant: 'info' });
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const incoming = Array.from(files).slice(0, remaining);
      const results: string[] = [];
      let lastError: string | null = null;
      for (const file of incoming) {
        if (!file.type.startsWith('image/')) {
          lastError = t('uploadNotImage');
          continue;
        }
        if (file.size > 8 * 1024 * 1024) {
          lastError = t('uploadTooBig');
          continue;
        }
        try {
          const { url } = await uploadImage(file, user.id);
          results.push(url);
        } catch (e) {
          lastError = e instanceof Error ? e.message : t('uploadFailed');
        }
      }
      if (results.length) {
        onChange([...value, ...results]);
        toast.show(
          results.length === 1 ? tToast('uploaded') : tToast('uploadedMany', { n: results.length }),
          { variant: 'success' }
        );
      }
      if (lastError) {
        setError(lastError);
        if (results.length === 0) {
          toast.show(lastError, { variant: 'error' });
        }
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const onRemove = async (idx: number) => {
    const url = value[idx];
    const path = imagePathFromUrl(url);
    if (path) {
      try { await removeImage(path); } catch { /* ignore */ }
    }
    onChange(value.filter((_, i) => i !== idx));
  };

  const onMove = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next);
  };

  return (
    <div>
      {fieldLabel && (
        <span className="font-body text-xs text-ink-2 uppercase tracking-wider">{fieldLabel}</span>
      )}
      <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
        {value.map((url, i) => (
          <div key={i}>
            <div className="relative aspect-square rounded-md overflow-hidden border border-muted-2 group">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <span
                aria-hidden
                className="absolute top-1 left-1 w-5 h-5 rounded-full bg-ink/80 text-paper text-[10px] font-body flex items-center justify-center"
              >
                {i + 1}
              </span>
              <button
                type="button"
                onClick={() => void onRemove(i)}
                aria-label={t('removePhoto')}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-ink/80 text-paper text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
              {value.length > 1 && (
                <div className="absolute bottom-1 inset-x-1 flex justify-between">
                  <button
                    type="button"
                    onClick={() => onMove(i, -1)}
                    disabled={i === 0}
                    aria-label={t('movePhotoLeft')}
                    className="w-6 h-6 rounded-full bg-ink/80 text-paper text-xs flex items-center justify-center disabled:opacity-30"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(i, 1)}
                    disabled={i === value.length - 1}
                    aria-label={t('movePhotoRight')}
                    className="w-6 h-6 rounded-full bg-ink/80 text-paper text-xs flex items-center justify-center disabled:opacity-30"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
            {slotHints?.[i] && (
              <p className="mt-1 font-body text-[10px] leading-tight text-ink-3">{slotHints[i]}</p>
            )}
          </div>
        ))}
        {remaining > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-md border border-dashed border-muted flex flex-col items-center justify-center text-ink-2 hover:border-ink-2 hover:text-ink transition-colors disabled:opacity-60"
          >
            {uploading ? <Spinner size={18} /> : <span className="font-display text-2xl leading-none">+</span>}
            <span className="mt-1 font-body text-[10px] uppercase tracking-widest">
              {uploading ? t('uploading') : t('addPhoto')}
            </span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => void onPick(e.target.files)}
        className="hidden"
      />
      {error && (
        <p role="alert" className="mt-2 font-body text-xs text-danger">{error}</p>
      )}
    </div>
  );
}