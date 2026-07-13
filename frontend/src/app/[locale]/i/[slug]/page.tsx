import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getTemplate } from '@/lib/templates/data';
import { CoverReveal } from '@/components/invite/cover-reveal';

type Props = { params: Promise<{ locale: string; slug: string }> };

type ApiCard = {
  slug: string;
  template_slug: string;
  title: string;
  data: Record<string, Record<string, string | string[]>>;
  status: string;
  created_at: string;
};

async function fetchInvitation(slug: string): Promise<ApiCard | null> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) return null;
  try {
    const res = await fetch(`${base}/api/i/${encodeURIComponent(slug)}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const inv = await fetchInvitation(slug);
  if (!inv) return { title: 'Undangan tidak ditemukan' };
  const cover = inv.data?.cover ?? {};
  const n1 = (cover.couple_name_1 as string) || '';
  const n2 = (cover.couple_name_2 as string) || '';
  const date = (cover.wedding_date as string) || '';
  const title = n1 && n2 ? `${n1} & ${n2}` : inv.title;
  const description = date
    ? `Undangan pernikahan ${title} — ${new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date))}`
    : `Undangan pernikahan ${title}`;
  return {
    title: `${title} — Lumio`,
    description,
    openGraph: {
      title,
      description,
      locale: locale === 'id' ? 'id_ID' : 'en_US',
      type: 'website',
    },
  };
}

export default async function InvitationPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const inv = await fetchInvitation(slug);
  if (!inv) notFound();
  const template = getTemplate(inv.template_slug);
  if (!template) notFound();

  return (
    <CoverReveal
      template={template}
      data={inv.data ?? {}}
      slug={inv.slug}
      locale={locale}
    />
  );
}