import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = { locale: string };

export async function TemplateShowcase({ locale }: Props) {
  setRequestLocale(locale);
  const t = await getTranslations('templates');
  const slots = Array.from({ length: 6 }, (_, i) => i);
  return (
    <section id="templates" className="bg-kd-cream">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div data-animate="reveal" className="max-w-2xl">
          <p className="kd-kicker text-kd-coral-ink mb-4">{t('eyebrow')}</p>
          <h2 className="font-display text-3xl md:text-4xl text-kd-forest tracking-[-0.01em] leading-[1.1]">
            {t('heading')}
          </h2>
          <p className="font-body text-base md:text-lg text-ink-2 mt-5 max-w-xl leading-[1.55]">
            {t('lede')}
          </p>
        </div>

        {/* edge-to-edge collage grid — cells divided by rules, not gaps.
            Mirrors the /gift index so the two products read as one brand. */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 border-t-2 border-kd-forest">
          {slots.map((i) => (
            <div
              key={i}
              data-animate="card"
              className={`relative aspect-[3/4] flex flex-col items-center justify-center text-center p-6 border-b border-r border-kd-forest/20 ${
                i % 2 === 0 ? 'bg-kd-paper' : 'bg-kd-sage/40'
              }`}
            >
              <span aria-hidden data-animate="tag" className="kd-tag" />
              <p className="absolute top-4 left-4 font-body text-[10px] font-semibold text-kd-coral-ink tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </p>
              <div className="kd-stamp-edge bg-kd-cream w-12 h-12 mb-4" aria-hidden />
              <p className="font-body text-[10px] uppercase tracking-[0.18em] text-ink-3">
                {t('comingSoon')}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <p className="font-body text-sm text-ink-2 max-w-md">{t('empty')}</p>
          <a
            href={`/${locale}/design`}
            className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-kd-forest hover:text-kd-coral-ink transition-colors whitespace-nowrap underline underline-offset-4"
          >
            {t('viewAll')} <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}