import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/header';
import { Footer } from '@/components/sections/footer';
import { GIFT_TEMPLATES } from '@/lib/gift/data';

type Props = { params: Promise<{ locale: string }> };

export default async function GiftIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('gift.index');

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-20 md:py-28">
        <p className="font-body text-xs uppercase tracking-[0.28em] text-ink-2 mb-4">{t('eyebrow')}</p>
        <h1 className="font-display text-3xl md:text-5xl text-ink tracking-[-0.02em] leading-[1.1] max-w-2xl">
          {t('heading')}
        </h1>
        <p className="mt-5 font-body text-base text-ink-2 leading-[1.55] max-w-prose">{t('lede')}</p>

        <div className="mt-12 grid sm:grid-cols-2 gap-6">
          {GIFT_TEMPLATES.map((tpl) => (
            <div key={tpl.slug} className="rounded-lg border border-muted bg-paper-2 p-6">
              <h2 className="font-display text-xl text-ink">{tpl.name}</h2>
              <p className="mt-2 font-body text-sm text-ink-2 leading-[1.55]">{tpl.description}</p>
              <div className="mt-5 flex items-center gap-4">
                <a
                  href={`/${locale}/gift/${tpl.slug}`}
                  className="font-body text-sm px-5 h-10 inline-flex items-center bg-ink text-paper rounded-pill hover:bg-ink-2 transition-colors"
                >
                  {t('makeCta')}
                </a>
                <a
                  href={`/${locale}/g/${tpl.slug}`}
                  className="font-body text-sm text-ink-2 hover:text-ink underline underline-offset-4 transition-colors"
                >
                  {t('demoCta')}
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
