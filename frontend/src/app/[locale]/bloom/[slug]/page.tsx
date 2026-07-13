import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { STARTER_BLOOM } from '@/lib/bloom/data';
import { BouquetReveal } from '@/components/bloom/bouquet-reveal';
import { Header } from '@/components/header';
import { Footer } from '@/components/sections/footer';

type Props = { params: Promise<{ locale: string; slug?: string }> };

export default async function BloomPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  if (slug === 'demo') {
    return <DemoBouquet />;
  }

  if (slug === 'new') {
    return <NewBouquetPlaceholder locale={locale} />;
  }

  notFound();
}

function DemoBouquet() {
  return <BouquetReveal data={STARTER_BLOOM} />;
}

function NewBouquetPlaceholder({ locale }: { locale: string }) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-md px-6 py-32 text-center">
        <p className="font-body text-xs uppercase tracking-[0.28em] text-ink-2 mb-4">Bloom</p>
        <h1 className="font-display text-3xl md:text-4xl text-ink tracking-[-0.02em] leading-[1.1]">
          Pembuat buket segera hadir.
        </h1>
        <p className="mt-5 font-body text-base text-ink-2 leading-[1.55]">
          Untuk sekarang, lihat dulu <a href={`/${locale}/bloom/demo`} className="underline underline-offset-4">contoh buketnya</a>.
        </p>
      </main>
      <Footer />
    </>
  );
}
