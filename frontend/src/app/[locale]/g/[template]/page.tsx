import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { GiftViewer } from '@/components/gift/gift-viewer';
import { getGiftTemplate } from '@/lib/gift/data';

type Props = {
  params: Promise<{ locale: string; template: string }>;
  searchParams: Promise<{ s?: string }>;
};

async function fetchSavedGift(slug: string): Promise<Record<string, string> | null> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) return null;
  try {
    const res = await fetch(`${base}/api/i/${encodeURIComponent(slug)}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data: Record<string, string> = {};
    for (const [k, v] of Object.entries(json.data ?? {})) {
      if (typeof v === 'string') data[k] = v;
    }
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'gift.meta' });
  return { title: t('title'), description: t('description') };
}

export default async function GiftViewPage({ params, searchParams }: Props) {
  const { locale, template } = await params;
  const { s } = await searchParams;
  setRequestLocale(locale);
  if (!getGiftTemplate(template)) notFound();

  const saved = s ? await fetchSavedGift(s) : null;
  if (s && !saved) notFound();

  return (
    <main className="h-dvh overflow-y-auto bg-paper">
      <GiftViewer slug={template} initialData={saved ?? undefined} />
    </main>
  );
}
