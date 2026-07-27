import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FAQAccordion } from './faq-accordion';

type Props = { locale: string };

export async function FAQ({ locale }: Props) {
  setRequestLocale(locale);
  const t = await getTranslations('faq');
  const items = t.raw('items') as Array<{ q: string; a: string }>;
  return (
    <section className="bg-kd-paper">
      <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
        <div data-animate="reveal" className="mb-10">
          <p className="kd-kicker text-kd-coral-ink mb-4">{t('eyebrow')}</p>
          <h2 className="font-display text-3xl md:text-4xl text-kd-forest tracking-[-0.01em] leading-[1.1]">
            {t('heading')}
          </h2>
        </div>
        <FAQAccordion items={items} />
      </div>
    </section>
  );
}
