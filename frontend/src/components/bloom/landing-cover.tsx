import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Flower } from '@/components/bloom/flower';

type Props = { locale: string };

export async function BloomLetterCover({ locale }: Props) {
  setRequestLocale(locale);
  const t = await getTranslations('bloom.home');
  return (
    <section className="bloom-letter">
      <div className="mx-auto max-w-2xl px-6 pt-16 pb-20 md:pt-28 md:pb-28 text-center">
        <p data-animate="bloom-hero" className="font-body text-xs uppercase tracking-[0.32em] text-ink-2 mb-8">
          {t('eyebrow')}
        </p>
        <h1
          data-animate="bloom-hero"
          className="font-display text-[clamp(2.5rem,8vw,5rem)] text-ink leading-[1.02] tracking-[-0.025em] max-w-[14ch] mx-auto"
        >
          {t('headline')}
        </h1>
        <p
          data-animate="bloom-hero"
          className="mt-8 font-body text-lg md:text-xl text-ink-2 leading-[1.55] max-w-md mx-auto"
        >
          {t('lede')}
        </p>
        <div data-animate="bloom-hero" className="mt-12 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`/${locale}/bloom/new`}
            className="inline-flex items-center justify-center px-7 h-12 bg-ink text-paper font-body font-medium rounded-pill hover:bg-ink-2 transition-colors"
          >
            {t('primaryCta')}
            <span aria-hidden className="ml-2">→</span>
          </a>
          <a
            href={`/${locale}/bloom/demo`}
            className="inline-flex items-center justify-center px-7 h-12 bg-transparent text-ink font-body font-medium rounded-pill border border-muted hover:border-ink-2 transition-colors"
          >
            {t('secondaryCta')}
          </a>
        </div>
        <div className="mt-16 flex items-center justify-center gap-3 opacity-80" aria-hidden>
          <Flower flowerId="tulip" size={32} />
          <Flower flowerId="rose" size={42} />
          <Flower flowerId="sunflower" size={36} />
          <Flower flowerId="daisy" size={32} />
          <Flower flowerId="blossom" size={32} />
        </div>
      </div>
    </section>
  );
}
