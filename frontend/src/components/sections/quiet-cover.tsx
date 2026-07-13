import { getTranslations, setRequestLocale } from 'next-intl/server';

export async function QuietCover({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const t = await getTranslations('home');
  return (
    <section className="mx-auto max-w-3xl px-6 pt-16 pb-24 md:pt-28 md:pb-32">
      <p data-animate="hero" className="font-body text-xs uppercase tracking-[0.18em] text-ink-2 mb-8 md:mb-10">
        {t('eyebrow')}
      </p>
      <h1 data-animate="hero" className="font-display text-[clamp(2.5rem,7vw,4.75rem)] leading-[1.05] tracking-[-0.02em] text-ink">
        {t('headline')}
      </h1>
      <p data-animate="hero" className="font-body text-lg md:text-xl text-ink-2 mt-8 max-w-xl leading-[1.55]">
        {t('lede')}
      </p>
      <div data-animate="hero" className="mt-12 flex flex-col sm:flex-row gap-3">
        <a
          href={`/${locale}/design`}
          className="inline-flex items-center justify-center px-6 h-12 bg-accent text-accent-ink font-body font-medium rounded-pill hover:bg-accent-2 transition-colors"
        >
          {t('primaryCta')}
          <span aria-hidden className="ml-2">→</span>
        </a>
        <a
          href={`/${locale}/design#templates`}
          className="inline-flex items-center justify-center px-6 h-12 bg-transparent text-ink font-body font-medium rounded-pill border border-muted hover:border-ink-2 transition-colors"
        >
          {t('secondaryCta')}
        </a>
      </div>
    </section>
  );
}