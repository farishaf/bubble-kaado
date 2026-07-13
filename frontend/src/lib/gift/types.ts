export type GiftFieldType = 'text' | 'textarea' | 'url' | 'date' | 'select' | 'photo-gallery';

export type GiftField = {
  key: string;
  label: string;
  type: GiftFieldType;
  placeholder?: string;
  help?: string;
  required?: boolean;
  maxLength?: number;
  maxItems?: number;
  /** photo-gallery only: per-slot caption telling where photo N shows up */
  slotHints?: string[];
  options?: Array<{ value: string; label: string }>;
  info?: { title: string; body: string };
};

export type GiftData = Record<string, string>;

export type GiftTemplate = {
  slug: string;
  name: string;
  description: string;
  sections?: Array<{ id: string; label: string; fields: string[] }>;
  fields: GiftField[];
  defaults: GiftData;
};

export type GiftPlayerProps = {
  data: GiftData;
};
