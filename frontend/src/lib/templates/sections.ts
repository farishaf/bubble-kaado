import type { SectionDef, SectionType } from './types';

export const SECTIONS: Record<SectionType, SectionDef> = {
  cover: {
    type: 'cover',
    title: 'Sampul',
    description: 'Halaman pembuka dengan nama kalian dan tanggal pernikahan.',
    fields: [
      { key: 'couple_name_1', label: 'Nama pertama', placeholder: 'Rina', type: 'text', required: true },
      { key: 'couple_name_2', label: 'Nama pasangan', placeholder: 'Budi', type: 'text', required: true },
      { key: 'wedding_date', label: 'Tanggal pernikahan', type: 'date', required: true },
      { key: 'opening_quote', label: 'Sambutan (opsional)', placeholder: 'Dengan penuh syukur...', type: 'textarea', maxLength: 200 },
    ],
  },
  quote: {
    type: 'quote',
    title: 'Kutipan',
    description: 'Kutipan singkat yang membuka bagian dalam.',
    fields: [
      { key: 'quote_text', label: 'Teks kutipan', placeholder: 'Dan di antara tanda-tanda kekuasaan-Nya...', type: 'textarea', required: true, maxLength: 300 },
      { key: 'quote_source', label: 'Sumber (opsional)', placeholder: 'QS. Ar-Rum: 21', type: 'text' },
    ],
  },
  couple: {
    type: 'couple',
    title: 'Mempelai',
    description: 'Ceritakan sedikit tentang kalian berdua.',
    fields: [
      { key: 'groom_name', label: 'Nama lengkap mempelai pria', placeholder: 'Budi Santoso', type: 'text', required: true },
      { key: 'groom_parents', label: 'Putra dari', placeholder: 'Bapak X & Ibu Y', type: 'text' },
      { key: 'groom_photo', label: 'Foto mempelai pria', type: 'photo-gallery', maxItems: 1 },
      { key: 'bride_name', label: 'Nama lengkap mempelai wanita', placeholder: 'Rina Wulandari', type: 'text', required: true },
      { key: 'bride_parents', label: 'Putri dari', placeholder: 'Bapak A & Ibu B', type: 'text' },
      { key: 'bride_photo', label: 'Foto mempelai wanita', type: 'photo-gallery', maxItems: 1 },
    ],
  },
  event: {
    type: 'event',
    title: 'Acara',
    description: 'Detail waktu dan tempat acara. Bisa lebih dari satu nanti.',
    fields: [
      { key: 'name', label: 'Nama acara', placeholder: 'Akad & Resepsi', type: 'text', required: true },
      { key: 'date', label: 'Tanggal', type: 'date', required: true },
      { key: 'time', label: 'Waktu', placeholder: '08:00 — selesai', type: 'time', required: true },
      { key: 'venue', label: 'Tempat', placeholder: 'Gedung Sapta Gama', type: 'text', required: true },
      { key: 'address', label: 'Alamat', placeholder: 'Jl. ...', type: 'text' },
      { key: 'map_url', label: 'Link Google Maps (opsional)', type: 'url' },
    ],
  },
  story: {
    type: 'story',
    title: 'Cerita kami',
    description: 'Bagaimana kalian bertemu dan jatuh cinta.',
    fields: [
      { key: 'story_text', label: 'Cerita kalian', placeholder: 'Kami bertemu di...', type: 'textarea', required: true, maxLength: 1500 },
    ],
  },
  gallery: {
    type: 'gallery',
    title: 'Galeri',
    description: 'Foto-foto prewedding atau kenangan bersama.',
    fields: [
      { key: 'photos', label: 'Foto-foto', type: 'photo-gallery', maxItems: 12 },
    ],
  },
  thanks: {
    type: 'thanks',
    title: 'Penutup',
    description: 'Ucapan terima kasih untuk tamu.',
    fields: [
      { key: 'thanks_text', label: 'Ucapan', placeholder: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami...', type: 'textarea', required: true, maxLength: 400 },
    ],
  },
};

export const SECTION_ORDER: SectionType[] = ['cover', 'quote', 'couple', 'event', 'story', 'gallery', 'thanks'];