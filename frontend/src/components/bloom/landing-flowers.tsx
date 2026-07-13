import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FlowerExplorer } from '@/components/bloom/flower-explorer';

type Props = { locale: string };

export async function BloomFlowers({ locale }: Props) {
  setRequestLocale(locale);
  const t = await getTranslations('bloom.flowers');
  return (
    <section className="bloom-flowers border-t border-muted-2">
      <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
        <div data-animate="reveal" className="max-w-xl mx-auto text-center">
          <p className="font-body text-xs uppercase tracking-[0.25em] text-ink-2 mb-4">
            {t('eyebrow')}
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-ink tracking-[-0.015em] leading-[1.05]">
            {t('heading')}
          </h2>
          <p className="mt-5 font-body text-base md:text-lg text-ink-2 leading-[1.55]">
            {t('lede')}
          </p>
        </div>
        <div data-animate="reveal" className="mt-14">
          <FlowerExplorer />
        </div>
      </div>
    </section>
  );
}
