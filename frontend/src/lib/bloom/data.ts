import type { BloomData } from './types';
import { FLOWER_ORDER } from './flowers';

export const STARTER_BLOOM: BloomData = {
  envelope: {
    recipient_name: 'Kamu',
    sender_name: 'Aku',
    opening: 'Sebuah hal kecil, untukmu.',
  },
  bouquet: [
    {
      flowerId: 'rose',
      message: 'Cara kamu tertawa hal paling favoritku.',
    },
    {
      flowerId: 'tulip',
      message: 'Aku selalu perhatikan hal-hal kecil tentangmu.',
    },
    {
      flowerId: 'sunflower',
      message: 'Kamu bikin hari-hariku terasa lebih hangat.',
    },
    {
      flowerId: 'blossom',
      message: 'Aku ingin menyimpan momen ini bersamamu.',
    },
  ],
  note: {
    heading: 'Untukmu',
    body: 'Tidak ada kata yang cukup besar untuk hal yang aku rasakan. Tapi aku ingin kamu tahu — setiap hari bersamamu terasa seperti hadiah kecil yang ingin terus kuminum.',
  },
  closing: {
    signed: 'Dengan sayang,',
  },
};

export const EMPTY_BLOOM: BloomData = {
  envelope: {
    recipient_name: '',
    sender_name: '',
    opening: '',
  },
  bouquet: FLOWER_ORDER.slice(0, 4).map((id) => ({ flowerId: id, message: '' })),
  note: { heading: '', body: '' },
  closing: { signed: '' },
};
