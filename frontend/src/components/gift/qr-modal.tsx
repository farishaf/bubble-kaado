'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import qrcode from 'qrcode-generator';
import { useToast } from '@/lib/ui/toast';

type Props = {
  link: string;
  theme: string;
  recipientName: string;
  onClose: () => void;
};

const W = 640;
const H = 800;

export function GiftQrModal({ link, theme, recipientName, onClose }: Props) {
  const t = useTranslations('gift.editor');
  const toast = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const qr = useMemo(() => {
    try {
      const q = qrcode(0, 'L');
      q.addData(link);
      q.make();
      return q;
    } catch {
      return null;
    }
  }, [link]);
  const tooLong = qr === null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const probe = probeRef.current;
    if (!canvas || !probe || !qr) return;

    const css = getComputedStyle(probe);
    const col = (name: string) => css.getPropertyValue(name).trim();
    const bg = col('--gift-bg');
    const card = col('--gift-card');
    const soft = col('--gift-soft');
    const accent = col('--gift-accent');
    const ink = col('--gift-ink');
    const ink2 = col('--gift-ink-2');

    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 42; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.random() * Math.PI);
      ctx.fillStyle = i % 3 === 0 ? accent : soft;
      ctx.globalAlpha = 0.5 + Math.random() * 0.4;
      if (i % 2 === 0) {
        ctx.fillRect(-4, -6, 8, 12);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    const cardX = 70;
    const cardY = 140;
    const cardW = W - cardX * 2;
    const cardH = 540;
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.14)';
    ctx.shadowBlur = 32;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = card;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 28);
    ctx.fill();
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillStyle = ink;
    ctx.font = '500 24px "Plus Jakarta Sans", ui-sans-serif, sans-serif';
    const eyebrow = recipientName
      ? t('qrFor', { name: recipientName }).toUpperCase()
      : t('qrForAnon').toUpperCase();
    ctx.fillText(eyebrow, W / 2, 96);

    const count = qr.getModuleCount();
    const qSize = 400;
    const cell = qSize / count;
    const qx = (W - qSize) / 2;
    const qy = cardY + 60;
    ctx.fillStyle = ink;
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (qr.isDark(r, c)) {
          ctx.fillRect(qx + c * cell, qy + r * cell, Math.ceil(cell), Math.ceil(cell));
        }
      }
    }

    ctx.fillStyle = ink2;
    ctx.font = '400 22px "Plus Jakarta Sans", ui-sans-serif, sans-serif';
    ctx.fillText(t('qrScan'), W / 2, qy + qSize + 52);

    ctx.fillStyle = ink;
    ctx.font = '600 34px "Fraunces", ui-serif, serif';
    ctx.fillText('Kaado', W / 2, H - 56);
  }, [qr, recipientName, theme, t]);

  const onCopyImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) {
        toast.show(t('copyImageFail'), { variant: 'error' });
        return;
      }
      navigator.clipboard
        .write([new ClipboardItem({ 'image/png': blob })])
        .then(() => toast.show(t('imageCopied'), { variant: 'success' }))
        .catch(() => toast.show(t('copyImageFail'), { variant: 'error' }));
    }, 'image/png');
  };

  const onSaveImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'kaado-qr.png';
    a.click();
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-ink/40"
      role="dialog"
      aria-modal="true"
      aria-label={t('qrTitle')}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={probeRef} data-gift-theme={theme} className="hidden" />
      <div className="bg-paper rounded-lg shadow-3 p-6 w-full max-w-sm">
        <h2 className="font-display text-lg text-ink mb-4">{t('qrTitle')}</h2>
        {tooLong ? (
          <p className="font-body text-sm text-ink-2">{t('qrTooLong')}</p>
        ) : (
          <canvas
            ref={canvasRef}
            className="w-full h-auto rounded-md border border-muted-2"
            aria-label={t('qrScan')}
          />
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {!tooLong && (
            <>
              <button
                type="button"
                onClick={onCopyImage}
                className="px-4 h-9 font-body text-xs rounded-pill bg-ink text-paper hover:bg-ink-2 transition-colors"
              >
                {t('copyImage')}
              </button>
              <button
                type="button"
                onClick={onSaveImage}
                className="px-4 h-9 font-body text-xs rounded-pill border border-muted text-ink-2 hover:text-ink hover:border-ink-2 transition-colors"
              >
                {t('saveImage')}
              </button>
            </>
          )}
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-9 font-body text-xs rounded-pill border border-muted text-ink-2 hover:text-ink hover:border-ink-2 transition-colors"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
}
