import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/header';
import { GiftEditor } from '@/components/gift/gift-editor';
import { getGiftTemplate } from '@/lib/gift/data';

type Props = { params: Promise<{ locale: string; template: string }> };

export default async function GiftEditorPage({ params }: Props) {
  const { locale, template } = await params;
  setRequestLocale(locale);
  const def = getGiftTemplate(template);
  if (!def) notFound();

  return (
    <>
      <Header />
      <GiftEditor template={def} locale={locale} />
    </>
  );
}
