'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Link, usePathname } from '@/i18n/routing';
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownPanelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (prevPathname !== null) setMobileOpen(false);
  }

  const navItems = [
    { href: '/design' as const, label: t('design') },
    { href: '/bloom' as const, label: t('bloom') },
    { href: '/gift' as const, label: t('gift') },
  ];

  useEffect(() => {
    const onOpen = (e: Event) => {
      const ce = e as CustomEvent<{ mode: 'signIn' | 'signUp' }>;
      if (ce.detail?.mode) setAuthMode(ce.detail.mode);
    };
    window.addEventListener('lumio:open-auth', onOpen);
    return () => window.removeEventListener('lumio:open-auth', onOpen);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  useGSAP(() => {
    if (!mobileOpen || !mobilePanelRef.current) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        mobilePanelRef.current,
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.42, ease: 'power2.out' }
      );
      gsap.fromTo(
        mobilePanelRef.current!.querySelectorAll('[data-mobile-link]'),
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out', stagger: 0.05, delay: 0.06 }
      );
    });
  }, { scope: mobilePanelRef, dependencies: [mobileOpen] });

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
      <header ref={headerRef} className="sticky top-0 z-50 border-b-2 border-kd-forest bg-kd-paper/90 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between gap-6">
          <Link href="/" className="font-display text-xl text-kd-forest tracking-tight">
            {t('brand')}
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-2 hover:text-kd-forest transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 md:gap-4">
            <Link
              href="/"
              locale="en"
              className="font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-2 hover:text-kd-forest transition-colors px-2 py-1 rounded-sm"
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
                  className="w-9 h-9 inline-flex items-center justify-center bg-kd-forest text-kd-cream rounded-sm font-body text-xs font-semibold tracking-wider hover:bg-kd-forest-2 transition-colors disabled:opacity-60"
                  title={user.email ?? ''}
                >
                  {signingOut ? <Spinner size={14} /> : initials}
                </button>
                {menuOpen && (
                  <div
                    ref={dropdownPanelRef}
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-64 kd-sheet border border-kd-forest/20 rounded-sm shadow-3 p-1.5 z-50"
                  >
                    <div className="relative px-3 py-2.5 border-b border-dashed border-kd-forest/30 mb-1">
                      <span aria-hidden className="kd-tag" style={{ top: 8, right: 8, width: 8, height: 8 }} />
                      <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-kd-coral-ink">
                        {t('signedInAs')}
                      </p>
                      <p className="font-body text-xs text-ink truncate mt-0.5">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center px-3 py-2 font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-kd-forest hover:bg-kd-sage/50 rounded-sm transition-colors"
                    >
                      {t('dashboard')}
                    </Link>
                    <Link
                      href="/account"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center px-3 py-2 font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-2 hover:bg-kd-sage/50 rounded-sm transition-colors"
                    >
                      {t('account')}
                    </Link>
                    <div className="my-1 border-t border-dashed border-kd-forest/30" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => void onSignOut()}
                      disabled={signingOut}
                      className="w-full text-left flex items-center px-3 py-2 font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-2 hover:bg-kd-sage/50 rounded-sm transition-colors disabled:opacity-60"
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
                  className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-2 hover:text-kd-forest transition-colors hidden sm:inline"
                >
                  {t('signIn')}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('signUp')}
                  className="kd-btn kd-btn--sm"
                >
                  {t('signUp')}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                setMobileOpen((v) => !v);
                setMenuOpen(false);
              }}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-panel"
              aria-label={mobileOpen ? t('closeMenu') : t('openMenu')}
              className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-sm text-kd-forest hover:bg-kd-sage/40 transition-colors"
            >
              <span className="relative block w-4 h-3" aria-hidden="true">
                <span
                  className="absolute left-0 top-0 w-4 h-[1.5px] bg-kd-forest transition-transform duration-200 ease-out"
                  style={{ transform: mobileOpen ? 'translateY(5.5px) rotate(45deg)' : 'none' }}
                />
                <span
                  className="absolute left-0 bottom-0 w-4 h-[1.5px] bg-kd-forest transition-transform duration-200 ease-out"
                  style={{ transform: mobileOpen ? 'translateY(-5.5px) rotate(-45deg)' : 'none' }}
                />
              </span>
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div
            id="mobile-nav-panel"
            ref={mobilePanelRef}
            className="md:hidden absolute inset-x-0 top-full kd-sheet border-b-2 border-kd-forest shadow-3 z-40"
          >
            <nav className="flex flex-col px-6 py-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  data-mobile-link
                  className="py-3.5 border-b border-dashed border-kd-forest/30 last:border-b-0 font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-2 hover:text-kd-forest transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              {!user && (
                <button
                  type="button"
                  data-mobile-link
                  onClick={() => {
                    setMobileOpen(false);
                    setAuthMode('signIn');
                  }}
                  className="py-3.5 border-t border-dashed border-kd-forest/30 text-left font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-2 hover:text-kd-forest transition-colors"
                >
                  {t('signIn')}
                </button>
              )}
            </nav>
          </div>
        )}
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