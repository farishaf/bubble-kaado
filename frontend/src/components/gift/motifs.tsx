/* Decorative motifs from the Kanazawa vocabulary. Flat fills and uniform
   outlines only — no gradients, shadows, glows or blur. Depth comes from
   overlap and rotation. All of these are text-free by design; they stand in
   for the labels that used to sit above each stage. */

/* Ume blossom — Kanazawa's civic flower and the one element allowed to ignore
   the grid. Five circles of radius r centred on a circle of radius 0.95r at
   -90°, -18°, 54°, 126°, 198°, plus a centre dot of 0.27r. Petals overlap;
   they are never drawn separated. */
const PETALS = [
  { cx: 0, cy: -19 },
  { cx: 18, cy: -6 },
  { cx: 11, cy: 15 },
  { cx: -11, cy: 15 },
  { cx: -18, cy: -6 },
] as const;

type BlossomProps = {
  size?: number;
  /** solid = flat fill (confetti on dark grounds); outline = uniform stroke, no fill. */
  variant?: 'solid' | 'outline';
  color?: string;
  /** Centre dot; omit on very small marks where it would just blot. */
  centerColor?: string;
  className?: string;
};

export function Blossom({
  size = 14,
  variant = 'solid',
  color = 'var(--color-kd-pink)',
  centerColor,
  className,
}: BlossomProps) {
  const outline = variant === 'outline';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      <g
        transform="translate(50,50)"
        fill={outline ? 'none' : color}
        stroke={outline ? color : 'none'}
        /* one uniform weight, never varied — scaled so it lands at 1.4px on screen */
        strokeWidth={outline ? (1.4 * 100) / size : undefined}
      >
        {PETALS.map((p) => (
          <circle key={`${p.cx},${p.cy}`} cx={p.cx} cy={p.cy} r="20" />
        ))}
      </g>
      {centerColor && <circle cx="50" cy="50" r="5" fill={centerColor} />}
    </svg>
  );
}

/* Origami crane — outline only. No fill, no shading, ever. Interior fold lines
   carry the same weight as the silhouette; there is no hierarchy between edge
   and crease. This is the contemporary/paper-craft register. */
export function Crane({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.7)}
      viewBox="0 0 100 70"
      className={className}
      fill="none"
      stroke="currentColor"
      /* uniform 1.4px on screen whatever the render size */
      strokeWidth={(1.4 * 100) / size}
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 46 L46 24 L50 8 L54 24 L80 46 L54 40 L50 58 L46 40 Z" />
      <path d="M46 24 L50 40 L54 24" />
      <path d="M20 46 L50 40 L80 46" />
    </svg>
  );
}

/* Registration mark — the print-shop crosshair from the ephemera set, the prop
   that sells the "official municipal document" fiction. */
export function RegMark({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={(1.4 * 100) / size}
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="26" />
      <path d="M50 2 V30 M50 70 V98 M2 50 H30 M70 50 H98" />
    </svg>
  );
}

/* Scattered blossoms — off-grid on purpose. Rotation is free and scale varies;
   the irregularity against the rigid panel is what animates it, so these
   offsets are hand-picked rather than even. Fixed rather than random so the
   server and client render identical markup. */
const SCATTER = [
  { size: 15, rotate: 14, y: -3, ml: 0 },
  { size: 8, rotate: -37, y: 4, ml: 5 },
  { size: 11, rotate: 62, y: -1, ml: 3 },
  { size: 6, rotate: 8, y: 5, ml: 4 },
] as const;

export function BlossomScatter({
  color = 'var(--color-kd-pink)',
  count = SCATTER.length,
}: {
  color?: string;
  count?: number;
}) {
  return (
    <span className="inline-flex items-center" aria-hidden="true">
      {SCATTER.slice(0, count).map((b, i) => (
        <span
          key={i}
          style={{
            marginLeft: b.ml,
            transform: `translateY(${b.y}px) rotate(${b.rotate}deg)`,
            lineHeight: 0,
          }}
        >
          <Blossom size={b.size} color={color} />
        </span>
      ))}
    </span>
  );
}
