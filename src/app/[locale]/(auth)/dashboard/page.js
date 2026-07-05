'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Ticket, ShoppingBag, Trophy, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Link } from '@/i18n/routing';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations';
import { getOrderState } from '@/lib/orderDisplay';

export default function DashboardPage() {
  const locale = useLocale();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/login`);
    }
  }, [user, loading, router, locale]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      try {
        const [ordersRes, ticketsRes] = await Promise.all([
          api.get('/api/orders'),
          api.get('/api/tickets/my'),
        ]);
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
        setTickets(Array.isArray(ticketsRes.data) ? ticketsRes.data : []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setPageLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full" /></div>;
  if (!user) return null;
  if (pageLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full" /></div>;

  const wins = tickets.filter((ticket) => ticket.isWinner).length;
  const spent = orders
    .filter((order) => order.paymentStatus === 'completed')
    .reduce((sum, order) => sum + (order.total || 0), 0);
  const recentOrders = orders.slice(0, 4);
  const recentTickets = tickets.slice(0, 4);

  const stats = [
    { icon: ShoppingBag, label: locale === 'fr' ? 'Commandes' : 'Orders', value: String(orders.length), color: 'bg-blue-100 text-blue-600' },
    { icon: Ticket, label: locale === 'fr' ? 'Tickets' : 'Tickets', value: String(tickets.length), color: 'bg-amber-100 text-amber-600' },
    { icon: Trophy, label: locale === 'fr' ? 'Gains' : 'Wins', value: String(wins), color: 'bg-green-100 text-green-600' },
    { icon: TrendingUp, label: locale === 'fr' ? 'Depenses' : 'Spent', value: `${spent.toFixed(2)} CHF`, color: 'bg-purple-100 text-purple-600' },
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
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-neutral-400">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">{locale === 'fr' ? 'Aucune commande pour le moment' : 'No orders yet'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => {
                    const orderState = getOrderState(order, locale);
                    return (
                      <div key={order._id} className="rounded-xl border border-neutral-200 p-3 text-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">{order.orderNumber}</p>
                            <p className="text-neutral-500 mt-1">{new Date(order.createdAt).toLocaleDateString('fr-CH')} - {order.total?.toFixed(2)} CHF</p>
                          </div>
                          <span className={`shrink-0 px-2 py-1 rounded-lg text-xs font-medium ${orderState.tone}`}>
                            {orderState.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
              {recentTickets.length === 0 ? (
                <div className="text-center py-8 text-neutral-400">
                  <Ticket className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">{locale === 'fr' ? 'Aucun ticket pour le moment' : 'No tickets yet'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTickets.map((ticket) => (
                    <div key={ticket._id} className="rounded-xl border border-neutral-200 p-3 text-sm">
                      <p className="font-mono font-medium">{ticket.ticketNumber}</p>
                      <p className="text-neutral-500 mt-1">{ticket.raffle?.name || 'Raffle TBD'} - {ticket.isWinner ? 'Winner' : 'Active'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
