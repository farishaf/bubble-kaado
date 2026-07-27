import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export async function Footer() {
  const t = await getTranslations('footer');
  return (
    <footer className="bg-kd-forest text-kd-cream">
      {/* dotted band — the collage seam between page and footer slab */}
      <div aria-hidden className="kd-dots h-6 bg-kd-paper opacity-70" />
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-body text-sm text-kd-cream/80">{t('line')}</p>
        <nav className="flex items-center gap-6">
          <Link
            href="/legal/privacy"
            className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-kd-cream/70 hover:text-kd-cream transition-colors whitespace-nowrap"
          >
            {t('privacy')}
          </Link>
          <Link
            href="/legal/terms"
            className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-kd-cream/70 hover:text-kd-cream transition-colors whitespace-nowrap"
          >
            {t('terms')}
          </Link>
        </nav>
      </div>
    </footer>
  );
}