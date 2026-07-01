'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import NextLink from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, ShoppingBag, User, LogOut, ChevronDown,
  Home, Package, Ticket, Trophy, HelpCircle, Mail, LayoutDashboard
} from 'lucide-react';

export default function Navbar() {
  const t = useTranslations('Nav');
  const locale = useLocale();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: t('home'), icon: Home },
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

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-bold text-xl tracking-tight">Regar</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-neutral-100 text-neutral-900'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLocale}
              className="hidden sm:flex px-2 py-1 text-xs font-medium rounded-md border border-neutral-200 hover:bg-neutral-50 transition-colors"
            >
              {locale === 'fr' ? 'EN' : 'FR'}
            </button>

            <Link href="/cart" className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors">
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
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
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
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100"
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
            className="md:hidden border-t border-neutral-200 bg-white overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive(link.href) ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-600'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-neutral-100 flex gap-2">
                {!user && (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 text-sm border rounded-lg">
                      {t('login')}
                    </Link>
                    <Link href="/signup" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 text-sm bg-neutral-900 text-white rounded-lg">
                      {t('signup')}
                    </Link>
                  </>
                )}
                <button
                  onClick={toggleLocale}
                  className="px-3 py-2 text-xs font-medium rounded-lg border border-neutral-200"
                >
                  {locale === 'fr' ? 'EN' : 'FR'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
