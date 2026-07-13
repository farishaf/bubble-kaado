import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = { locale: string };

export async function BloomCTA({ locale }: Props) {
  setRequestLocale(locale);
  const t = await getTranslations('bloom.cta');
  return (
    <section className="border-t border-muted-2">
      <div data-animate="reveal" className="mx-auto max-w-2xl px-6 py-24 md:py-32 text-center">
        <h2 className="font-display text-4xl md:text-6xl text-ink tracking-[-0.02em] leading-[1.05]">
          {t('heading')}
        </h2>
        <p className="mt-6 font-body text-lg text-ink-2 max-w-sm mx-auto leading-[1.55]">
          {t('body')}
        </p>
        <a
          href={`/${locale}/bloom/new`}
          className="inline-flex items-center justify-center mt-10 px-8 h-12 bg-accent text-accent-ink font-body font-medium rounded-pill hover:bg-accent-2 transition-colors"
        >
          {t('button')}
          <span aria-hidden className="ml-2">→</span>
        </a>
      </div>
    </section>
  );
}
