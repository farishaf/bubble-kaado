import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/header';
import { Footer } from '@/components/sections/footer';
import { Editor } from '@/components/editor/editor';
import { getTemplate } from '@/lib/templates/data';

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function EditorPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const template = getTemplate(slug);
  if (!template) notFound();
  return (
    <>
      <Header />
      <Editor template={template} locale={locale} />
      <Footer />
    </>
  );
}