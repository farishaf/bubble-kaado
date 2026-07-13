'use client';

import { useTranslations } from 'next-intl';
import { SECTIONS } from '@/lib/templates/sections';
import { PhotoUploader } from './photo-uploader';
import type { SectionData, SectionField, SectionType } from '@/lib/templates/types';

type Props = {
  sectionType: SectionType;
  data: SectionData;
  defaults?: Record<string, string | string[]>;
  onChange: (next: SectionData) => void;
  onToggle: (enabled: boolean) => void;
};

export function SectionForm({ sectionType, data, defaults = {}, onChange, onToggle }: Props) {
  const t = useTranslations('editor');
  const def = SECTIONS[sectionType];
  const enabled = data.enabled !== false;

  const handleField = (key: string, value: string) => {
    onChange({ ...data, [key]: value });
  };
  const handleList = (key: string, list: string[]) => {
    onChange({ ...data, [key]: list });
  };
  const handleToggle = (next: boolean) => {
    onChange({ ...data, enabled: next });
  };

  return (
    <div data-animate="form-field" className="space-y-6">
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-muted-2">
        <div className="min-w-0">
          <h2 className="font-display text-2xl text-ink">{def.title}</h2>
          <p className="mt-1 font-body text-sm text-ink-2">{def.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 pt-1">
          <span className="hidden sm:inline font-body text-[11px] uppercase tracking-wider text-ink-3">
            {enabled ? t('sectionOn') : t('sectionOff')}
          </span>
          <SectionToggle enabled={enabled} onChange={handleToggle} />
        </div>
      </div>

      {enabled ? (
        <div className="space-y-5">
          {def.fields.map((field) => (
            <FieldRenderer
              key={field.key}
              field={field}
              value={data[field.key]}
              defaultValue={defaults[field.key]}
              onChange={(v) => handleField(field.key, v)}
              onListChange={(list) => handleList(field.key, list)}
            />
          ))}
          <p className="font-body text-[11px] text-ink-3 italic pt-2">{t('sectionTip')}</p>
        </div>
      ) : (
        <p className="font-body text-sm text-ink-3 italic py-6 text-center">
          {t('sectionDisabledMessage')}
        </p>
      )}
    </div>
  );
}

function SectionToggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  const t = useTranslations('editor');
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={enabled ? t('sectionToggleOff') : t('sectionToggleOn')}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
        enabled ? 'bg-accent' : 'bg-muted'
      }`}
    >
      <span
        aria-hidden
        className={`inline-block h-5 w-5 transform rounded-full bg-paper shadow-1 transition-transform ${
          enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

function FieldRenderer({
  field,
  value,
  defaultValue,
  onChange,
  onListChange,
}: {
  field: SectionField;
  value: string | string[] | boolean | undefined;
  defaultValue: string | string[] | undefined;
  onChange: (v: string) => void;
  onListChange: (v: string[]) => void;
}) {
  const t = useTranslations('editor');
  const baseInput =
    'mt-1 w-full px-3 bg-paper-2 border border-muted rounded-md font-body text-ink focus:border-accent focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  if (field.type === 'photo-gallery') {
    return (
      <PhotoUploader
        value={Array.isArray(value) ? value : []}
        onChange={onListChange}
        maxItems={field.maxItems ?? 12}
        fieldLabel={field.label}
      />
    );
  }

  const rawStr = typeof value === 'string' ? value : '';
  const hasUserValue = rawStr !== '';
  const fallback = typeof defaultValue === 'string' ? defaultValue : '';
  const showFallback = !hasUserValue && fallback !== '';
  const str = hasUserValue ? rawStr : fallback;

  if (field.type === 'textarea') {
    return (
      <label className="block">
        <span className="flex items-baseline justify-between mb-1">
          <span className="font-body text-xs text-ink-2 uppercase tracking-wider">
            {field.label}
            {field.required && <span className="text-accent ml-1">*</span>}
          </span>
          {field.maxLength && (
            <span className="font-body text-[10px] text-ink-3 tabular-nums">
              {str.length}/{field.maxLength}
            </span>
          )}
        </span>
        <textarea
          value={str}
          onChange={(e) => onChange(e.target.value)}
          onInput={(e) => onChange((e.target as HTMLTextAreaElement).value)}
          required={field.required}
          maxLength={field.maxLength}
          rows={5}
          placeholder={showFallback ? undefined : field.placeholder}
          autoComplete="off"
          spellCheck={false}
          className={`${baseInput} py-3 leading-[1.55] resize-none min-h-[7rem]`}
        />
        {showFallback && <DefaultHint />}
      </label>
    );
  }

  const showCount = field.maxLength && field.type !== 'date' && field.type !== 'time';
  return (
    <label className="block">
      <span className="flex items-baseline justify-between mb-1">
        <span className="font-body text-xs text-ink-2 uppercase tracking-wider">
          {field.label}
          {field.required && <span className="text-accent ml-1">*</span>}
        </span>
        {showCount && (
          <span className="font-body text-[10px] text-ink-3 tabular-nums">
            {str.length}/{field.maxLength}
          </span>
        )}
      </span>
      <input
        type={field.type}
        value={str}
        onChange={(e) => onChange(e.target.value)}
        onInput={(e) => onChange((e.target as HTMLInputElement).value)}
        required={field.required}
        maxLength={field.maxLength}
        placeholder={showFallback ? undefined : field.placeholder}
        autoComplete="off"
        className={`${baseInput} h-11`}
      />
      {showFallback && <DefaultHint />}
    </label>
  );
}

function DefaultHint() {
  const t = useTranslations('editor');
  return (
    <p className="mt-1.5 font-body text-[10px] text-ink-3">
      {t('defaultFromWeddingDate')}
    </p>
  );
}