import { getTranslations, setRequestLocale } from 'next-intl/server';

export async function QuietCover({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const t = await getTranslations('home');
  return (
    <section className="relative bg-kd-paper overflow-hidden">
      {/* sage block bleeding off the right edge — collage ground, not a hero image */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-10 hidden md:block w-80 h-80 bg-kd-sage/40 rotate-6"
      />
      <div className="relative mx-auto max-w-3xl px-6 pt-16 pb-24 md:pt-28 md:pb-32">
        <p data-animate="kicker" className="kd-kicker text-kd-coral-ink mb-6 md:mb-8">
          {t('eyebrow')}
        </p>
        <span data-animate="rule" aria-hidden className="kd-rule w-16 mb-8" />
        <h1
          data-animate="hero"
          className="font-display text-[clamp(2.5rem,7vw,4.75rem)] leading-[1.05] tracking-[-0.02em] text-kd-forest [overflow-wrap:anywhere] min-w-0"
        >
          {t('headline')}
        </h1>
        <p data-animate="hero" className="font-body text-lg md:text-xl text-ink-2 mt-8 max-w-xl leading-[1.55]">
          {t('lede')}
        </p>
        <div data-animate="hero" className="mt-12 flex flex-col sm:flex-row gap-3">
          <a href={`/${locale}/design`} className="kd-btn kd-btn--lg">
            {t('primaryCta')}
            <span aria-hidden>→</span>
          </a>
          <a href={`/${locale}/design#templates`} className="kd-btn kd-btn--lg kd-btn--ghost">
            {t('secondaryCta')}
          </a>
        </div>
      </div>
    </section>
  );
}