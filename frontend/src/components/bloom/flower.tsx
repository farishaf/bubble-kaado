'use client';

import type { FlowerId } from '@/lib/bloom/types';
import { FLOWERS } from '@/lib/bloom/flowers';

type Props = {
  flowerId: FlowerId;
  size?: number;
  className?: string;
  variant?: 'bloom' | 'picker' | 'inline';
};

export function Flower({ flowerId, size = 64, className = '', variant = 'bloom' }: Props) {
  const def = FLOWERS[flowerId];
  return (
    <svg
      viewBox="0 0 80 100"
      width={size}
      height={size * 1.25}
      aria-hidden
      className={`flower flower--${flowerId} ${variant === 'picker' ? 'flower--picker' : ''} ${className}`}
      data-flower={flowerId}
    >
      {renderFlower(flowerId, def.petal, def.stem)}
    </svg>
  );
}

function renderFlower(id: FlowerId, petal: string, stem: string) {
  switch (id) {
    case 'rose':
      return (
        <>
          <Stem color={stem} />
          <g transform="translate(40 30)">
            <path d="M-10 -4 Q-14 6 -8 12 Q-2 16 4 12 Q12 8 12 0 Q12 -10 4 -12 Q-4 -14 -10 -4 Z" fill={petal} stroke="var(--color-ink)" strokeWidth="0.7" strokeLinejoin="round" opacity="0.85" />
            <path d="M-6 -2 Q-9 5 -4 9 Q2 11 6 7 Q10 2 8 -4 Q5 -10 -1 -9 Q-7 -7 -6 -2 Z" fill={petal} stroke="var(--color-ink)" strokeWidth="0.7" strokeLinejoin="round" />
            <path d="M-3 0 Q-5 4 -1 6 Q4 5 4 1 Q3 -4 -1 -3 Q-4 -2 -3 0 Z" fill="var(--color-ink-3)" opacity="0.4" />
            <path d="M2 -2 Q0 2 3 3 Q5 0 4 -3 Z" fill={petal} />
          </g>
        </>
      );
    case 'tulip':
      return (
        <>
          <Stem color={stem} curved />
          <g transform="translate(40 28)">
            <path d="M-12 4 Q-12 -16 -8 -20 Q-4 -22 0 -20 Q4 -22 8 -20 Q12 -16 12 4 Z" fill={petal} stroke="var(--color-ink)" strokeWidth="0.7" strokeLinejoin="round" />
            <path d="M-7 0 Q-7 -12 -3 -15 Q0 -16 0 -10 Q0 -16 3 -15 Q7 -12 7 0 Z" fill="var(--color-paper)" opacity="0.4" />
            <path d="M-9 4 L9 4" stroke="var(--color-ink)" strokeWidth="0.7" strokeLinecap="round" />
            <path d="M-12 4 Q-12 10 -6 12 L6 12 Q12 10 12 4" fill="var(--color-ink-2)" opacity="0.15" />
          </g>
        </>
      );
    case 'daisy':
      return (
        <>
          <Stem color={stem} />
          <g transform="translate(40 30)">
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i * 360) / 8;
              return (
                <ellipse
                  key={i}
                  cx="0"
                  cy="-12"
                  rx="3"
                  ry="9"
                  fill={petal}
                  stroke="var(--color-ink)"
                  strokeWidth="0.6"
                  transform={`rotate(${angle})`}
                  opacity="0.95"
                />
              );
            })}
            <circle r="6" fill="oklch(0.78 0.110 80)" stroke="var(--color-ink)" strokeWidth="0.6" />
            <circle r="3" fill="oklch(0.55 0.080 60)" />
          </g>
        </>
      );
    case 'sunflower':
      return (
        <>
          <Stem color={stem} thick />
          <g transform="translate(40 28)">
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 360) / 12;
              return (
                <path
                  key={i}
                  d="M0 -22 Q4 -18 0 -10 Q-4 -18 0 -22 Z"
                  fill={petal}
                  stroke="var(--color-ink)"
                  strokeWidth="0.6"
                  transform={`rotate(${angle})`}
                  opacity="0.95"
                />
              );
            })}
            <circle r="9" fill="oklch(0.42 0.060 50)" stroke="var(--color-ink)" strokeWidth="0.7" />
            <circle r="6" fill="oklch(0.32 0.060 40)" />
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = (i * 360) / 6;
              return <circle key={i} cx="0" cy="0" r="0.6" fill="oklch(0.78 0.110 80)" transform={`rotate(${angle}) translate(0 -3)`} />;
            })}
          </g>
        </>
      );
    case 'lavender':
      return (
        <>
          <Stem color={stem} curved />
          <g transform="translate(40 14)">
            {Array.from({ length: 9 }).map((_, i) => {
              const y = i * 4;
              const r = 2.6 - i * 0.18;
              return (
                <ellipse
                  key={i}
                  cx="0"
                  cy={y}
                  rx={r}
                  ry={r * 1.3}
                  fill={petal}
                  stroke="var(--color-ink)"
                  strokeWidth="0.5"
                  opacity={0.4 + i * 0.07}
                />
              );
            })}
            <path d="M-1.5 0 L1.5 0" stroke="var(--color-ink)" strokeWidth="0.5" />
          </g>
        </>
      );
    case 'peony':
      return (
        <>
          <Stem color={stem} />
          <g transform="translate(40 30)">
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = (i * 60);
              return (
                <ellipse
                  key={i}
                  cx="0"
                  cy="-12"
                  rx="7"
                  ry="11"
                  fill={petal}
                  stroke="var(--color-ink)"
                  strokeWidth="0.6"
                  opacity="0.55"
                  transform={`rotate(${angle})`}
                />
              );
            })}
            {Array.from({ length: 5 }).map((_, i) => {
              const angle = i * 72 + 36;
              return (
                <ellipse
                  key={`inner-${i}`}
                  cx="0"
                  cy="-6"
                  rx="5"
                  ry="8"
                  fill={petal}
                  stroke="var(--color-ink)"
                  strokeWidth="0.6"
                  opacity="0.8"
                  transform={`rotate(${angle})`}
                />
              );
            })}
            <circle r="3.5" fill={petal} stroke="var(--color-ink)" strokeWidth="0.6" opacity="0.95" />
          </g>
        </>
      );
    case 'blossom':
      return (
        <>
          <Stem color={stem} curved />
          <g transform="translate(40 28)">
            {Array.from({ length: 5 }).map((_, i) => {
              const angle = (i * 72) - 90;
              return (
                <path
                  key={i}
                  d="M0 0 Q-6 -4 -6 -10 Q0 -14 6 -10 Q6 -4 0 0 Z"
                  fill={petal}
                  stroke="var(--color-ink)"
                  strokeWidth="0.6"
                  opacity="0.92"
                  transform={`rotate(${angle})`}
                />
              );
            })}
            <circle r="2.5" fill="oklch(0.78 0.110 80)" stroke="var(--color-ink)" strokeWidth="0.5" />
            <line x1="0" y1="2.5" x2="0" y2="4" stroke="var(--color-ink)" strokeWidth="0.6" />
          </g>
        </>
      );
    case 'lily':
      return (
        <>
          <Stem color={stem} />
          <g transform="translate(40 30)">
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = (i * 60);
              return (
                <path
                  key={i}
                  d="M0 0 Q-4 -8 -7 -18 Q0 -22 7 -18 Q4 -8 0 0 Z"
                  fill={petal}
                  stroke="var(--color-ink)"
                  strokeWidth="0.6"
                  opacity="0.9"
                  transform={`rotate(${angle})`}
                />
              );
            })}
            <circle r="2" fill="oklch(0.78 0.110 80)" />
            <line x1="0" y1="0" x2="0" y2="-14" stroke="var(--color-ink)" strokeWidth="0.5" strokeDasharray="1 1.5" opacity="0.6" />
          </g>
        </>
      );
    default:
      return null;
  }
}

function Stem({ color, curved = false, thick = false }: { color: string; curved?: boolean; thick?: boolean }) {
  const w = thick ? 2.2 : 1.4;
  return (
    <g>
      {curved ? (
        <path
          d="M40 50 Q42 70 38 96"
          stroke={color}
          strokeWidth={w}
          fill="none"
          strokeLinecap="round"
        />
      ) : (
        <line x1="40" y1="50" x2="40" y2="96" stroke={color} strokeWidth={w} strokeLinecap="round" />
      )}
      <path
        d="M40 70 Q50 72 56 68 Q52 78 40 76"
        fill={color}
        opacity="0.7"
        stroke="var(--color-ink)"
        strokeWidth="0.5"
      />
      <path
        d="M40 84 Q30 86 24 82 Q28 92 40 90"
        fill={color}
        opacity="0.7"
        stroke="var(--color-ink)"
        strokeWidth="0.5"
      />
    </g>
  );
}
