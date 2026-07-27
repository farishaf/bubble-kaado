import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = { locale: string };

export async function CTABand({ locale }: Props) {
  setRequestLocale(locale);
  const t = await getTranslations('cta');
  // full-bleed forest slab — the one high-contrast block on the page
  return (
    <section className="relative bg-kd-forest text-kd-cream overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -left-16 -bottom-16 w-64 h-64 bg-kd-coral/15 rotate-12" />
      <div data-animate="reveal" className="relative mx-auto max-w-3xl px-6 py-20 md:py-28">
        <h2 className="font-display text-3xl md:text-5xl tracking-[-0.02em] leading-[1.1] [overflow-wrap:anywhere] min-w-0">
          {t('heading')}
        </h2>
        <p className="font-body text-base md:text-lg text-kd-cream/75 mt-5 max-w-md leading-[1.55]">
          {t('body')}
        </p>
        <a
          href={`/${locale}/design`}
          className="kd-btn kd-btn--lg mt-10 bg-kd-cream text-kd-forest hover:bg-kd-paper"
        >
          {t('button')}
          <span aria-hidden>→</span>
        </a>
      </div>
    </section>
  );
}