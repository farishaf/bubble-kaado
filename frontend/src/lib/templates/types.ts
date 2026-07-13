export type SectionFieldType = 'text' | 'textarea' | 'date' | 'time' | 'url' | 'photo-gallery';

export type SectionType =
  | 'cover'
  | 'quote'
  | 'couple'
  | 'event'
  | 'story'
  | 'gallery'
  | 'thanks';

export type SectionField = {
  key: string;
  label: string;
  placeholder?: string;
  type: SectionFieldType;
  required?: boolean;
  maxLength?: number;
  maxItems?: number;
};

export type SectionDef = {
  type: SectionType;
  title: string;
  description: string;
  fields: SectionField[];
};

export type Category = 'all' | 'classic' | 'modern' | 'floral' | 'editorial';
export type Accent = 'rose' | 'olive' | 'rust' | 'ink' | 'mauve' | 'sand';

export type Template = {
  id: string;
  slug: string;
  name: string;
  category: Exclude<Category, 'all'>;
  description: string;
  accent: Accent;
  sections: SectionType[];
};

export type SectionData = {
  enabled?: boolean;
  [fieldKey: string]: string | string[] | boolean | undefined;
};

export type FormData = {
  [sectionType: string]: SectionData;
};

export type SaveResponse = {
  slug: string;
  url: string;
  status: string;
  template_slug: string;
};

export type FieldType = SectionFieldType;