'use client';

import { useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';

const ASPECTS: Array<{ label: string; value: number }> = [
  { label: '1:1', value: 1 },
  { label: '4:5', value: 4 / 5 },
  { label: '3:2', value: 3 / 2 },
];

async function cropToBlob(src: string, area: Area): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = 'anonymous';
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('image load failed'));
    el.src = src;
  });
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(area.width);
  canvas.height = Math.round(area.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no canvas context');
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('crop failed'))), 'image/jpeg', 0.9);
  });
}

type Props = {
  src: string;
  labels: { title: string; apply: string; cancel: string; busy: string };
  onDone: (blob: Blob) => Promise<void> | void;
  onClose: () => void;
};

export function CropModal({ src, labels, onDone, onClose }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const apply = async () => {
    if (!area || busy) return;
    setBusy(true);
    setError(false);
    try {
      const blob = await cropToBlob(src, area);
      await onDone(blob);
      onClose();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-ink/50"
      role="dialog"
      aria-modal="true"
      aria-label={labels.title}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div className="bg-paper rounded-lg shadow-3 p-4 w-full max-w-md">
        <p className="kd-kicker text-ink-2 mb-3">{labels.title}</p>
        <div className="relative h-[300px] bg-ink/90 rounded-md overflow-hidden">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, px) => setArea(px)}
          />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex gap-1" role="group" aria-label="aspect">
            {ASPECTS.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() => setAspect(a.value)}
                aria-pressed={aspect === a.value}
                className={`px-2.5 h-7 font-body text-xs rounded-sm border transition-colors ${
                  aspect === a.value
                    ? 'bg-kd-forest text-kd-cream border-kd-forest'
                    : 'border-muted text-ink-2 hover:text-ink'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="zoom"
            className="flex-1 accent-kd-coral"
          />
        </div>
        {error && <p role="alert" className="mt-2 font-body text-xs text-danger">✕</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-4 h-9 font-body text-xs uppercase tracking-wider rounded-sm border border-muted text-ink-2 hover:text-ink transition-colors disabled:opacity-50"
          >
            {labels.cancel}
          </button>
          <button
            type="button"
            onClick={() => void apply()}
            disabled={busy || !area}
            className="px-4 h-9 font-body text-xs uppercase tracking-wider rounded-sm bg-kd-coral text-kd-cream hover:brightness-105 transition-all disabled:opacity-50"
          >
            {busy ? labels.busy : labels.apply}
          </button>
        </div>
      </div>
    </div>
  );
}
