import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/header';
import { Footer } from '@/components/sections/footer';
import { BloomLetterCover } from '@/components/bloom/landing-cover';
import { BloomFlowers } from '@/components/bloom/landing-flowers';
import { BloomHowItWorks } from '@/components/bloom/landing-how';
import { BloomCTA } from '@/components/bloom/landing-cta';
import { BloomLandingAnimations } from '@/components/bloom/animations/bloom-landing-animations';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'bloom.meta' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function BloomHomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Header />
      <BloomLandingAnimations />
      <main>
        <BloomLetterCover locale={locale} />
        <BloomFlowers locale={locale} />
        <BloomHowItWorks locale={locale} />
        <BloomCTA locale={locale} />
      </main>
      <Footer />
    </>
  );
}
