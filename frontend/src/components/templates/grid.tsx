'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Template, Category } from '@/lib/templates/types';
import { TemplateGridCard } from './grid-card';

type Props = {
  templates: Template[];
  categories: Array<{ key: Category; label: string }>;
  basePath: string;
};

export function TemplateGrid({ templates, categories, basePath }: Props) {
  const t = useTranslations('design');
  const [active, setActive] = useState<Category>('all');

  const filtered = active === 'all' ? templates : templates.filter((tpl) => tpl.category === active);

  return (
    <>
      <div className="mt-12 flex flex-wrap gap-2" role="tablist" aria-label={t('filterAria')}>
        {categories.map((c) => {
          const isActive = active === c.key;
          return (
            <button
              key={c.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(c.key)}
              data-animate="filter-chip"
              className={`relative px-4 h-9 inline-flex items-center whitespace-nowrap font-body text-[11px] font-semibold uppercase tracking-[0.12em] rounded-sm border transition-colors ${
                isActive
                  ? 'bg-kd-forest text-kd-cream border-kd-forest'
                  : 'bg-kd-cream text-ink-2 border-kd-forest/25 hover:border-kd-forest hover:text-kd-forest'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>
      <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {filtered.map((tpl) => (
          <TemplateGridCard key={tpl.id} template={tpl} basePath={basePath} />
        ))}
      </div>
    </>
  );
}