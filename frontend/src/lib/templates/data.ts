import type { Template, FormData, SectionType } from './types';
import { SECTION_ORDER } from './sections';

const STARTER_SECTIONS: SectionType[] = ['cover', 'quote', 'couple', 'event', 'thanks'];
const EXTENDED_SECTIONS: SectionType[] = ['cover', 'quote', 'couple', 'event', 'story', 'gallery', 'thanks'];

export const TEMPLATES: Template[] = [
  {
    id: 'tpl_bloom',
    slug: 'bloom',
    name: 'Bloom',
    category: 'floral',
    description: 'Lembut dan romantis, seperti taman di pagi hari.',
    accent: 'rose',
    sections: EXTENDED_SECTIONS,
  },
  {
    id: 'tpl_mono',
    slug: 'mono',
    name: 'Mono',
    category: 'modern',
    description: 'Minimal, monokromatik. Untuk kalian yang tidak suka ramai.',
    accent: 'ink',
    sections: STARTER_SECTIONS,
  },
  {
    id: 'tpl_sunset',
    slug: 'sunset',
    name: 'Sunset',
    category: 'modern',
    description: 'Gradien hangat seperti senja di tepi pantai.',
    accent: 'rust',
    sections: EXTENDED_SECTIONS,
  },
  {
    id: 'tpl_letter',
    slug: 'letter',
    name: 'Letter',
    category: 'editorial',
    description: 'Seperti surat cinta — tipografi yang bicara.',
    accent: 'mauve',
    sections: STARTER_SECTIONS,
  },
  {
    id: 'tpl_garden',
    slug: 'garden',
    name: 'Garden',
    category: 'floral',
    description: 'Organik, berlapis, untuk kalian yang suka tanaman.',
    accent: 'olive',
    sections: EXTENDED_SECTIONS,
  },
  {
    id: 'tpl_festive',
    slug: 'festive',
    name: 'Festive',
    category: 'classic',
    description: 'Penuh warna dan kegembiraan. Untuk pesta besar.',
    accent: 'sand',
    sections: EXTENDED_SECTIONS,
  },
];

export function getTemplate(slug: string): Template | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}

export function emptyFormData(template: Template): FormData {
  const out: FormData = {};
  for (const stype of template.sections) {
    out[stype] = { enabled: true };
  }
  return out;
}

export const CATEGORIES: Array<{ key: 'all' | 'classic' | 'modern' | 'floral' | 'editorial'; i18nKey: string }> = [
  { key: 'all', i18nKey: 'all' },
  { key: 'classic', i18nKey: 'classic' },
  { key: 'modern', i18nKey: 'modern' },
  { key: 'floral', i18nKey: 'floral' },
  { key: 'editorial', i18nKey: 'editorial' },
];

export { SECTION_ORDER };