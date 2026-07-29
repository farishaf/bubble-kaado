import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/header';
import { GiftEditor } from '@/components/gift/gift-editor';
import { getGiftTemplate } from '@/lib/gift/data';

type Props = {
  params: Promise<{ locale: string; template: string }>;
  searchParams: Promise<{ edit?: string }>;
};

export default async function GiftEditorPage({ params, searchParams }: Props) {
  const { locale, template } = await params;
  // ?edit=<slug> opens an already-saved card instead of a blank draft. Read on
  // the server so the client editor needn't reach for useSearchParams (and the
  // Suspense boundary that would require).
  const { edit } = await searchParams;
  setRequestLocale(locale);
  const def = getGiftTemplate(template);
  if (!def) notFound();

  return (
    <>
      <Header />
      <GiftEditor template={def} locale={locale} editSlug={edit ?? null} />
    </>
  );
}
