import type { FlowerDef } from './types';

export const FLOWERS: Record<FlowerDef['id'], FlowerDef> = {
  rose: {
    id: 'rose',
    name: 'Mawar',
    meaningId: 'love',
    meaning: 'cinta yang hangat',
    meaningShort: 'cinta',
    color: 'var(--color-accent)',
    petal: 'var(--color-accent)',
    stem: 'var(--color-accent-2)',
  },
  tulip: {
    id: 'tulip',
    name: 'Tulip',
    meaningId: 'care',
    meaning: 'perhatian yang tulus',
    meaningShort: 'perhatian',
    color: 'oklch(0.74 0.080 30)',
    petal: 'oklch(0.74 0.080 30)',
    stem: 'var(--color-accent-2)',
  },
  daisy: {
    id: 'daisy',
    name: 'Aster',
    meaningId: 'joy',
    meaning: 'kebahagiaan sederhana',
    meaningShort: 'sukacita',
    color: 'var(--color-paper)',
    petal: 'var(--color-paper)',
    stem: 'var(--color-accent-2)',
  },
  sunflower: {
    id: 'sunflower',
    name: 'Bunga matahari',
    meaningId: 'warmth',
    meaning: 'hangat seperti siang',
    meaningShort: 'kehangatan',
    color: 'oklch(0.78 0.110 80)',
    petal: 'oklch(0.78 0.110 80)',
    stem: 'var(--color-accent-2)',
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender',
    meaningId: 'patience',
    meaning: 'kesetiaan yang sabar',
    meaningShort: 'kesetiaan',
    color: 'oklch(0.72 0.060 295)',
    petal: 'oklch(0.72 0.060 295)',
    stem: 'var(--color-accent-2)',
  },
  peony: {
    id: 'peony',
    name: 'Peony',
    meaningId: 'grace',
    meaning: 'kelembutan yang anggun',
    meaningShort: 'kelembutan',
    color: 'oklch(0.80 0.060 5)',
    petal: 'oklch(0.80 0.060 5)',
    stem: 'var(--color-accent-2)',
  },
  blossom: {
    id: 'blossom',
    name: 'Sakura',
    meaningId: 'memory',
    meaning: 'momen yang ingin disimpan',
    meaningShort: 'kenangan',
    color: 'oklch(0.85 0.040 350)',
    petal: 'oklch(0.85 0.040 350)',
    stem: 'var(--color-accent-2)',
  },
  lily: {
    id: 'lily',
    name: 'Lily',
    meaningId: 'hope',
    meaning: 'harap untuk hari esok',
    meaningShort: 'harap',
    color: 'oklch(0.92 0.020 95)',
    petal: 'oklch(0.92 0.020 95)',
    stem: 'var(--color-accent-2)',
  },
};

export const FLOWER_ORDER: FlowerDef['id'][] = [
  'rose',
  'tulip',
  'daisy',
  'sunflower',
  'lavender',
  'peony',
  'blossom',
  'lily',
];

export const MAX_FLOWERS = 8;
export const MIN_FLOWERS = 3;

export function getFlower(id: string): FlowerDef | undefined {
  return FLOWERS[id as FlowerDef['id']];
}
