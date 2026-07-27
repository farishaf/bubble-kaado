'use client';

import Link from 'next/link';
import { previewRegistry } from '@/lib/templates/registry';
import type { Template } from '@/lib/templates/types';

type Props = {
  template: Template;
  basePath: string;
};

export function TemplateGridCard({ template, basePath }: Props) {
  const Cover = previewRegistry.cover;
  const accent = template.accent;
  const couple: { [k: string]: string } = {
    couple_name_1: 'Rina',
    couple_name_2: 'Budi',
    wedding_date: '2026-12-12',
  };
  return (
    <Link
      href={`${basePath}/${template.slug}`}
      data-animate="design-card"
      className="group block"
    >
      <div className="relative overflow-hidden rounded-sm border border-kd-forest/20 kd-sheet transition-shadow group-hover:shadow-2">
        <span aria-hidden className="kd-tag z-10" />
        <div className="aspect-[3/4] w-full overflow-hidden">
          <Cover data={couple} accent={accent} />
        </div>
      </div>
      <div className="mt-3 px-1">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-lg text-kd-forest min-w-0 truncate">{template.name}</h3>
          <span className="font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-kd-coral-ink whitespace-nowrap">
            {template.category}
          </span>
        </div>
        <p className="mt-1 font-body text-sm text-ink-2 leading-[1.45]">
          {template.description}
        </p>
      </div>
    </Link>
  );
}