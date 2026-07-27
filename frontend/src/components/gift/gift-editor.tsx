'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/lib/ui/toast';
import { useAuth } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/client';
import { AuthModal } from '@/components/auth-modal';
import { encodeGift } from '@/lib/gift/encode';
import type { GiftData, GiftField, GiftTemplate } from '@/lib/gift/types';
import { PhotoUploader } from '@/components/editor/photo-uploader';
import { AudioUploader } from '@/components/editor/audio-uploader';
import { EmojiButton } from '@/components/editor/emoji-button';
import { giftPlayers } from './players';
import { GiftQrModal } from './qr-modal';

type Props = { template: GiftTemplate; locale: string; editSlug?: string | null };

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

export function GiftEditor({ template, locale, editSlug = null }: Props) {
  const t = useTranslations('gift.editor');
  const toast = useToast();
  const [data, setData] = useState<GiftData>(() => {
    // Editing a saved card: ignore the local draft, the server copy wins and
    // arrives in the effect below. Otherwise pick the draft back up.
    if (typeof window === 'undefined' || editSlug) return { ...template.defaults };
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
  const qrAfterAuth = useRef(false);
  const [savedSlug, setSavedSlug] = useState<string | null>(() => {
    if (editSlug) return editSlug;
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(SAVED_KEY(template.slug));
  });
  const [loadingCard, setLoadingCard] = useState(Boolean(editSlug));
  // JSON snapshot of the payload at last save; lets us use the short ?s= link
  // only while the local draft still matches what the server has.
  const [savedPayload, setSavedPayload] = useState<string | null>(null);
  const [fragment, setFragment] = useState('');
  const [slugDraft, setSlugDraft] = useState(savedSlug ?? '');
  const [renaming, setRenaming] = useState(false);

  // Opened from the dashboard with ?edit=<slug>: pull the saved card so the
  // form starts from what's actually published. The public GET is enough —
  // it's the same content the recipient sees — and seeding savedPayload here
  // means Save takes the PUT branch and updates in place instead of minting a
  // second card.
  useEffect(() => {
    if (!editSlug) return;
    let alive = true;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/i/${editSlug}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((card: { data?: GiftData }) => {
        if (!alive) return;
        const loaded = { ...template.defaults, ...(card.data ?? {}) };
        setData(loaded);
        setSlugDraft(editSlug);
        setSavedPayload(JSON.stringify(stripEmpty(loaded)));
        try { localStorage.setItem(SAVED_KEY(template.slug), editSlug); } catch { /* ignore */ }
      })
      .catch(() => {
        if (alive) toast.show(t('loadFail'), { variant: 'error' });
      })
      .finally(() => {
        if (alive) setLoadingCard(false);
      });
    return () => {
      alive = false;
    };
    // toast/t are stable for the life of the editor; re-running on them would
    // refetch and stomp edits in progress.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editSlug, template.slug, template.defaults]);

  useEffect(() => {
    let alive = true;
    void encodeGift(stripEmpty(data)).then((f) => {
      if (alive) setFragment(f);
    });
    return () => {
      alive = false;
    };
  }, [data]);

  useEffect(() => {
    // Editing a saved card writes straight to the server, so it must not
    // overwrite the local draft of a *different*, unsaved card of this template.
    if (editSlug) return;
    const id = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY(template.slug), JSON.stringify(data));
      } catch { /* ignore */ }
    }, 300);
    return () => clearTimeout(id);
  }, [data, template.slug, editSlug]);

  const effective = useMemo(
    () => ({ ...template.defaults, ...stripEmpty(data) }),
    [data, template.defaults]
  );

  const allRequiredFilled = template.fields
    .filter((f) => f.required)
    .every((f) => (data[f.key] || '').trim() !== '');

  const shareLink = () => {
    const base = `${window.location.origin}/${locale}/g/${template.slug}`;
    // Saved and unchanged since: use the much shorter slug link (best for QR).
    if (savedSlug && savedPayload === JSON.stringify(stripEmpty(data))) {
      return `${base}?s=${savedSlug}`;
    }
    return `${base}#${fragment}`;
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

  const doSave = async (): Promise<boolean> => {
    // The saved card hasn't arrived yet — saving now would PUT the blank
    // defaults over it.
    if (loadingCard) return false;
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) {
      setAuthOpen(true);
      return false;
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
          setSavedPayload(JSON.stringify(payload));
          toast.show(t('saved'), { variant: 'success' });
          return true;
        }
        if (res.status !== 404) {
          toast.show(t('saveFail'), { variant: 'error' });
          return false;
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
          setSlugDraft(slug);
          setSavedPayload(JSON.stringify(payload));
          try { localStorage.setItem(SAVED_KEY(template.slug), slug); } catch { /* ignore */ }
          toast.show(t('saved'), { variant: 'success' });
          return true;
        }
        if (res.status !== 409) break;
      }
      toast.show(t('saveFail'), { variant: 'error' });
    } catch {
      toast.show(t('saveFail'), { variant: 'error' });
    } finally {
      setSaving(false);
    }
    return false;
  };

  const onSave = () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    void doSave();
  };

  // Mirrors the server's slugRE: lowercase alphanumerics and inner hyphens, 3–62 chars.
  const slugify = (raw: string) =>
    raw.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-{2,}/g, '-').slice(0, 62);

  const slugValid = /^[a-z0-9][a-z0-9-]{1,60}[a-z0-9]$/.test(slugDraft);

  const doRename = async () => {
    if (!savedSlug || !slugValid || slugDraft === savedSlug || renaming) return;
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) {
      setAuthOpen(true);
      return;
    }
    setRenaming(true);
    try {
      const payload = stripEmpty(data);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invitations/${savedSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          slug: slugDraft,
          title: (payload.recipient_name || template.name).trim(),
          data: payload,
        }),
      });
      if (res.ok) {
        setSavedSlug(slugDraft);
        setSavedPayload(JSON.stringify(payload));
        try { localStorage.setItem(SAVED_KEY(template.slug), slugDraft); } catch { /* ignore */ }
        toast.show(t('linkUpdated'), { variant: 'success' });
        return;
      }
      toast.show(res.status === 409 ? t('linkTaken') : t('saveFail'), { variant: 'error' });
    } catch {
      toast.show(t('saveFail'), { variant: 'error' });
    } finally {
      setRenaming(false);
    }
  };

  const hasShortLink = () =>
    Boolean(savedSlug) && savedPayload === JSON.stringify(stripEmpty(data));

  // The QR always encodes the short ?s= link — a long hash link makes the code
  // too dense for phone cameras — so save first when the draft isn't saved yet.
  const onQr = async () => {
    if (saving) return;
    if (!hasShortLink()) {
      if (!user) {
        qrAfterAuth.current = true;
        setAuthOpen(true);
        return;
      }
      if (!(await doSave())) return;
    }
    setQrOpen(true);
  };

  const setField = (key: string, value: string) => {
    setData((d) => ({ ...d, [key]: value }));
  };

  const Player = giftPlayers[template.slug];

  const toolBtn =
    'px-3 h-8 font-body text-[11px] uppercase tracking-wider rounded-sm border border-kd-forest/25 text-kd-forest hover:border-kd-forest hover:bg-kd-forest/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors';

  return (
    <div className="bg-kd-paper min-h-dvh">
      {/* header band: kicker + display title + spine column */}
      <div className="mx-auto max-w-7xl px-6 pt-8 md:pt-10">
        <div className="grid md:grid-cols-[minmax(0,1fr)_auto] gap-6 border-b-2 border-kd-forest pb-6 mb-8">
          <div>
            <a href={`/${locale}/gift`} className="font-body text-sm text-ink-2 hover:text-ink transition-colors">
              ← {t('back')}
            </a>
            <p className="kd-kicker mt-4 text-kd-coral">{t('editing')}</p>
            <h1 className="mt-1 font-display text-3xl md:text-5xl text-kd-forest tracking-[-0.02em] leading-[1.05]">
              {template.name}
            </h1>
            <p className="mt-3 font-body text-sm text-ink-2 max-w-prose leading-[1.55]">{t('linkHint')}</p>
          </div>
          {/* spine treatment — vertical brand strip, desktop only */}
          <div className="hidden md:flex items-stretch gap-3">
            <div className="kd-dots w-10" aria-hidden="true" />
            <div className="bg-kd-forest text-kd-cream px-3 py-4 flex flex-col items-center justify-between">
              <span
                className="font-display text-xl tracking-[0.14em]"
                style={{ writingMode: 'vertical-rl' }}
              >
                Kaado
              </span>
              <span className="font-body text-[10px] tracking-[0.2em]" style={{ writingMode: 'vertical-rl' }}>
                2026
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[400px_minmax(0,1fr)] gap-8 items-start pb-16">
          {/* form column — repeating card-list panels, color-blocked */}
          <div className="order-2 lg:order-1">
            {(template.sections ?? [{ id: 'all', label: template.name, fields: template.fields.map((f) => f.key) }]).map(
              (section, i) => {
                const fields = section.fields
                  .map((key) => template.fields.find((f) => f.key === key))
                  .filter((f): f is GiftField => Boolean(f))
                  .filter((f) => !f.showWhen || (data[f.showWhen.key] ?? '') === f.showWhen.equals);
                const missing = fields.some(
                  (f) => f.required && (data[f.key] || '').trim() === ''
                );
                return (
                  <details
                    key={section.id}
                    open={i === 0}
                    className={`group border border-kd-forest/20 border-b-0 last:border-b first:rounded-t-md last:rounded-b-md overflow-hidden ${
                      i % 2 === 0 ? 'bg-kd-cream' : 'bg-kd-sage/45'
                    }`}
                  >
                    <summary className="flex items-center gap-3 px-4 py-3.5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                      <span aria-hidden className="font-body text-[10px] font-semibold text-kd-coral tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="kd-kicker text-kd-forest">{section.label}</span>
                      {missing && <span aria-hidden className="text-danger font-body text-xs">*</span>}
                      <span className="flex-1" />
                      <span
                        aria-hidden
                        className="text-kd-forest/50 text-xs transition-transform group-open:rotate-90"
                      >
                        ▸
                      </span>
                    </summary>
                    <div className="px-4 pb-5 pt-2 space-y-5 border-t border-kd-forest/15">
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

          {/* preview column — framed panel with forest toolbar */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-24">
            <div className="border border-kd-forest/25 rounded-md overflow-hidden bg-kd-cream">
              <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 bg-kd-forest">
                <div className="flex gap-1 rounded-sm border border-kd-cream/25 p-0.5" role="group" aria-label={t('viewportAria')}>
                  {(['mobile', 'desktop'] as const).map((vp) => (
                    <button
                      key={vp}
                      type="button"
                      onClick={() => setViewport(vp)}
                      aria-pressed={viewport === vp}
                      className={`px-3 h-7 font-body text-[11px] uppercase tracking-wider rounded-sm transition-colors ${
                        viewport === vp ? 'bg-kd-cream text-kd-forest' : 'text-kd-cream/70 hover:text-kd-cream'
                      }`}
                    >
                      {t(vp)}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setPlayerKey((k) => k + 1)}
                  className="px-3 h-7 font-body text-[11px] uppercase tracking-wider rounded-sm text-kd-cream/70 hover:text-kd-cream border border-kd-cream/25 transition-colors"
                >
                  {t('restart')}
                </button>
                <span className="flex-1" />
                <span className="kd-kicker text-kd-cream/60 hidden sm:inline">{t('editing')}</span>
              </div>
              <div className="kd-dots p-4 md:p-6">
                <div
                  className={`mx-auto rounded-md border border-kd-forest/20 overflow-hidden shadow-2 bg-paper transition-all ${
                    viewport === 'mobile' ? 'w-[375px] max-w-full' : 'w-full'
                  }`}
                >
                  <div className="h-[600px] overflow-y-auto overscroll-contain">
                    {Player && <Player key={playerKey} data={effective} />}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 px-3 py-3 border-t border-kd-forest/15">
                <button type="button" onClick={() => void onQr()} disabled={!allRequiredFilled || saving} className={toolBtn}>
                  {t('qr')}
                </button>
                <button type="button" onClick={onOpenTab} disabled={!allRequiredFilled} className={toolBtn}>
                  {t('openTab')}
                </button>
                <button type="button" onClick={onSave} disabled={!allRequiredFilled || saving} className={toolBtn}>
                  {saving ? t('savingBtn') : savedSlug ? t('saveAgain') : t('save')}
                </button>
                <span className="flex-1" />
                <button
                  type="button"
                  onClick={() => void onCopy()}
                  disabled={!allRequiredFilled}
                  className="px-4 h-8 font-body text-[11px] uppercase tracking-wider rounded-sm bg-kd-coral text-kd-cream hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {t('copyLink')}
                </button>
              </div>
            </div>
            {savedSlug && (
              <div className="mt-3 border border-kd-forest/20 rounded-md bg-kd-cream px-4 py-3.5">
                <p className="kd-kicker text-kd-forest">{t('linkLabel')}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="font-body text-xs text-ink-3 break-all">
                    {`/${locale}/g/${template.slug}?s=`}
                  </span>
                  <input
                    aria-label={t('linkLabel')}
                    value={slugDraft}
                    onChange={(e) => setSlugDraft(slugify(e.target.value))}
                    className="flex-1 min-w-[10rem] font-body text-sm bg-paper border border-kd-forest/25 rounded-sm px-2.5 py-1.5 text-ink focus:border-kd-forest focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-kd-forest transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => void doRename()}
                    disabled={!slugValid || slugDraft === savedSlug || renaming}
                    className={toolBtn}
                  >
                    {renaming ? t('savingBtn') : t('linkUpdate')}
                  </button>
                </div>
                <p className="mt-2 font-body text-xs text-ink-3">
                  {slugDraft && !slugValid ? t('linkInvalid') : t('linkHelp')}
                </p>
              </div>
            )}
            {!allRequiredFilled && (
              <p className="mt-3 font-body text-xs text-ink-3">{t('missingRequired')}</p>
            )}
          </div>
        </div>
      </div>
      {authOpen && (
        <AuthModal
          mode="signUp"
          onClose={() => setAuthOpen(false)}
          onSuccess={() =>
            void doSave().then((ok) => {
              if (qrAfterAuth.current) {
                qrAfterAuth.current = false;
                if (ok) setQrOpen(true);
              }
            })
          }
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
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const id = `gift-field-${field.key}`;
  const base =
    'w-full font-body text-sm bg-paper border border-kd-forest/20 rounded-sm px-3 py-2 text-ink placeholder:text-ink-3 focus:border-kd-forest transition-colors';

  const insertEmoji = (emoji: string) => {
    const el = inputRef.current;
    if (!el) {
      onChange(value + emoji);
      return;
    }
    const s = el.selectionStart ?? value.length;
    const e = el.selectionEnd ?? s;
    onChange(value.slice(0, s) + emoji + value.slice(e));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + emoji.length, s + emoji.length);
    });
  };

  if (field.type === 'date') {
    const enabled = value !== '';
    return (
      <div>
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={id} className="font-body text-xs text-ink-2 uppercase tracking-wider">
            {field.label}
          </label>
          <label className="inline-flex items-center gap-1.5 font-body text-xs text-ink-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => onChange(e.target.checked ? new Date().toISOString().slice(0, 10) : '')}
              className="h-3.5 w-3.5 accent-kd-forest"
            />
            {t('toggleDate')}
          </label>
        </div>
        {enabled && (
          <input
            id={id}
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`mt-1.5 ${base}`}
          />
        )}
        {field.help && <p className="mt-1.5 font-body text-xs text-ink-3">{field.help}</p>}
      </div>
    );
  }

  if (field.type === 'toggle') {
    return (
      <div>
        <label className="inline-flex items-center gap-2 font-body text-xs text-ink-2 uppercase tracking-wider cursor-pointer select-none">
          <input
            type="checkbox"
            checked={value === '1'}
            onChange={(e) => onChange(e.target.checked ? '1' : '')}
            className="h-3.5 w-3.5 accent-kd-forest"
          />
          {field.label}
        </label>
        {field.help && <p className="mt-1.5 font-body text-xs text-ink-3">{field.help}</p>}
      </div>
    );
  }

  if (field.type === 'audio') {
    return (
      <div>
        <AudioUploader value={value} onChange={onChange} fieldLabel={field.label} />
        {field.help && <p className="mt-1.5 font-body text-xs text-ink-3">{field.help}</p>}
      </div>
    );
  }

  if (field.type === 'photo-gallery') {
    return (
      <div>
        <PhotoUploader
          value={value ? value.split('\n').filter(Boolean) : []}
          onChange={(urls) => onChange(urls.join('\n'))}
          maxItems={field.maxItems ?? 4}
          fieldLabel={field.label}
          slotHints={field.slotHints}
        />
        {field.help && <p className="mt-1.5 font-body text-xs text-ink-3">{field.help}</p>}
      </div>
    );
  }

  const emojiable = field.type === 'text' || field.type === 'textarea';

  return (
    <div>
      <div className="flex items-center gap-1.5">
        <label htmlFor={id} className="font-body text-xs text-ink-2 uppercase tracking-wider">
          {field.label}
          {field.required && <span aria-hidden> *</span>}
        </label>
        {field.info && (
          <button
            type="button"
            onClick={() => setInfoOpen(true)}
            aria-label={field.info.title}
            className="inline-flex w-4 h-4 items-center justify-center rounded-full border border-muted text-ink-3 hover:text-ink hover:border-ink-2 font-body text-[10px] transition-colors"
          >
            i
          </button>
        )}
        <span className="flex-1" />
        {emojiable && <EmojiButton onPick={insertEmoji} label={t('emoji')} />}
      </div>
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
                className="px-4 h-9 font-body text-xs rounded-sm border border-muted text-ink-2 hover:text-ink hover:border-ink-2 transition-colors"
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
            ref={(el) => { inputRef.current = el; }}
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
            ref={(el) => { inputRef.current = el; }}
            type={field.type === 'url' ? 'url' : 'text'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            className={base}
          />
        )}
      </div>
      <div className="mt-1.5 flex items-start gap-3">
        {field.help && <p className="font-body text-xs text-ink-3 flex-1">{field.help}</p>}
        {field.maxLength !== undefined && (
          <p
            className={`ml-auto shrink-0 font-body text-[10px] tabular-nums ${
              value.length >= field.maxLength ? 'text-kd-coral' : 'text-ink-3'
            }`}
            aria-live="polite"
          >
            {value.length} / {field.maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
