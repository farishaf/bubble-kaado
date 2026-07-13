'use client';

import type { ComponentType } from 'react';
import type { GiftPlayerProps } from '@/lib/gift/types';
import { YesNoPlayer } from './yes-no-player';

export const giftPlayers: Record<string, ComponentType<GiftPlayerProps>> = {
  'yes-no': YesNoPlayer,
};
