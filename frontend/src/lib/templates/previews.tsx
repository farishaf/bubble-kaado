'use client';

import type { SectionData, Accent, SectionType } from './types';
import { SECTIONS } from './sections';

type PreviewProps = {
  data: SectionData;
  accent: Accent;
};

const accentMap: Record<Accent, { bg: string; text: string; muted: string; border: string; surface: string }> = {
  rose:   { bg: 'bg-paper',     text: 'text-ink',   muted: 'text-ink-2',  border: 'border-muted-2', surface: 'bg-paper-2' },
  olive:  { bg: 'bg-paper',     text: 'text-ink',   muted: 'text-ink-2',  border: 'border-muted-2', surface: 'bg-paper-2' },
  rust:   { bg: 'bg-paper',     text: 'text-ink',   muted: 'text-ink-2',  border: 'border-muted-2', surface: 'bg-paper-2' },
  ink:    { bg: 'bg-ink',       text: 'text-paper', muted: 'text-paper/70', border: 'border-paper/20', surface: 'bg-ink' },
  mauve:  { bg: 'bg-paper-2',   text: 'text-ink',   muted: 'text-ink-2',  border: 'border-muted-2', surface: 'bg-paper' },
  sand:   { bg: 'bg-accent-2',  text: 'text-ink',   muted: 'text-ink-2',  border: 'border-ink',   surface: 'bg-accent-2' },
};

const accentBar: Record<Accent, string> = {
  rose: 'bg-accent', olive: 'bg-accent', rust: 'bg-accent', ink: 'bg-paper', mauve: 'bg-accent', sand: 'bg-ink',
};

function fmtDate(d?: string) {
  if (!d) return '';
  return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d));
}
function fmtTime(t?: string) {
  if (!t) return '';
  return `${t} WIB`;
}
export function CoverPreview({ data, accent }: PreviewProps) {
  const c = accentMap[accent];
  const isDark = accent === 'ink';
  return (
    <section data-section="cover" className={`${c.bg} ${c.text} px-6 py-20 md:py-28 text-center`}>
      <p className={`font-body text-xs uppercase tracking-[0.25em] ${c.muted}`}>Undangan Pernikahan</p>
      <h2 className="mt-4 font-display text-4xl md:text-6xl leading-[1.05] tracking-[-0.02em]">
        {(data.couple_name_1 as string) || 'Rina'}
        <span className={`block ${isDark ? 'text-paper' : 'text-accent'} my-2 text-3xl md:text-4xl`}>&</span>
        {(data.couple_name_2 as string) || 'Budi'}
      </h2>
      <div className={`mx-auto mt-8 h-px w-12 ${accentBar[accent]}`} />
      <p className={`mt-8 font-body text-sm md:text-base ${c.muted}`}>
        {data.wedding_date ? fmtDate(data.wedding_date as string) : 'Tanggal kalian'}
      </p>
      {Boolean(data.opening_quote) && (
        <p className={`mt-6 max-w-md mx-auto font-body text-sm ${c.muted} italic leading-[1.6]`}>
          {data.opening_quote as string}
        </p>
      )}
    </section>
  );
}

export function QuotePreview({ data, accent }: PreviewProps) {
  const c = accentMap[accent];
  return (
    <section data-section="quote" className={`${c.bg} ${c.text} px-6 py-16 md:py-20 text-center`}>
      <div className="mx-auto max-w-2xl">
        <p className="font-display text-2xl md:text-3xl leading-[1.3] italic">
          &ldquo;{data.quote_text as string || 'Kutipan singkat yang istimewa'}&rdquo;
        </p>
        {Boolean(data.quote_source) && (
          <p className={`mt-4 font-body text-xs uppercase tracking-[0.2em] ${c.muted}`}>
            {data.quote_source as string}
          </p>
        )}
      </div>
    </section>
  );
}

export function CouplePreview({ data, accent }: PreviewProps) {
  const c = accentMap[accent];
  return (
    <section data-section="couple" className={`${c.surface} ${c.text} px-6 py-16 md:py-20`}>
      <div className="mx-auto max-w-4xl grid md:grid-cols-2 gap-10 md:gap-16 text-center md:text-left">
        {([
          { prefix: 'groom', label: 'Mempelai Pria' },
          { prefix: 'bride', label: 'Mempelai Wanita' },
        ] as const).map(({ prefix, label }) => {
          const name = data[`${prefix}_name`] as string;
          const parents = data[`${prefix}_parents`] as string;
          const photo = (data[`${prefix}_photo`] as string[]) || [];
          return (
            <div key={prefix} className="flex flex-col items-center">
              {photo.length > 0 ? (
                <img
                  src={photo[0]}
                  alt={name || label}
                  className="w-40 h-52 md:w-48 md:h-60 object-cover rounded-md border border-muted-2"
                />
              ) : (
                <div className="w-40 h-52 md:w-48 md:h-60 rounded-md border border-dashed border-muted flex items-center justify-center">
                  <span className={`font-body text-xs uppercase tracking-widest ${c.muted}`}>Foto</span>
                </div>
              )}
              <p className={`mt-4 font-body text-xs uppercase tracking-[0.2em] ${c.muted}`}>{label}</p>
              <h3 className="mt-2 font-display text-2xl">{name || `${label}`}</h3>
              {Boolean(parents) && (
                <p className={`mt-1 font-body text-sm ${c.muted}`}>Putri/Putra dari {parents}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function EventPreview({ data, accent }: PreviewProps) {
  const c = accentMap[accent];
  const name = data.name as string;
  const date = data.date as string;
  const time = data.time as string;
  const venue = data.venue as string;
  const address = data.address as string;
  const mapUrl = data.map_url as string;
  if (!name && !venue && !date) return null;
  return (
    <section data-section="event" className={`${c.bg} ${c.text} px-6 py-16 md:py-20`}>
      <div className="mx-auto max-w-md text-center">
        <p className={`font-body text-xs uppercase tracking-[0.2em] ${c.muted}`}>
          Detail Acara
        </p>
        <div className={`mx-auto mt-6 mb-8 h-px w-10 ${accentBar[accent]}`} />
        {name && (
          <p className={`font-body text-xs uppercase tracking-[0.2em] ${c.muted}`}>{name}</p>
        )}
        {date && (
          <p className="mt-2 font-display text-2xl leading-[1.15]">
            {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date))}
          </p>
        )}
        {time && (
          <p className={`mt-1 font-body text-sm ${c.muted}`}>{fmtTime(time)}</p>
        )}
        {venue && (
          <p className="mt-5 font-display text-lg">{venue}</p>
        )}
        {address && (
          <p className={`mt-1 font-body text-sm ${c.muted} leading-[1.55]`}>{address}</p>
        )}
        {mapUrl && (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block font-body text-xs underline underline-offset-4"
          >
            Buka di Maps →
          </a>
        )}
      </div>
    </section>
  );
}

export function StoryPreview({ data, accent }: PreviewProps) {
  const c = accentMap[accent];
  return (
    <section data-section="story" className={`${c.surface} ${c.text} px-6 py-16 md:py-20`}>
      <div className="mx-auto max-w-2xl">
        <p className={`text-center font-body text-xs uppercase tracking-[0.2em] ${c.muted} mb-3`}>Cerita Kami</p>
        <h2 className="text-center font-display text-3xl md:text-4xl mb-8">Bagaimana kami bertemu</h2>
        <p className="font-body text-base md:text-lg leading-[1.7] whitespace-pre-line">
          {data.story_text as string || 'Ceritakan kisah kalian di sini — bagaimana kalian bertemu, jatuh cinta, dan memutuskan untuk melangkah bersama.'}
        </p>
      </div>
    </section>
  );
}

export function GalleryPreview({ data, accent }: PreviewProps) {
  const c = accentMap[accent];
  const photos = (data.photos as string[]) || [];
  return (
    <section data-section="gallery" className={`${c.bg} ${c.text} px-6 py-16 md:py-20`}>
      <div className="mx-auto max-w-4xl">
        <p className={`text-center font-body text-xs uppercase tracking-[0.2em] ${c.muted} mb-3`}>Galeri</p>
        <h2 className="text-center font-display text-3xl md:text-4xl mb-10">Momen-momen kami</h2>
        {photos.length === 0 ? (
          <div className="aspect-[16/9] rounded-lg border border-dashed border-muted flex items-center justify-center">
            <p className={`font-body text-sm ${c.muted}`}>Foto-foto akan tampil di sini</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {photos.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Foto ${i + 1}`}
                className="aspect-square object-cover rounded-md border border-muted-2"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function ThanksPreview({ data, accent }: PreviewProps) {
  const c = accentMap[accent];
  return (
    <section data-section="thanks" className={`${c.bg} ${c.text} px-6 py-20 md:py-28 text-center`}>
      <p className="font-display text-3xl md:text-4xl mb-6">Terima kasih</p>
      <p className={`max-w-md mx-auto font-body text-base leading-[1.65] ${c.muted}`}>
        {data.thanks_text as string || 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Anda berkenan hadir di hari bahagia kami.'}
      </p>
      <div className={`mx-auto mt-10 h-px w-12 ${accentBar[accent]}`} />
      <p className={`mt-6 font-body text-xs uppercase tracking-[0.2em] ${c.muted}`}>
        {data.couple_name_1_or_display || ''}
      </p>
    </section>
  );
}