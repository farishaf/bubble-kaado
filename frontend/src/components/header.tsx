'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/lib/auth/context';
import { useToast } from '@/lib/ui/toast';
import { Spinner } from '@/lib/ui/spinner';
import { AuthModal } from './auth-modal';

gsap.registerPlugin(useGSAP);

export function Header() {
  const t = useTranslations('header');
  const tToast = useTranslations('toast');
  const { user, signOut } = useAuth();
  const toast = useToast();
  const [authMode, setAuthMode] = useState<'signIn' | 'signUp' | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const ce = e as CustomEvent<{ mode: 'signIn' | 'signUp' }>;
      if (ce.detail?.mode) setAuthMode(ce.detail.mode);
    };
    window.addEventListener('lumio:open-auth', onOpen);
    return () => window.removeEventListener('lumio:open-auth', onOpen);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  useGSAP(() => {
    if (!menuOpen || !dropdownPanelRef.current) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from(dropdownPanelRef.current, {
        opacity: 0,
        y: -6,
        duration: 0.18,
        ease: 'power2.out',
      });
    });
  }, { scope: dropdownPanelRef, dependencies: [menuOpen] });

  const initials = (user?.user_metadata?.full_name as string | undefined)
    ?.split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '·';

  const onSignOut = async () => {
    setSigningOut(true);
    setMenuOpen(false);
    try {
      await signOut();
      toast.show(tToast('signedOut'), { variant: 'info' });
    } catch {
      toast.show(tToast('signOutFail'), { variant: 'error' });
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-muted-2 bg-paper/85 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between gap-6">
          <Link href="/" className="font-display text-xl text-ink tracking-tight">
            {t('brand')}
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/design"
              className="font-body text-sm text-ink-2 hover:text-ink transition-colors"
            >
              {t('design')}
            </Link>
            <Link
              href="/bloom"
              className="font-body text-sm text-ink-2 hover:text-ink transition-colors"
            >
              {t('bloom')}
            </Link>
            <Link
              href="/gift"
              className="font-body text-sm text-ink-2 hover:text-ink transition-colors"
            >
              {t('gift')}
            </Link>
          </nav>
          <div className="flex items-center gap-3 md:gap-4">
            <Link
              href="/"
              locale="en"
              className="font-body text-xs text-ink-2 hover:text-ink transition-colors px-2 py-1 rounded-md"
              aria-label="Switch language"
            >
              {t('languageToggle')}
            </Link>
            {user ? (
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  disabled={signingOut}
                  className="w-9 h-9 inline-flex items-center justify-center bg-accent text-accent-ink rounded-pill font-body text-sm font-medium hover:bg-accent-2 transition-colors disabled:opacity-60"
                  title={user.email ?? ''}
                >
                  {signingOut ? <Spinner size={14} /> : initials}
                </button>
                {menuOpen && (
                  <div
                    ref={dropdownPanelRef}
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-64 bg-paper border border-muted-2 rounded-md shadow-3 p-1.5 z-50"
                  >
                    <div className="px-3 py-2.5 border-b border-muted-2 mb-1">
                      <p className="font-body text-[10px] uppercase tracking-widest text-ink-3">
                        {t('signedInAs')}
                      </p>
                      <p className="font-body text-xs text-ink truncate mt-0.5">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center px-3 py-2 font-body text-sm text-ink hover:bg-paper-2 rounded-sm transition-colors"
                    >
                      {t('dashboard')}
                    </Link>
                    <Link
                      href="/account"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center px-3 py-2 font-body text-sm text-ink-2 hover:bg-paper-2 rounded-sm transition-colors"
                    >
                      {t('account')}
                    </Link>
                    <div className="my-1 border-t border-muted-2" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => void onSignOut()}
                      disabled={signingOut}
                      className="w-full text-left flex items-center px-3 py-2 font-body text-sm text-ink-2 hover:bg-paper-2 rounded-sm transition-colors disabled:opacity-60"
                    >
                      {signingOut && <Spinner size={12} className="mr-2" />}
                      {t('signOut')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setAuthMode('signIn')}
                  className="font-body text-sm text-ink-2 hover:text-ink transition-colors hidden sm:inline"
                >
                  {t('signIn')}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('signUp')}
                  className="font-body text-sm px-4 h-9 inline-flex items-center bg-ink text-paper rounded-pill hover:bg-ink-2 transition-colors"
                >
                  {t('signUp')}
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      {authMode && (
        <AuthModal
          key={authMode}
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSuccess={(mode) => {
            toast.show(
              mode === 'signIn' ? tToast('signedIn') : tToast('signedUp'),
              { variant: 'success' }
            );
          }}
        />
      )}
    </>
  );
}