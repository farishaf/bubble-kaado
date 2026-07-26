/* Postage-stamp stickers for the envelope front — 2 designs, sender picks. */

export type StampStickerKind = 'bloom' | 'crane';

export function StampSticker({ kind, width = 54 }: { kind: string; width?: number }) {
  const k: StampStickerKind = kind === 'crane' ? 'crane' : 'bloom';
  const height = Math.round(width * (68 / 54));
  return (
    <span className="kd-stampsticker kd-stamp-edge" aria-hidden="true">
      {k === 'bloom' ? (
        <svg width={width} height={height} viewBox="0 0 54 68">
          <rect width="54" height="68" fill="var(--color-kd-cream)" />
          <rect x="4" y="4" width="46" height="60" fill="none" stroke="var(--color-kd-coral)" strokeWidth="1.2" opacity="0.6" />
          <g fill="var(--color-kd-coral)">
            <circle cx="27" cy="22" r="7" />
            <circle cx="37" cy="30" r="7" />
            <circle cx="33" cy="41" r="7" />
            <circle cx="21" cy="41" r="7" />
            <circle cx="17" cy="30" r="7" />
          </g>
          <circle cx="27" cy="31" r="5" fill="var(--color-kd-cream)" />
          <circle cx="27" cy="31" r="2.4" fill="var(--color-kd-forest)" />
          <text x="10" y="60" fontSize="7" fontWeight="700" letterSpacing="1.5" fill="var(--color-kd-forest)" fontFamily="var(--font-body)">
            KAADO
          </text>
          <text x="38" y="60" fontSize="8" fontWeight="800" fill="var(--color-kd-coral)" fontFamily="var(--font-body)">
            26
          </text>
        </svg>
      ) : (
        <svg width={width} height={height} viewBox="0 0 54 68">
          <rect width="54" height="68" fill="var(--color-kd-sage)" />
          <rect x="4" y="4" width="46" height="60" fill="none" stroke="var(--color-kd-forest)" strokeWidth="1.2" opacity="0.5" />
          {/* origami crane */}
          <g fill="var(--color-kd-forest)">
            <path d="M14 40 L27 22 L31 34 Z" />
            <path d="M31 34 L27 22 L44 30 L36 40 Z" opacity="0.85" />
            <path d="M14 40 L31 34 L36 40 L25 46 Z" opacity="0.7" />
            <path d="M27 22 L24 13 L30 17 Z" />
          </g>
          <circle cx="24.5" cy="15.5" r="0.9" fill="var(--color-kd-sage)" />
          <text x="10" y="60" fontSize="7" fontWeight="700" letterSpacing="1.5" fill="var(--color-kd-forest)" fontFamily="var(--font-body)">
            KAADO
          </text>
          <text x="38" y="60" fontSize="8" fontWeight="800" fill="var(--color-kd-coral)" fontFamily="var(--font-body)">
            26
          </text>
        </svg>
      )}
    </span>
  );
}

/* Wavy cancellation lines + ring, overlapping the stamp like a real postmark. */
export function Postmark() {
  return (
    <svg className="gift-env__postmark" width="72" height="40" viewBox="0 0 72 40" aria-hidden="true">
      <circle cx="18" cy="20" r="13" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M34 12 q6 -4 12 0 t12 0 t12 0" />
        <path d="M34 20 q6 -4 12 0 t12 0 t12 0" />
        <path d="M34 28 q6 -4 12 0 t12 0 t12 0" />
      </g>
    </svg>
  );
}
