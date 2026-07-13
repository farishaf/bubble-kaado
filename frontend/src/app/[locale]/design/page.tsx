import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/header';
import { Footer } from '@/components/sections/footer';
import { TemplateGrid } from '@/components/templates/grid';
import { DesignAnimations } from '@/components/animations/design-animations';
import { TEMPLATES, CATEGORIES } from '@/lib/templates/data';

type Props = { params: Promise<{ locale: string }> };

export default async function DesignPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('design');

  const categoryLabels: Record<string, string> = {};
  for (const c of CATEGORIES) {
    categoryLabels[c.key] = t(`categories.${c.i18nKey}`);
  }
  const categories = CATEGORIES.map((c) => ({ key: c.key, label: categoryLabels[c.key] }));

  return (
    <>
      <Header />
      <DesignAnimations />
      <main>
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-12 md:pt-24">
          <p
            data-animate="design-hero"
            className="font-body text-xs uppercase tracking-[0.18em] text-ink-2 mb-4"
          >
            {t('eyebrow')}
          </p>
          <h1
            data-animate="design-hero"
            className="font-display text-[clamp(2.25rem,6vw,4rem)] text-ink tracking-[-0.02em] leading-[1.05] max-w-3xl"
          >
            {t('heading')}
          </h1>
          <p
            data-animate="design-hero"
            className="mt-5 font-body text-lg text-ink-2 max-w-2xl leading-[1.55]"
          >
            {t('lede')}
          </p>
        </section>
        <section className="border-t border-muted-2">
          <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
            <TemplateGrid
              templates={TEMPLATES}
              categories={categories}
              basePath={`/${locale}/design`}
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}