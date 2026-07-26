'use client';

import { useEffect, useRef, useState } from 'react';

/* Lazy-loads the emoji-picker-element web component on first open and
   inserts the picked emoji via the callback. */
export function EmojiButton({ onPick, label }: { onPick: (emoji: string) => void; label: string }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const onPickRef = useRef(onPick);

  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);

  useEffect(() => {
    if (!open) return;
    const host = hostRef.current;
    if (!host) return;
    let picker: HTMLElement | null = null;
    let cancelled = false;
    void import('emoji-picker-element').then(() => {
      if (cancelled || !host) return;
      picker = document.createElement('emoji-picker');
      picker.addEventListener('emoji-click', (e) => {
        const unicode = (e as CustomEvent<{ unicode?: string }>).detail?.unicode;
        if (unicode) onPickRef.current(unicode);
      });
      host.appendChild(picker);
    });
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      cancelled = true;
      picker?.remove();
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <span ref={wrapRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={label}
        aria-expanded={open}
        className="inline-flex w-6 h-6 items-center justify-center rounded-sm border border-muted text-ink-3 hover:text-ink hover:border-ink-2 text-[13px] leading-none transition-colors"
      >
        ☺
      </button>
      {open && <div ref={hostRef} className="kd-emoji-pop" />}
    </span>
  );
}
