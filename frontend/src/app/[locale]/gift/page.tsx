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
      <main className="bg-kd-paper">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <p className="kd-kicker text-kd-coral mb-4">{t('eyebrow')}</p>
          <h1 className="font-display text-3xl md:text-5xl text-kd-forest tracking-[-0.02em] leading-[1.1] max-w-2xl">
            {t('heading')}
          </h1>
          <p className="mt-5 font-body text-base text-ink-2 leading-[1.55] max-w-prose">{t('lede')}</p>

          <div className="mt-12 grid sm:grid-cols-2 border-t-2 border-kd-forest">
            {GIFT_TEMPLATES.map((tpl, i) => (
              <div
                key={tpl.slug}
                className={`relative border-b border-kd-forest/20 p-6 ${i % 2 === 0 ? 'bg-kd-cream sm:border-r sm:border-r-kd-forest/20' : 'bg-kd-sage/45'}`}
              >
                <span aria-hidden className="absolute top-4 right-4 w-3 h-3 bg-kd-coral" />
                <p className="font-body text-[10px] font-semibold text-kd-coral tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h2 className="mt-1 font-display text-xl text-kd-forest">{tpl.name}</h2>
                <p className="mt-2 font-body text-sm text-ink-2 leading-[1.55]">{tpl.description}</p>
                <div className="mt-5 flex items-center gap-4">
                  <a
                    href={`/${locale}/gift/${tpl.slug}`}
                    className="font-body text-[11px] uppercase tracking-wider px-5 h-10 inline-flex items-center bg-kd-forest text-kd-cream rounded-sm hover:bg-kd-forest-2 transition-colors"
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
        </div>
      </main>
      <Footer />
    </>
  );
}
