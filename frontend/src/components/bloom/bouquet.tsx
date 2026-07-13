'use client';

import type { FlowerId } from '@/lib/bloom/types';
import { FLOWERS } from '@/lib/bloom/flowers';
import { Flower } from './flower';
import { useTranslations } from 'next-intl';

type Props = {
  flowers: Array<{ flowerId: FlowerId; message: string }>;
  onTap?: (index: number) => void;
  revealed?: Set<number>;
  activeIndex?: number | null;
  size?: number;
  arrangement?: 'grid' | 'arc';
};

const POSITIONS: Record<number, { col: number; row: number; rotate: number }> = {
  0: { col: 0, row: 0, rotate: -4 },
  1: { col: 1, row: 0, rotate: 5 },
  2: { col: 2, row: 0, rotate: -6 },
  3: { col: 3, row: 0, rotate: 3 },
  4: { col: 0, row: 1, rotate: 6 },
  5: { col: 1, row: 1, rotate: -3 },
  6: { col: 2, row: 1, rotate: 4 },
  7: { col: 3, row: 1, rotate: -5 },
};

export function Bouquet({ flowers, onTap, revealed, activeIndex, size = 56, arrangement = 'grid' }: Props) {
  const t = useTranslations('bloom');
  return (
    <div className="bouquet" data-arrangement={arrangement}>
      <div className="bouquet__field">
        {flowers.map((f, i) => {
          const def = FLOWERS[f.flowerId];
          const pos = POSITIONS[i] ?? POSITIONS[i % 8];
          const isRevealed = revealed?.has(i) ?? false;
          const isActive = activeIndex === i;
          return (
            <div
              key={i}
              className="bouquet__slot"
              data-bouquet-slot
              style={{
                ['--col' as string]: pos.col,
                ['--row' as string]: pos.row,
                gridColumn: String(pos.col + 1),
                gridRow: String(pos.row + 1),
              }}
            >
              <button
                type="button"
                onClick={() => onTap?.(i)}
                disabled={!onTap}
                data-bouquet-flower
                data-flower-id={f.flowerId}
                data-revealed={isRevealed || undefined}
                data-active={isActive || undefined}
                className={`bouquet__flower ${isRevealed ? 'is-revealed' : ''} ${isActive ? 'is-active' : ''}`}
                style={{
                  ['--rotate' as string]: `${pos.rotate}deg`,
                }}
                aria-label={def.name}
              >
                <Flower flowerId={f.flowerId} size={size} />
              </button>
              {isRevealed && (
                <span className="bouquet__dot" aria-hidden />
              )}
              {isActive && (
                <div
                  className="flower-message-card"
                  role="dialog"
                  aria-live="polite"
                >
                  <p className="flower-message-card__meaning">
                    {def.name} · {t(`meanings.${def.meaningId}` as 'meanings.love')}
                  </p>
                  <p className="flower-message-card__text">{f.message}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="bouquet__wrap" aria-hidden>
        <svg viewBox="0 0 320 60" preserveAspectRatio="none">
          <path
            d="M40 8 Q160 -6 280 8 L268 56 Q160 44 52 56 Z"
            fill="var(--color-accent-2)"
            stroke="var(--color-ink)"
            strokeWidth="0.6"
            opacity="0.55"
          />
          <path
            d="M52 12 Q160 0 268 12"
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth="0.5"
            strokeDasharray="2 3"
            opacity="0.5"
          />
        </svg>
      </div>
    </div>
  );
}
