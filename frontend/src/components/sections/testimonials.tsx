import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = { locale: string };

export async function Testimonials({ locale }: Props) {
  setRequestLocale(locale);
  const t = await getTranslations('testimonials');
  return (
    <section className="border-t border-muted-2 bg-paper-2">
      <div data-animate="reveal" className="mx-auto max-w-3xl px-6 py-20 md:py-28 text-center">
        <p className="font-body text-xs uppercase tracking-[0.18em] text-ink-2 mb-4">
          {t('eyebrow')}
        </p>
        <h2 className="font-display text-3xl md:text-4xl text-ink tracking-[-0.01em] leading-[1.1]">
          {t('heading')}
        </h2>
        <p className="font-body text-base md:text-lg text-ink-2 mt-8 max-w-xl mx-auto leading-[1.55] italic">
          {t('empty')}
        </p>
      </div>
    </section>
  );
}