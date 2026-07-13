type Mood = 0 | 1 | 2 | 3 | 4 | 5 | 'happy';

const MOUTHS: Record<number, string> = {
  0: 'M46 76 Q60 87 74 76',
  1: 'M47 79 Q60 84 73 79',
  2: 'M47 81 L73 81',
  3: 'M47 85 Q60 76 73 85',
  4: 'M47 87 Q60 73 73 87',
};

export function Mascot({ mood, size = 150 }: { mood: Mood; size?: number }) {
  const sad = typeof mood === 'number' ? mood : 0;
  const happy = mood === 'happy';
  return (
    <svg
      className="gift-mascot"
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-hidden="true"
    >
      {happy && (
        <g>
          <path className="gift-mascot__heart" d="M22 20 C22 16 27 15 29 18 C31 15 36 16 36 20 C36 25 29 30 29 30 C29 30 22 25 22 20" />
          <path className="gift-mascot__heart gift-mascot__heart--2" d="M52 6 C52 3 56 2 57.5 4.5 C59 2 63 3 63 6 C63 10 57.5 14 57.5 14 C57.5 14 52 10 52 6" />
          <path className="gift-mascot__heart gift-mascot__heart--3" d="M86 18 C86 14 91 13 93 16 C95 13 100 14 100 18 C100 23 93 28 93 28 C93 28 86 23 86 18" />
        </g>
      )}
      <ellipse className="gift-mascot__shadow" cx="60" cy="108" rx="34" ry="5" />
      <rect className="gift-mascot__body" x="18" y="24" width="84" height="80" rx="38" />
      <circle className="gift-mascot__cheek" cx="38" cy="68" r="4.5" />
      <circle className="gift-mascot__cheek" cx="82" cy="68" r="4.5" />
      {happy ? (
        <g className="gift-mascot__line">
          <path d="M38 57 Q44 50 50 57" />
          <path d="M70 57 Q76 50 82 57" />
        </g>
      ) : (
        <g className="gift-mascot__fill">
          <circle cx="44" cy="56" r="5" />
          <circle cx="76" cy="56" r="5" />
        </g>
      )}
      {!happy && sad >= 2 && (
        <g className="gift-mascot__line">
          <path d="M37 45 L50 40" />
          <path d="M83 45 L70 40" />
        </g>
      )}
      {happy ? (
        <path className="gift-mascot__fill" d="M44 72 Q60 96 76 72 Z" />
      ) : sad >= 5 ? (
        <path className="gift-mascot__fill" d="M52 82 Q60 75 68 82 Q60 95 52 82" />
      ) : (
        <path className="gift-mascot__line" d={MOUTHS[sad] ?? MOUTHS[0]} />
      )}
      {!happy && sad >= 3 && (
        <path className="gift-mascot__tear" d="M44 62 q4.5 8 0 11.5 q-4.5 -3.5 0 -11.5" />
      )}
      {!happy && sad >= 4 && (
        <path className="gift-mascot__tear gift-mascot__tear--2" d="M76 62 q4.5 8 0 11.5 q-4.5 -3.5 0 -11.5" />
      )}
    </svg>
  );
}
