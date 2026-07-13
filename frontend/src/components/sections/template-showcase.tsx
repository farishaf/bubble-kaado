import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = { locale: string };

export async function TemplateShowcase({ locale }: Props) {
  setRequestLocale(locale);
  const t = await getTranslations('templates');
  const slots = Array.from({ length: 6 }, (_, i) => i);
  return (
    <section id="templates" className="border-t border-muted-2 bg-paper-2">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div data-animate="reveal" className="max-w-2xl">
          <p className="font-body text-xs uppercase tracking-[0.18em] text-ink-2 mb-4">
            {t('eyebrow')}
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-ink tracking-[-0.01em] leading-[1.1]">
            {t('heading')}
          </h2>
          <p className="font-body text-base md:text-lg text-ink-2 mt-5 max-w-xl leading-[1.55]">
            {t('lede')}
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {slots.map((i) => (
            <div
              key={i}
              data-animate="card"
              className="aspect-[3/4] rounded-lg border border-muted-2 bg-paper flex flex-col items-center justify-center text-center p-6"
            >
              <div className="w-10 h-10 rounded-full bg-paper-3 mb-4" aria-hidden />
              <p className="font-body text-xs uppercase tracking-widest text-ink-3">
                {t('comingSoon')}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <p className="font-body text-sm text-ink-2 italic max-w-md mx-auto">
            {t('empty')}
          </p>
          <a
            href={`/${locale}/design`}
            className="inline-flex items-center mt-6 font-body text-sm text-ink hover:text-accent transition-colors"
          >
            {t('viewAll')} <span aria-hidden className="ml-2">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}