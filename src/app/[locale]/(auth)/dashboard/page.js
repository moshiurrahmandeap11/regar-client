'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Ticket, ShoppingBag, Trophy, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from '@/i18n/routing';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations';

export default function DashboardPage() {
  const locale = useLocale();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/login`);
    }
  }, [user, loading, router, locale]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full" /></div>;
  if (!user) return null;

  const stats = [
    { icon: ShoppingBag, label: locale === 'fr' ? 'Commandes' : 'Orders', value: '0', color: 'bg-blue-100 text-blue-600' },
    { icon: Ticket, label: locale === 'fr' ? 'Tickets' : 'Tickets', value: '0', color: 'bg-amber-100 text-amber-600' },
    { icon: Trophy, label: locale === 'fr' ? 'Gains' : 'Wins', value: '0', color: 'bg-green-100 text-green-600' },
    { icon: TrendingUp, label: locale === 'fr' ? 'Depenses' : 'Spent', value: '0 CHF', color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="bg-neutral-900 rounded-2xl p-6 sm:p-8 text-white mb-8">
            <h1 className="text-2xl font-bold">
              {locale === 'fr' ? 'Bonjour' : 'Hello'}, {user.firstName}!
            </h1>
            <p className="text-neutral-400 mt-2">
              {locale === 'fr' ? 'Bienvenue sur votre tableau de bord' : 'Welcome to your dashboard'}
            </p>
          </div>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <StaggerItem key={i}>
              <div className="bg-white rounded-2xl border border-neutral-200 p-5">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                <p className="text-sm text-neutral-500">{stat.label}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FadeIn>
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{locale === 'fr' ? 'Mes commandes' : 'My orders'}</h2>
                <Link href="/orders" className="text-sm text-neutral-500 hover:text-neutral-900">
                  {locale === 'fr' ? 'Voir tout' : 'View all'}
                </Link>
              </div>
              <div className="text-center py-8 text-neutral-400">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">{locale === 'fr' ? 'Aucune commande pour le moment' : 'No orders yet'}</p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{locale === 'fr' ? 'Mes tickets' : 'My tickets'}</h2>
                <Link href="/tickets" className="text-sm text-neutral-500 hover:text-neutral-900">
                  {locale === 'fr' ? 'Voir tout' : 'View all'}
                </Link>
              </div>
              <div className="text-center py-8 text-neutral-400">
                <Ticket className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">{locale === 'fr' ? 'Aucun ticket pour le moment' : 'No tickets yet'}</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
