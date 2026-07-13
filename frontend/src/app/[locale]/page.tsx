import { setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/header';
import { QuietCover } from '@/components/sections/quiet-cover';
import { TemplateShowcase } from '@/components/sections/template-showcase';
import { HowItWorks } from '@/components/sections/how-it-works';
import { Testimonials } from '@/components/sections/testimonials';
import { CTABand } from '@/components/sections/cta-band';
import { FAQ } from '@/components/sections/faq';
import { Footer } from '@/components/sections/footer';
import { PageAnimations } from '@/components/animations/page-animations';

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Header />
      <PageAnimations />
      <main>
        <QuietCover locale={locale} />
        <TemplateShowcase locale={locale} />
        <HowItWorks locale={locale} />
        <Testimonials locale={locale} />
        <CTABand locale={locale} />
        <FAQ locale={locale} />
      </main>
      <Footer />
    </>
  );
}