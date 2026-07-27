import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = { locale: string };

export async function Testimonials({ locale }: Props) {
  setRequestLocale(locale);
  const t = await getTranslations('testimonials');
  return (
    <section className="bg-kd-sage/45">
      <div data-animate="reveal" className="mx-auto max-w-3xl px-6 py-20 md:py-28">
        <p className="kd-kicker text-kd-coral-ink mb-4">{t('eyebrow')}</p>
        <h2 className="font-display text-3xl md:text-4xl text-kd-forest tracking-[-0.01em] leading-[1.1]">
          {t('heading')}
        </h2>
        <span data-animate="rule" aria-hidden className="kd-rule kd-rule--dashed w-full mt-8" />
        {/* honest placeholder — no invented quotes, no headshots, no star badges */}
        <p className="font-body text-base md:text-lg text-ink-2 mt-8 max-w-xl leading-[1.55]">
          {t('empty')}
        </p>
      </div>
    </section>
  );
}