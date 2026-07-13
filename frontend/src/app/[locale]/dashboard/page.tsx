import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/header';
import { Footer } from '@/components/sections/footer';
import { DashboardList } from '@/components/dashboard/list';

type Props = { params: Promise<{ locale: string }> };

type ApiCard = {
  slug: string;
  url: string;
  status: string;
  template_slug: string;
};

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}`);
  }

  const t = await getTranslations('dashboard');

  let cards: ApiCard[] = [];
  let fetchError: string | null = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (token) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invitations`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        cards = json.data ?? [];
      } else {
        fetchError = `${res.status}`;
      }
    }
  } catch (e) {
    fetchError = e instanceof Error ? e.message : 'fetch failed';
  }

  return (
    <>
      <Header />
      <main>
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-12 md:pt-24">
          <p className="font-body text-xs uppercase tracking-[0.18em] text-ink-2 mb-4">
            {user.user_metadata?.full_name ? `${user.user_metadata.full_name}` : user.email}
          </p>
          <h1 className="font-display text-[clamp(2.25rem,6vw,4rem)] text-ink tracking-[-0.02em] leading-[1.05]">
            {t('heading')}
          </h1>
          <p className="mt-5 font-body text-lg text-ink-2 max-w-2xl leading-[1.55]">
            {t('lede')}
          </p>
        </section>
        <section className="border-t border-muted-2">
          <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
            {fetchError ? (
              <p className="font-body text-sm text-danger">{t('errorLoad', { code: fetchError })}</p>
            ) : (
              <DashboardList cards={cards} locale={locale} />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}