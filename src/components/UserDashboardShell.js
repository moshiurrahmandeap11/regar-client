'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  CheckCircle2,
  CreditCard,
  HelpCircle,
  LogOut,
  Scale,
  ShoppingBag,
  Ticket,
  Trophy,
  User,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import BrandLogo from '@/components/BrandLogo';
import { routing } from '@/i18n/routing';

const shellRoutes = ['/dashboard', '/tickets', '/orders', '/order-detail', '/notifications', '/profile'];

export default function UserDashboardShell({ children }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [raffleImage, setRaffleImage] = useState('');

  const showShell = shellRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`) || pathname === `/${locale}${route}`);
  const t = (en, fr) => (locale === 'fr' ? fr : en);

  useEffect(() => {
    // Check saved locale preference and redirect if needed
    if (typeof window === 'undefined') return;
    const savedLocale = localStorage.getItem('user-locale');
    if (savedLocale && savedLocale !== locale && routing.locales.includes(savedLocale)) {
      const newPath = pathname.replace(new RegExp(`^/${locale}(/|$)`), `/${savedLocale}$1`);
      if (newPath !== pathname) {
        window.location.href = newPath;
      }
    }
  }, [locale, pathname]);

  useEffect(() => {
    if (!showShell || !user) return;
    const loadRaffle = async () => {
      try {
        const res = await api.get('/api/raffles?status=active');
        const raffle = Array.isArray(res.data) ? res.data[0] : null;
        setRaffleImage(raffle?.prizes?.[0]?.image || raffle?.product?.images?.[0] || raffle?.product?.colors?.find((color) => color.image)?.image || '');
      } catch {
        setRaffleImage('');
      }
    };
    loadRaffle();
  }, [showShell, user]);

  const navItems = useMemo(() => ([
    { icon: CheckCircle2, label: t('Dashboard', 'Tableau de bord'), href: '/dashboard' },
    { icon: Ticket, label: t('My Entries', 'Mes participations'), href: '/tickets' },
    { icon: ShoppingBag, label: t('My Orders', 'Mes commandes'), href: '/orders' },
    { icon: Scale, label: t('Active Giveaways', 'Giveaways actifs'), href: '/raffles' },
    { icon: Trophy, label: t('Prizes Won', 'Prix gagnes'), href: '/winners' },
    { icon: Bell, label: t('Winner Updates', 'Updates gagnants'), href: '/notifications' },
    { icon: User, label: t('Profile Settings', 'Profil'), href: '/profile' },
    { icon: CreditCard, label: t('Payment Methods', 'Paiements'), href: '/payment-methods' },
    { icon: HelpCircle, label: t('Support', 'Support'), href: '/contact' },
  ]), [locale]);

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === `/${locale}/dashboard`;
    return pathname === href || pathname.startsWith(`${href}/`) || pathname === `/${locale}${href}`;
  };

  if (!showShell) return children;

  return (
    <div className="min-h-screen bg-neutral-50 lg:pl-[260px]">
      <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 z-40 w-[260px] flex-col border-r border-white/10 bg-[#07090c] text-white">
        <div className="dashboard-scrollbar flex-1 overflow-y-auto px-4 py-5">
          <div className="flex justify-center py-2">
            <BrandLogo size="sm" />
          </div>

          <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 overflow-hidden rounded-full border border-white/10 bg-white/10 flex items-center justify-center">
                {user?.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : <User className="h-6 w-6 text-white/70" />}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-white">{user?.firstName || 'User'} {user?.lastName || ''}</p>
                <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#d99600]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t('Verified User', 'Utilisateur verifie')}
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-center text-xs font-semibold text-white/85">
              User ID: #{user?._id?.slice(-7)?.toUpperCase() || 'REGAR'}
            </div>
          </div>

          <nav className="mt-5 space-y-1.5">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                    active
                      ? 'bg-[#d99600]/20 text-[#ffc14a] shadow-[inset_3px_0_0_#d99600]'
                      : 'text-white/72 hover:bg-white/[0.07] hover:text-white'
                  }`}
                >
                  <item.icon className={`h-4.5 w-4.5 ${active ? 'text-[#ffc14a]' : 'text-white/55 group-hover:text-white/85'}`} />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => { logout(); router.push(`/${locale}/login`); }}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white/72 hover:bg-white/[0.07] hover:text-white transition-all"
            >
              <LogOut className="h-4.5 w-4.5 text-white/55" />
              {t('Logout', 'Deconnexion')}
            </button>
          </nav>
        </div>

        <div className="p-4">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.035] p-4 text-center">
            {raffleImage ? (
              <div className="mx-auto mb-4 h-24 w-36 overflow-hidden rounded-xl">
                <img src={raffleImage} alt="" className="h-full w-full object-contain" />
              </div>
            ) : null}
            <p className="text-base font-black leading-snug text-white">{t('Buy Cap, Enter Raffle.', 'Achetez, participez.')}</p>
            <p className="mt-1 text-base font-black leading-snug text-white">{t('Win Big Prizes!', 'Gagnez gros !')}</p>
            <Link href="/products" className="mt-4 flex h-10 items-center justify-center rounded-lg bg-[#d99600] text-xs font-black uppercase text-white hover:bg-[#c28500] transition-colors">
              {t('Shop Now', 'Acheter')}
            </Link>
          </div>
        </div>
      </aside>
      {children}
    </div>
  );
}
