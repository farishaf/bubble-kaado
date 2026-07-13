'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { getGiftTemplate } from '@/lib/gift/data';
import { decodeGift } from '@/lib/gift/encode';
import type { GiftData } from '@/lib/gift/types';
import { giftPlayers } from './players';

function subscribeHash(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

export function GiftViewer({ slug, initialData }: { slug: string; initialData?: GiftData }) {
  const fragment = useSyncExternalStore(
    subscribeHash,
    () => window.location.hash.slice(1),
    () => ''
  );
  const template = getGiftTemplate(slug);
  const data = useMemo<GiftData | null>(() => {
    if (!template) return null;
    const decoded = fragment ? decodeGift(fragment) : null;
    return { ...template.defaults, ...(initialData ?? {}), ...(decoded ?? {}) };
  }, [template, fragment, initialData]);

  const Player = giftPlayers[slug];
  if (!Player || !data) return null;
  return <Player data={data} />;
}
