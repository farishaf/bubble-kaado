'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/lib/ui/toast';
import { useAuth } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/client';
import { AuthModal } from '@/components/auth-modal';
import { encodeGift } from '@/lib/gift/encode';
import type { GiftData, GiftField, GiftTemplate } from '@/lib/gift/types';
import { PhotoUploader } from '@/components/editor/photo-uploader';
import { giftPlayers } from './players';
import { GiftQrModal } from './qr-modal';

type Props = { template: GiftTemplate; locale: string };

const DRAFT_KEY = (slug: string) => `kaado:draft:${slug}`;
const SAVED_KEY = (slug: string) => `kaado:saved:${slug}`;

const randomSlug = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

function stripEmpty(data: GiftData): GiftData {
  const out: GiftData = {};
  for (const [k, v] of Object.entries(data)) {
    if (v.trim() !== '') out[k] = v;
  }
  return out;
}

export function GiftEditor({ template, locale }: Props) {
  const t = useTranslations('gift.editor');
  const toast = useToast();
  const [data, setData] = useState<GiftData>(() => {
    if (typeof window === 'undefined') return { ...template.defaults };
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY(template.slug));
      if (raw) return { ...template.defaults, ...(JSON.parse(raw) as GiftData) };
    } catch { /* ignore */ }
    return { ...template.defaults };
  });
  const [viewport, setViewport] = useState<'mobile' | 'desktop'>('mobile');
  const [playerKey, setPlayerKey] = useState(0);
  const [qrOpen, setQrOpen] = useState(false);
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSlug, setSavedSlug] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(SAVED_KEY(template.slug));
  });

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY(template.slug), JSON.stringify(data));
      } catch { /* ignore */ }
    }, 300);
    return () => clearTimeout(id);
  }, [data, template.slug]);

  const effective = useMemo(
    () => ({ ...template.defaults, ...stripEmpty(data) }),
    [data, template.defaults]
  );

  const allRequiredFilled = template.fields
    .filter((f) => f.required)
    .every((f) => (data[f.key] || '').trim() !== '');

  const shareLink = () => {
    const payload = stripEmpty(data);
    return `${window.location.origin}/${locale}/g/${template.slug}#${encodeGift(payload)}`;
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink());
      toast.show(t('copied'), { variant: 'success' });
    } catch {
      toast.show(t('copyFail'), { variant: 'error' });
    }
  };

  const onOpenTab = () => {
    window.open(shareLink(), '_blank', 'noopener');
  };

  const doSave = async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) {
      setAuthOpen(true);
      return;
    }
    setSaving(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL;
      const payload = stripEmpty(data);
      const title = (payload.recipient_name || template.name).trim();
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      if (savedSlug) {
        const res = await fetch(`${base}/api/invitations/${savedSlug}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ title, data: payload }),
        });
        if (res.ok) {
          toast.show(t('saved'), { variant: 'success' });
          return;
        }
        if (res.status !== 404) {
          toast.show(t('saveFail'), { variant: 'error' });
          return;
        }
        // saved card no longer exists (or belongs to another account) — create a new one
      }

      // ponytail: one retry on slug collision; 6 random base36 chars rarely collide
      for (let attempt = 0; attempt < 2; attempt++) {
        const slug = randomSlug(template.slug);
        const res = await fetch(`${base}/api/invitations`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            template_slug: template.slug,
            title,
            slug,
            status: 'published',
            data: payload,
          }),
        });
        if (res.ok) {
          setSavedSlug(slug);
          try { localStorage.setItem(SAVED_KEY(template.slug), slug); } catch { /* ignore */ }
          toast.show(t('saved'), { variant: 'success' });
          return;
        }
        if (res.status !== 409) break;
      }
      toast.show(t('saveFail'), { variant: 'error' });
    } catch {
      toast.show(t('saveFail'), { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const onSave = () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    void doSave();
  };

  const setField = (key: string, value: string) => {
    setData((d) => ({ ...d, [key]: value }));
  };

  const Player = giftPlayers[template.slug];

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:py-10">
      <div className="mb-8">
        <a href={`/${locale}/gift`} className="font-body text-sm text-ink-2 hover:text-ink transition-colors">
          ← {t('back')}
        </a>
        <p className="mt-3 font-body text-[10px] uppercase tracking-[0.2em] text-ink-2">{t('editing')}</p>
        <h1 className="font-display text-2xl md:text-3xl text-ink">{template.name}</h1>
        <p className="mt-2 font-body text-sm text-ink-2 max-w-prose">{t('linkHint')}</p>
      </div>

      <div className="grid lg:grid-cols-[400px_minmax(0,1fr)] gap-10 items-start">
        <div className="order-2 lg:order-1 space-y-3">
          {(template.sections ?? [{ id: 'all', label: template.name, fields: template.fields.map((f) => f.key) }]).map(
            (section, i) => {
              const fields = section.fields
                .map((key) => template.fields.find((f) => f.key === key))
                .filter((f): f is GiftField => Boolean(f));
              const missing = fields.some(
                (f) => f.required && (data[f.key] || '').trim() === ''
              );
              return (
                <details
                  key={section.id}
                  open={i === 0}
                  className="group rounded-lg border border-muted bg-paper"
                >
                  <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                    <span className="font-body text-xs uppercase tracking-[0.14em] text-ink">
                      {section.label}
                    </span>
                    {missing && <span aria-hidden className="text-danger font-body text-xs">*</span>}
                    <span className="flex-1" />
                    <span
                      aria-hidden
                      className="text-ink-3 text-xs transition-transform group-open:rotate-90"
                    >
                      ▸
                    </span>
                  </summary>
                  <div className="px-4 pb-4 pt-1 space-y-5 border-t border-muted-2">
                    {fields.map((field) => (
                      <GiftFieldInput
                        key={field.key}
                        field={field}
                        value={data[field.key] ?? ''}
                        onChange={(v) => setField(field.key, v)}
                      />
                    ))}
                  </div>
                </details>
              );
            }
          )}
        </div>

        <div className="order-1 lg:order-2 lg:sticky lg:top-24">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex gap-1 rounded-pill border border-muted p-1" role="group" aria-label={t('viewportAria')}>
              {(['mobile', 'desktop'] as const).map((vp) => (
                <button
                  key={vp}
                  type="button"
                  onClick={() => setViewport(vp)}
                  aria-pressed={viewport === vp}
                  className={`px-3 h-8 font-body text-xs rounded-pill transition-colors ${
                    viewport === vp ? 'bg-ink text-paper' : 'text-ink-2 hover:text-ink'
                  }`}
                >
                  {t(vp)}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPlayerKey((k) => k + 1)}
              className="px-3 h-8 font-body text-xs rounded-pill border border-muted text-ink-2 hover:text-ink hover:border-ink-2 transition-colors"
            >
              {t('restart')}
            </button>
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => setQrOpen(true)}
              disabled={!allRequiredFilled}
              className="px-3 h-8 font-body text-xs rounded-pill border border-muted text-ink-2 hover:text-ink hover:border-ink-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('qr')}
            </button>
            <button
              type="button"
              onClick={onOpenTab}
              disabled={!allRequiredFilled}
              className="px-3 h-8 font-body text-xs rounded-pill border border-muted text-ink-2 hover:text-ink hover:border-ink-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('openTab')}
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={!allRequiredFilled || saving}
              className="px-3 h-8 font-body text-xs rounded-pill border border-muted text-ink-2 hover:text-ink hover:border-ink-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? t('savingBtn') : savedSlug ? t('saveAgain') : t('save')}
            </button>
            <button
              type="button"
              onClick={() => void onCopy()}
              disabled={!allRequiredFilled}
              className="px-4 h-8 font-body text-xs rounded-pill bg-ink text-paper hover:bg-ink-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('copyLink')}
            </button>
          </div>
          {!allRequiredFilled && (
            <p className="mb-3 font-body text-xs text-ink-3">{t('missingRequired')}</p>
          )}
          <div
            className={`mx-auto rounded-xl border border-muted overflow-hidden shadow-2 transition-all ${
              viewport === 'mobile' ? 'w-[375px] max-w-full' : 'w-full'
            }`}
          >
            <div className="h-[640px] overflow-y-auto overscroll-contain">
              {Player && <Player key={playerKey} data={effective} />}
            </div>
          </div>
        </div>
      </div>
      {authOpen && (
        <AuthModal
          mode="signUp"
          onClose={() => setAuthOpen(false)}
          onSuccess={() => void doSave()}
        />
      )}
      {qrOpen && (
        <GiftQrModal
          link={shareLink()}
          theme={effective.theme || 'rose'}
          recipientName={(data.recipient_name || '').trim()}
          onClose={() => setQrOpen(false)}
        />
      )}
    </div>
  );
}

function GiftFieldInput({
  field,
  value,
  onChange,
}: {
  field: GiftField;
  value: string;
  onChange: (v: string) => void;
}) {
  const t = useTranslations('gift.editor');
  const [infoOpen, setInfoOpen] = useState(false);
  const id = `gift-field-${field.key}`;
  const base =
    'w-full font-body text-sm bg-paper border border-muted rounded-md px-3 py-2 text-ink placeholder:text-ink-3 focus:border-ink-2 transition-colors';

  if (field.type === 'photo-gallery') {
    return (
      <div>
        <PhotoUploader
          value={value ? value.split('\n').filter(Boolean) : []}
          onChange={(urls) => onChange(urls.join('\n'))}
          maxItems={field.maxItems ?? 4}
          fieldLabel={field.label}
        />
        {field.help && <p className="mt-1.5 font-body text-xs text-ink-3">{field.help}</p>}
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={id} className="font-body text-xs text-ink-2 uppercase tracking-wider">
        {field.label}
        {field.required && <span aria-hidden> *</span>}
      </label>
      {field.info && (
        <button
          type="button"
          onClick={() => setInfoOpen(true)}
          aria-label={field.info.title}
          className="ml-1.5 inline-flex w-4 h-4 items-center justify-center rounded-full border border-muted text-ink-3 hover:text-ink hover:border-ink-2 font-body text-[10px] align-middle transition-colors"
        >
          i
        </button>
      )}
      {infoOpen && field.info && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-ink/40"
          role="dialog"
          aria-modal="true"
          aria-label={field.info.title}
          onClick={(e) => {
            if (e.target === e.currentTarget) setInfoOpen(false);
          }}
        >
          <div className="bg-paper rounded-lg shadow-3 p-6 w-full max-w-sm">
            <h2 className="font-display text-lg text-ink mb-3">{field.info.title}</h2>
            <p className="font-body text-sm text-ink-2 leading-[1.55]">{field.info.body}</p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setInfoOpen(false)}
                className="px-4 h-9 font-body text-xs rounded-pill border border-muted text-ink-2 hover:text-ink hover:border-ink-2 transition-colors"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mt-1.5">
        {field.type === 'textarea' ? (
          <textarea
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            rows={field.key === 'letter' ? 6 : 4}
            className={base}
          />
        ) : field.type === 'select' ? (
          <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={base}>
            {field.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={id}
            type={field.type === 'url' ? 'url' : field.type === 'date' ? 'date' : 'text'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            className={base}
          />
        )}
      </div>
      {field.help && <p className="mt-1.5 font-body text-xs text-ink-3">{field.help}</p>}
    </div>
  );
}
