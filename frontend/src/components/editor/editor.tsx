'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useAuth } from '@/lib/auth/context';
import { useToast } from '@/lib/ui/toast';
import { Spinner } from '@/lib/ui/spinner';
import { SECTIONS } from '@/lib/templates/sections';
import type { FormData, SaveResponse, SectionData, Template } from '@/lib/templates/types';
import { emptyFormData } from '@/lib/templates/data';
import { SectionForm } from './section-form';
import { FullPagePreview } from './full-page-preview';
import { SaveSuccessModal } from './save-modal';

gsap.registerPlugin(useGSAP);

type Props = { template: Template; locale: string };

const DRAFT_KEY = (slug: string) => `lumio:draft:${slug}`;

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function resolveDefaults(d: FormData): FormData {
  const r: FormData = { ...d };
  const wd = (r.cover?.wedding_date as string) || '';
  if (r.event?.enabled !== false && !r.event?.date && wd) {
    r.event = { ...(r.event || {}), date: wd };
  }
  return r;
}

export function Editor({ template, locale }: Props) {
  const t = useTranslations('editor');
  const tToast = useTranslations('toast');
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState<FormData>(() => {
    if (typeof window === 'undefined') return emptyFormData(template);
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY(template.slug));
      if (raw) {
        const parsed = JSON.parse(raw) as FormData;
        const empty = emptyFormData(template);
        const out: FormData = { ...empty };
        for (const stype of template.sections) {
          out[stype] = { ...empty[stype], ...(parsed[stype] || {}) };
        }
        return out;
      }
    } catch { /* ignore */ }
    return emptyFormData(template);
  });
  const [activeSection, setActiveSection] = useState<string>(template.sections[0] || 'cover');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SaveResponse | null>(null);
  const scopeRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY(template.slug), JSON.stringify(data));
      } catch { /* ignore */ }
    }, 300);
    return () => clearTimeout(id);
  }, [data, template.slug]);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set('[data-animate="editor-header"]', { autoAlpha: 0, y: 16 });
      gsap.to('[data-animate="editor-header"]', { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power2.out', delay: 0.08 });
      gsap.from('[data-animate="preview-panel"]', { autoAlpha: 0, y: 24, duration: 0.7, ease: 'power2.out', delay: 0.2 });
    });
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set('[data-animate="editor-header"], [data-animate="preview-panel"]', { autoAlpha: 1, y: 0 });
    });
  }, { scope: scopeRef });

  useEffect(() => {
    if (!formRef.current) return;
    const container = formRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => ({ id: e.target.id, top: e.boundingClientRect.top }))
          .sort((a, b) => a.top - b.top);
        if (visible[0]?.id) {
          const stype = visible[0].id.replace('section-', '');
          if (stype) setActiveSection(stype);
        }
      },
      { root: container, rootMargin: '-15% 0px -70% 0px', threshold: 0 }
    );
    container.querySelectorAll('[data-section-anchor]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [template.sections]);

  const updateSection = (stype: string, next: SectionData) => {
    setData((d) => ({ ...d, [stype]: next }));
    setError(null);
  };

  const openAuth = (mode: 'signIn' | 'signUp') => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lumio:open-auth', { detail: { mode } }));
    }
  };

  const isEnabled = (stype: string) => data[stype]?.enabled !== false;

  const allRequiredFilled = template.sections.every((stype) => {
    if (!isEnabled(stype)) return true;
    const def = SECTIONS[stype];
    if (!def) return true;
    const effective = resolveDefaults(data);
    return def.fields
      .filter((f) => f.required)
      .every((f) => {
        const v = effective[stype]?.[f.key];
        if (Array.isArray(v)) return v.length > 0;
        return typeof v === 'string' && v.trim() !== '';
      });
  });

  const defaultsFor = (stype: string): Record<string, string | string[]> => {
    if (stype !== 'event') return {};
    return { date: (data.cover?.wedding_date as string) || '' };
  };

  const onSave = async () => {
    setError(null);
    if (!user) {
      openAuth('signUp');
      return;
    }
    setSaving(true);
    try {
      const resolved = resolveDefaults(data);
      const cover = resolved.cover || {};
      const n1 = (cover.couple_name_1 as string) || 'anda';
      const n2 = (cover.couple_name_2 as string) || 'pasangan';
      const slug = slugify(`${n1}-dan-${n2}-${Date.now().toString(36).slice(-4)}`);
      const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiBase}/api/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_slug: template.slug,
          title: `${n1} & ${n2}`,
          slug,
          data: resolved,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error ?? t('errorSave'));
        toast.show(tToast('saveFail'), { variant: 'error' });
        return;
      }
      const json = (await res.json()) as SaveResponse;
      setResult(json);
      toast.show(tToast('saved'), { variant: 'success' });
    } catch {
      setError(t('errorSave'));
      toast.show(tToast('saveFail'), { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const scrollToSection = useCallback((stype: string) => {
    setActiveSection(stype);
    const el = document.getElementById(`section-${stype}`);
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }, []);

  return (
    <>
      <div ref={scopeRef}>
        <div data-animate="editor-header" className="border-b border-muted-2 bg-paper-2 sticky top-16 z-30">
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0 flex items-center gap-3">
              <a href={`/${locale}/design`} className="font-body text-sm text-ink-2 hover:text-ink transition-colors hidden sm:inline">
                ← {t('changeTemplate')}
              </a>
              <div className="min-w-0">
                <p className="font-body text-[10px] uppercase tracking-[0.2em] text-ink-2">{t('editingTemplate')}</p>
                <h1 className="font-display text-xl text-ink truncate">{template.name}</h1>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void onSave()}
              disabled={saving || !allRequiredFilled}
              className="font-body text-sm px-5 h-10 inline-flex items-center gap-2 bg-ink text-paper rounded-pill hover:bg-ink-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving && <Spinner size={14} />}
              {saving ? t('saving') : user ? t('save') : t('saveAndSignup')}
            </button>
          </div>
          {error && <p role="alert" className="mx-auto max-w-7xl px-6 pb-3 font-body text-sm text-danger">{error}</p>}
        </div>

        <div className="mx-auto max-w-7xl px-6 py-8 md:py-10">
          <div className="grid lg:grid-cols-[1fr_420px] gap-8 lg:gap-12 items-start">
            <div className="min-w-0">
              <nav className="flex flex-wrap gap-2 mb-6" aria-label={t('sectionsAria')}>
                {template.sections.map((stype) => {
                  const def = SECTIONS[stype];
                  const isActive = activeSection === stype;
                  const enabled = isEnabled(stype);
                  return (
                    <button
                      key={stype}
                      type="button"
                      onClick={() => scrollToSection(stype)}
                      aria-current={isActive ? 'true' : undefined}
                      className={`px-3 h-8 inline-flex items-center gap-1.5 font-body text-xs rounded-pill border transition-colors ${
                        isActive
                          ? 'bg-ink text-paper border-ink'
                          : enabled
                            ? 'bg-paper text-ink-2 border-muted hover:border-ink-2 hover:text-ink'
                            : 'bg-paper-2 text-ink-3 border-muted-2 opacity-70'
                      }`}
                      title={enabled ? undefined : t('sectionOff')}
                    >
                      {def?.title || stype}
                      {!enabled && <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-ink-3" />}
                    </button>
                  );
                })}
              </nav>
              <div ref={formRef} className="max-h-[calc(100vh-260px)] overflow-y-auto pr-2 space-y-12">
                {template.sections.map((stype) => {
                  const def = SECTIONS[stype];
                  if (!def) return null;
                  return (
                    <section
                      key={stype}
                      id={`section-${stype}`}
                      data-section-anchor
                      className="scroll-mt-4"
                    >
                      <SectionForm
                        sectionType={stype}
                        data={data[stype] || {}}
                        defaults={defaultsFor(stype)}
                        onChange={(next) => updateSection(stype, next)}
                        onToggle={() => { /* handled in SectionForm via onChange */ }}
                      />
                    </section>
                  );
                })}
              </div>
            </div>
            <div className="lg:sticky lg:top-44">
              <FullPagePreview
                templateName={template.name}
                accent={template.accent}
                data={data}
              />
            </div>
          </div>
        </div>
      </div>
      <SaveSuccessModal
        open={result !== null}
        result={result}
        onClose={() => setResult(null)}
      />
    </>
  );
}