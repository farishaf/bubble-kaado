'use client';

import { useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Draggable } from 'gsap/Draggable';
import { giftSound } from '@/lib/gift/sound';

gsap.registerPlugin(useGSAP, Draggable);

const COLS = 3;
const ROWS = 2;
/** cell 0 comes pre-placed so the picture has an anchor; the other five are the puzzle */
const CELLS = [0, 1, 2, 3, 4, 5];
const PIECES = CELLS.slice(1);

// ponytail: square tiles, not tabbed jigsaw silhouettes. Swap in an SVG
// clip-path per cell if the notched outline ever matters more than the drag.
function cellStyle(i: number, photo: string) {
  if (!photo) return undefined;
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  return {
    backgroundImage: `url(${photo})`,
    backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
    backgroundPosition: `${(col / (COLS - 1)) * 100}% ${(row / (ROWS - 1)) * 100}%`,
  };
}

function shuffled<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

type Props = {
  photo: string;
  hint: string;
  progress: (placed: number) => string;
  pieceLabel: (n: number) => string;
  onSolved: () => void;
};

export function GiftPuzzle({ photo, hint, progress, pieceLabel, onSolved }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const placedRef = useRef(new Set<number>());
  // set up inside useGSAP; the keyboard handler reaches the same drop logic Draggable uses
  const placeRef = useRef<((piece: HTMLElement) => void) | null>(null);
  const [placed, setPlaced] = useState(0);
  // tray order is fixed for the life of the puzzle so pieces never re-flow mid-drag
  const trayOrder = useMemo(() => shuffled(PIECES), []);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const pieces = gsap.utils.toArray<HTMLElement>('.puz-piece', root);

      gsap.set(pieces, { scale: 0.55 });
      if (!reduced) {
        gsap.from(pieces, { opacity: 0, y: 24, duration: 0.4, stagger: 0.06, ease: 'back.out(1.6)' });
      }

      const place = (piece: HTMLElement) => {
        const index = Number(piece.dataset.cell);
        if (placedRef.current.has(index)) return;
        const slot = root.querySelector<HTMLElement>(`.puz-slot[data-cell="${index}"]`);
        if (!slot) return;

        placedRef.current.add(index);
        setPlaced(placedRef.current.size);
        Draggable.get(piece)?.disable();
        giftSound.right();

        const fromBox = piece.getBoundingClientRect();
        const toBox = slot.getBoundingClientRect();
        gsap.to(piece, {
          x: `+=${toBox.left + toBox.width / 2 - (fromBox.left + fromBox.width / 2)}`,
          y: `+=${toBox.top + toBox.height / 2 - (fromBox.top + fromBox.height / 2)}`,
          scale: 1,
          rotate: 0,
          duration: reduced ? 0.01 : 0.32,
          ease: 'back.out(2)',
          onComplete() {
            gsap.set(piece, { zIndex: 10 });
            piece.classList.add('is-placed');
          },
        });

        if (placedRef.current.size === PIECES.length) {
          gsap.delayedCall(reduced ? 0.1 : 0.5, onSolved);
        }
      };
      placeRef.current = place;

      const draggables = pieces.map((piece) =>
        Draggable.create(piece, {
          type: 'x,y',
          bounds: root,
          allowContextMenu: true,
          onPressInit() {
            gsap.set(piece, { zIndex: 30 });
          },
          onDragStart() {
            gsap.to(piece, { scale: 0.72, duration: 0.15, ease: 'power2.out' });
          },
          onRelease() {
            const index = Number(piece.dataset.cell);
            const slot = root.querySelector<HTMLElement>(`.puz-slot[data-cell="${index}"]`);
            if (slot && Draggable.hitTest(piece, slot, '52%')) {
              place(piece);
              return;
            }
            giftSound.wrong();
            gsap
              .timeline()
              .to(piece, { x: 0, y: 0, scale: 0.55, duration: reduced ? 0.01 : 0.4, ease: 'power2.inOut' })
              .to(piece, { rotate: '+=8', duration: 0.06, repeat: 3, yoyo: true, ease: 'none' }, 0)
              .set(piece, { rotate: 0, zIndex: 10 });
          },
          // tapping a piece without dragging drops it home — the same path
          // keyboard activation takes, so the puzzle is never drag-only
          onClick() {
            place(piece);
          },
        })
      );

      return () => {
        draggables.flat().forEach((d) => d.kill());
        placeRef.current = null;
      };
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="puz">
      <div className="puz-board" aria-hidden="true">
        {CELLS.map((i) =>
          i === 0 ? (
            <div key={i} className="puz-cell puz-cell--fixed" style={cellStyle(i, photo)}>
              {!photo && <span className="puz-num">1</span>}
            </div>
          ) : (
            <div key={i} className="puz-slot puz-cell" data-cell={i}>
              <span className="puz-num">{i + 1}</span>
            </div>
          )
        )}
      </div>

      <div className="puz-tray">
        {trayOrder.map((cell, slot) => (
          <button
            key={cell}
            type="button"
            className="puz-piece"
            data-cell={cell}
            aria-label={pieceLabel(cell + 1)}
            style={{ left: `calc(${slot} * 20% - 6.6%)`, ...cellStyle(cell, photo) }}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' && e.key !== ' ') return;
              e.preventDefault();
              placeRef.current?.(e.currentTarget);
            }}
          >
            {!photo && <span className="puz-num">{cell + 1}</span>}
          </button>
        ))}
      </div>

      <p className="puz-hint" aria-live="polite">
        {placed === 0 ? hint : progress(placed)}
      </p>
    </div>
  );
}
