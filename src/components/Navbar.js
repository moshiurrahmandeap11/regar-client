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
  Package, Ticket, Trophy, HelpCircle, Mail, LayoutDashboard
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

  return (
    <header className="sticky top-0 z-50 bg-[#1b2f48] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <span className="font-bold text-xl tracking-[0.2em] uppercase text-white">Regar</span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
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
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/15 transition-colors"
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
                  <div className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
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
                className="hidden md:flex px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
              >
                {t('login')}
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-white hover:bg-white/10"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-[#1b2f48] overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive(link.href) ? 'bg-white/10 text-white' : 'text-[#d5dde6]'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-white/10 flex gap-2">
                {!user && (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 text-sm border border-white/20 text-white rounded-lg">
                      {t('login')}
                    </Link>
                    <Link href="/signup" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 text-sm bg-white text-[#1b2f48] rounded-lg">
                      {t('signup')}
                    </Link>
                  </>
                )}
                <button
                  onClick={toggleLocale}
                  className="px-3 py-2 text-xs font-medium rounded-lg border border-white/20 text-white"
                >
                  <span className="inline-flex items-center gap-1.5"><FlagIcon locale={locale} /> {currentLocaleLabel}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
