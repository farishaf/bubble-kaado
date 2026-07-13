'use client';

import type { ComponentType } from 'react';
import type { Accent, SectionData, SectionType } from './types';
import {
  CoverPreview,
  QuotePreview,
  CouplePreview,
  EventPreview,
  StoryPreview,
  GalleryPreview,
  ThanksPreview,
} from './previews';

type PreviewProps = {
  data: SectionData;
  accent: Accent;
};

export const previewRegistry: Record<SectionType, ComponentType<PreviewProps>> = {
  cover: CoverPreview,
  quote: QuotePreview,
  couple: CouplePreview,
  event: EventPreview,
  story: StoryPreview,
  gallery: GalleryPreview,
  thanks: ThanksPreview,
};