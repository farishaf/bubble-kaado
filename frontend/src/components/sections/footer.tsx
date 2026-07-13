import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export async function Footer() {
  const t = await getTranslations('footer');
  return (
    <footer className="border-t border-muted-2">
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-body text-sm text-ink-2">{t('line')}</p>
        <nav className="flex items-center gap-6">
          <Link
            href="/legal/privacy"
            className="font-body text-sm text-ink-2 hover:text-ink transition-colors"
          >
            {t('privacy')}
          </Link>
          <Link
            href="/legal/terms"
            className="font-body text-sm text-ink-2 hover:text-ink transition-colors"
          >
            {t('terms')}
          </Link>
        </nav>
      </div>
    </footer>
  );
}