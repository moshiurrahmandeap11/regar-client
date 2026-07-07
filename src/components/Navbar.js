'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import NextLink from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, ShoppingBag, User, LogOut, ChevronDown,
  Package, Ticket, Trophy, HelpCircle, Mail, LayoutDashboard,
  Home, Gift, Bell, Crown
} from 'lucide-react';

function FlagIcon({ locale }) {
  if (locale === 'fr') {
    return (
      <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true" className="rounded-sm overflow-hidden">
        <rect width="6" height="12" fill="#0055A4" />
        <rect x="6" width="6" height="12" fill="#FFFFFF" />
        <rect x="12" width="6" height="12" fill="#EF4135" />
      </svg>
    );
  }

  return (
    <svg width="18" height="12" viewBox="0 0 60 30" aria-hidden="true" className="rounded-sm overflow-hidden">
      <clipPath id="s">
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id="t">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath="url(#s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

export default function Navbar() {
  const t = useTranslations('Nav');
  const locale = useLocale();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const [notifUnread, setNotifUnread] = useState(3);

  const navLinks = [
    { href: '/products', label: t('products'), icon: Package },
    { href: '/raffles', label: t('raffles'), icon: Ticket },
    { href: '/winners', label: t('winners'), icon: Trophy },
    { href: '/faq', label: t('faq'), icon: HelpCircle },
    { href: '/contact', label: t('contact'), icon: Mail },
  ];

  const isActive = (href) => pathname === href || pathname === `/${locale}${href}`;

  const toggleLocale = () => {
    const newLocale = locale === 'fr' ? 'en' : 'fr';
    window.location.href = `/${newLocale}${pathname}`;
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const currentLocaleLabel = locale === 'fr' ? 'FR' : 'EN';

  // Check if we're on an auth page (dashboard, orders, tickets, profile)
  const authPages = ['/dashboard', '/orders', '/tickets', '/profile', '/order-detail'];
  const isAuthPage = authPages.some(p => pathname === p || pathname.startsWith(p + '/'));

  // Show user bottom nav when logged in AND on auth pages
  const showUserNav = user && isAuthPage;

  const publicNavItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: ShoppingBag, label: 'Shop', href: '/products' },
    { icon: Gift, label: 'Raffles', href: '/raffles' },
    { icon: User, label: 'Profile', href: '/login' },
  ];

  const userNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Ticket, label: 'My Entries', href: '/tickets' },
    { icon: ShoppingBag, label: 'My Orders', href: '/orders' },
    { icon: User, label: 'Profile', href: '/profile' },
  ];

  const bottomNavItems = showUserNav ? userNavItems : publicNavItems;

  const isBottomActive = (href) => {
    if (href === '/') return pathname === '/' || pathname === '';
    return pathname === href || pathname.startsWith(href + '/');
  };

  // Mobile header content based on page type
  const isFr = locale === 'fr';

  return (
    <>
    {/* ===== DESKTOP HEADER ===== */}
    <header className="hidden lg:block sticky top-0 z-50 bg-[#1b2f48] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <span className="font-bold text-xl tracking-[0.2em] uppercase text-white">{isFr ? 'Regar' : 'LOOK'}</span>
          </Link>

          <nav className="flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-white/10 text-white'
                    : 'text-[#d5dde6] hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLocale}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/15 transition-colors"
            >
              <FlagIcon locale={locale} />
              <span>{currentLocaleLabel}</span>
            </button>

            <Link href="/cart" className="relative p-2 rounded-lg text-white hover:bg-white/10 transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {totalItems}
                </motion.span>
              )}
            </Link>

            {user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-white/15 flex items-center justify-center">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 hidden sm:block" />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-neutral-200 py-1"
                    >
                      <div className="px-4 py-2 border-b border-neutral-100">
                        <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-neutral-500">{user.email}</p>
                      </div>
                      <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-50">
                        <LayoutDashboard className="w-4 h-4" /> {t('dashboard')}
                      </Link>
                      <Link href="/orders" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-50">
                        <Package className="w-4 h-4" /> {t('orders')}
                      </Link>
                      <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-50">
                        <User className="w-4 h-4" /> {t('profile')}
                      </Link>
                      {user.isAdmin && (
                        <NextLink href="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-50">
                          <LayoutDashboard className="w-4 h-4" /> Admin
                        </NextLink>
                      )}
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                      >
                        <LogOut className="w-4 h-4" /> {t('logout')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
              >
                {t('login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>

    {/* ===== MOBILE HEADER - Public Pages (Home, Shop, etc) ===== */}
    {!isAuthPage && (
      <div className="lg:hidden sticky top-0 z-50 bg-[#0f1419] px-4 py-3 flex items-center justify-between">
        <button onClick={() => setMobileOpen(true)} className="text-white p-1">
          <Menu className="w-6 h-6" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <span className="font-black text-xl tracking-wider text-white">
            {isFr ? 'R' : 'L'} <span className="text-white/80 font-bold tracking-[0.3em] text-sm">{isFr ? 'REGAR' : 'LOOK'}</span>
          </span>
        </Link>
        <Link href="/cart" className="relative text-white p-1">
          <ShoppingBag className="w-6 h-6" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#e2bd87] text-[#0f1419] text-[10px] font-bold rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    )}

    {/* ===== MOBILE HEADER - Auth Pages (Dashboard, Orders, etc) ===== */}
    {isAuthPage && (
      <div className="lg:hidden sticky top-0 z-50 bg-[#0f1419] px-4 py-3 flex items-center justify-between">
        <button onClick={() => setMobileOpen(true)} className="text-white p-1">
          <Menu className="w-6 h-6" />
        </button>
        <Link href="/dashboard" className="flex items-center gap-1.5">
          <Crown className="w-5 h-5 text-[#e2bd87]" />
          <span className="font-bold text-lg tracking-wider text-white">CAP<span className="text-[#e2bd87]">RAFFLE</span></span>
        </Link>
        <button className="relative text-white p-1">
          <Bell className="w-6 h-6" />
          {notifUnread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {notifUnread}
            </span>
          )}
        </button>
      </div>
    )}

    {/* ===== MOBILE MENU OVERLAY ===== */}
    <AnimatePresence>
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 lg:hidden"
        >
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25 }}
            className="absolute left-0 top-0 bottom-0 w-64 bg-[#0f1419] text-white p-5"
          >
            <div className="flex items-center justify-between mb-6">
              {isAuthPage ? (
                <span className="font-bold text-lg tracking-wider">CAP<span className="text-[#e2bd87]">RAFFLE</span></span>
              ) : (
                <span className="font-bold text-lg tracking-wider">{isFr ? 'REGAR' : 'LOOK'}</span>
              )}
              <button onClick={() => setMobileOpen(false)} className="text-neutral-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Auth page sidebar nav */}
            {isAuthPage && user && (
              <nav className="space-y-1">
                {[
                  { icon: LayoutDashboard, label: isFr ? 'Tableau de bord' : 'Dashboard', href: '/dashboard' },
                  { icon: Ticket, label: isFr ? 'Mes participations' : 'My Entries', href: '/tickets' },
                  { icon: ShoppingBag, label: isFr ? 'Mes commandes' : 'My Orders', href: '/orders' },
                  { icon: Gift, label: isFr ? 'Giveaways' : 'Giveaways', href: '/raffles' },
                  { icon: Trophy, label: isFr ? 'Gagnants' : 'Winners', href: '/winners' },
                  { icon: User, label: isFr ? 'Profil' : 'Profile', href: '/profile' },
                  { icon: HelpCircle, label: isFr ? 'Support' : 'Support', href: '/contact' },
                ].map((item) => (
                  <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-white/5">
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                ))}
                <button onClick={() => { logout(); setMobileOpen(false); }} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 w-full">
                  <LogOut className="w-5 h-5" />
                  {isFr ? 'Déconnexion' : 'Logout'}
                </button>
              </nav>
            )}

            {/* Public page sidebar nav */}
            {!isAuthPage && (
              <nav className="space-y-1">
                {[
                  { icon: Home, label: isFr ? 'Accueil' : 'Home', href: '/' },
                  { icon: ShoppingBag, label: isFr ? 'Boutique' : 'Shop', href: '/products' },
                  { icon: Gift, label: isFr ? 'Raffles' : 'Raffles', href: '/raffles' },
                  { icon: Trophy, label: isFr ? 'Gagnants' : 'Winners', href: '/winners' },
                  { icon: HelpCircle, label: isFr ? 'FAQ' : 'FAQ', href: '/faq' },
                  { icon: Mail, label: isFr ? 'Contact' : 'Contact', href: '/contact' },
                  ...(!user ? [
                    { icon: User, label: isFr ? 'Connexion' : 'Login', href: '/login' },
                  ] : []),
                ].map((item) => (
                  <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-white/5">
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                ))}
                {user && (
                  <>
                    <div className="border-t border-white/10 my-2" />
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-white/5">
                      <LayoutDashboard className="w-5 h-5" />
                      {isFr ? 'Tableau de bord' : 'Dashboard'}
                    </Link>
                    <button onClick={() => { logout(); setMobileOpen(false); }} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 w-full">
                      <LogOut className="w-5 h-5" />
                      {isFr ? 'Déconnexion' : 'Logout'}
                    </button>
                  </>
                )}
              </nav>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* ===== MOBILE BOTTOM NAVIGATION ===== */}
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 px-2 py-1.5">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {bottomNavItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
              isBottomActive(item.href) ? 'text-[#b88238]' : 'text-neutral-400 hover:text-neutral-600'
            }`}
          >
            <item.icon className="w-5 h-5" strokeWidth={isBottomActive(item.href) ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
    </>
  );
}
