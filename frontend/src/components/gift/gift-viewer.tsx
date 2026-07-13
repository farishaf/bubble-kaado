'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
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
  // undefined = decode in flight, null = bad fragment
  const [decoded, setDecoded] = useState<GiftData | null | undefined>(undefined);

  useEffect(() => {
    if (!fragment) return;
    let alive = true;
    void decodeGift(fragment).then((d) => {
      if (alive) setDecoded(d);
    });
    return () => {
      alive = false;
    };
  }, [fragment]);

  const effective = fragment ? decoded : null;
  const data = useMemo<GiftData | null>(() => {
    if (!template || effective === undefined) return null;
    return { ...template.defaults, ...(initialData ?? {}), ...(effective ?? {}) };
  }, [template, effective, initialData]);

  const Player = giftPlayers[slug];
  if (!Player || !data) return null;
  return <Player data={data} />;
}
