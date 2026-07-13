import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = { locale: string };

export async function CTABand({ locale }: Props) {
  setRequestLocale(locale);
  const t = await getTranslations('cta');
  return (
    <section className="border-t border-muted-2">
      <div data-animate="reveal" className="mx-auto max-w-3xl px-6 py-20 md:py-28 text-center">
        <h2 className="font-display text-3xl md:text-5xl text-ink tracking-[-0.02em] leading-[1.1]">
          {t('heading')}
        </h2>
        <p className="font-body text-base md:text-lg text-ink-2 mt-5 max-w-md mx-auto leading-[1.55]">
          {t('body')}
        </p>
        <a
          href={`/${locale}/design`}
          className="inline-flex items-center justify-center mt-10 px-7 h-12 bg-ink text-paper font-body font-medium rounded-pill hover:bg-ink-2 transition-colors"
        >
          {t('button')}
          <span aria-hidden className="ml-2">→</span>
        </a>
      </div>
    </section>
  );
}