'use client';

import { useTranslations } from 'next-intl';
import { SECTIONS } from '@/lib/templates/sections';
import { SECTION_ORDER } from '@/lib/templates/sections';
import { previewRegistry } from '@/lib/templates/registry';
import type { Accent, FormData } from '@/lib/templates/types';

type Props = {
  templateName: string;
  accent: Accent;
  data: FormData;
};

export function FullPagePreview({ templateName, accent, data }: Props) {
  const t = useTranslations('editor');
  const sectionTypes = SECTION_ORDER;

  return (
    <div data-animate="preview-panel" className="bg-paper rounded-lg border border-muted-2 shadow-2 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-muted-2 bg-paper-2">
        <p className="font-body text-[10px] uppercase tracking-[0.2em] text-ink-2">{t('fullPreview')}</p>
        <span className="font-body text-[10px] text-ink-3">{templateName}</span>
      </div>
      <div className="max-h-[80vh] overflow-y-auto">
        {sectionTypes
          .filter((stype) => data[stype]?.enabled !== false)
          .map((stype) => {
            const Preview = previewRegistry[stype];
            const sectionData = data[stype] || {};
            return <Preview key={stype} data={sectionData} accent={accent} />;
          })}
        {sectionTypes.every((stype) => data[stype]?.enabled === false) && (
          <p className="px-6 py-16 text-center font-body text-sm text-ink-3 italic">
            {t('allDisabledHint')}
          </p>
        )}
      </div>
    </div>
  );
}