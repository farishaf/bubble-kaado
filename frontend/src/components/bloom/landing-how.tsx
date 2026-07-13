import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = { locale: string };

export async function BloomHowItWorks({ locale }: Props) {
  setRequestLocale(locale);
  const t = await getTranslations('bloom.howItWorks');
  const steps = [
    { n: 'I', title: t('step1Title'), body: t('step1Body') },
    { n: 'II', title: t('step2Title'), body: t('step2Body') },
    { n: 'III', title: t('step3Title'), body: t('step3Body') },
  ];
  return (
    <section className="border-t border-muted-2 bg-paper-2">
      <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
        <div data-animate="reveal" className="max-w-xl">
          <p className="font-body text-xs uppercase tracking-[0.25em] text-ink-2 mb-4">
            {t('eyebrow')}
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-ink tracking-[-0.01em] leading-[1.1]">
            {t('heading')}
          </h2>
        </div>
        <ol className="mt-14 grid md:grid-cols-3 gap-10 md:gap-12">
          {steps.map((s) => (
            <li key={s.n} data-animate="step" className="border-t border-muted pt-6">
              <p className="font-display text-sm text-accent tracking-widest mb-3">{s.n}</p>
              <h3 className="font-display text-xl text-ink mb-2">{s.title}</h3>
              <p className="font-body text-base text-ink-2 leading-[1.55]">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
