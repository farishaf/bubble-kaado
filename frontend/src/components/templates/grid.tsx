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
              className={`relative px-4 h-9 inline-flex items-center font-body text-sm rounded-pill border transition-colors ${
                isActive
                  ? 'bg-ink text-paper border-ink'
                  : 'bg-paper text-ink-2 border-muted hover:border-ink-2 hover:text-ink'
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