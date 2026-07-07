'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Ticket, ShoppingBag, Gift, Trophy, Bell, User, CreditCard, HelpCircle, LogOut,
  Crown, ChevronRight, ExternalLink, Shield, Scale, Award, Globe, TicketCheck, CheckCircle2,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Link } from '@/i18n/routing';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations';
import { motion } from 'framer-motion';
import { getOrderState } from '@/lib/orderDisplay';
import { PageLoader, InlineLoader } from '@/components/Loader';
import CountdownTimer from '@/components/CountdownTimer';

function StatCard({ icon: Icon, label, sublabel, value, colorClass }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-neutral-500">{label}</p>
          <p className="text-xl font-bold text-neutral-900 mt-0.5">{value}</p>
          <p className="text-[10px] text-neutral-400 mt-0.5">{sublabel}</p>
        </div>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const locale = useLocale();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [raffles, setRaffles] = useState([]);
  const [winners, setWinners] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => { if (!authLoading && !user) router.push(`/${locale}/login`); }, [user, authLoading, router, locale]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const [ordersRes, ticketsRes, rafflesRes, winnersRes] = await Promise.all([
          api.get('/api/orders'), api.get('/api/tickets/my'), api.get('/api/raffles?status=active'), api.get('/api/tickets/winners?limit=5'),
        ]);
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
        setTickets(Array.isArray(ticketsRes.data) ? ticketsRes.data : []);
        setRaffles(Array.isArray(rafflesRes.data) ? rafflesRes.data : []);
        setWinners(Array.isArray(winnersRes.data) ? winnersRes.data : []);
      } catch (error) {
        console.error('Dashboard load error:', error);
        toast.error(error.response?.data?.message || 'Failed to load');
      } finally { setPageLoading(false); }
    };
    load();
  }, [user]);

  const wins = useMemo(() => tickets.filter((t) => t.isWinner).length, [tickets]);
  const recentOrders = useMemo(() => orders.slice(0, 3), [orders]);
  const totalEntries = tickets.length;
  const activeRafflesCount = useMemo(() => new Set(tickets.map(t => t.raffle?._id || t.raffle)).size, [tickets]);

  const ticketsByRaffle = useMemo(() => {
    const groups = {};
    const unassigned = [];
    tickets.forEach(ticket => {
      const raffleId = ticket.raffle?._id || ticket.raffle;
      if (!raffleId) { unassigned.push(ticket); return; }
      if (!groups[raffleId]) groups[raffleId] = { raffle: ticket.raffle, tickets: [] };
      groups[raffleId].tickets.push(ticket);
    });
    if (unassigned.length > 0) groups['__unassigned__'] = { raffle: { name: 'Unassigned', nameEn: 'Unassigned', _id: '__unassigned__' }, tickets: unassigned };
    return groups;
  }, [tickets]);

  const activeRaffle = raffles[0] || null;
  const raffleEndDate = activeRaffle?.endDate || null;
  const raffleName = activeRaffle ? (locale === 'fr' ? activeRaffle.name : activeRaffle.nameEn || activeRaffle.name) : '';

  const progressRaffle = activeRaffle;
  const progressRaffleTicketCount = progressRaffle?.ticketCount || 0;
  const progressRaffleMaxTickets = progressRaffle?.product?.maxTickets || 1000;
  const progressPercent = useMemo(() => progressRaffleMaxTickets > 0 ? Math.round((progressRaffleTicketCount / progressRaffleMaxTickets) * 100) : 0, [progressRaffleTicketCount, progressRaffleMaxTickets]);

  const rafflePrizes = useMemo(() => {
    const prizes = [];
    raffles.forEach((raffle) => { (raffle.prizes || []).forEach((prize) => prizes.push({ ...prize, raffleName: locale === 'fr' ? raffle.name : raffle.nameEn || raffle.name, raffleId: raffle._id })); });
    return prizes.slice(0, 5);
  }, [raffles, locale]);

  const latestWinner = winners[0] || null;
  const t = (en, fr) => (locale === 'fr' ? fr : en);

  if (authLoading) return <PageLoader color="primary" />;
  if (!user) return null;

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <InlineLoader size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Desktop Welcome */}
        <div className="hidden lg:block mb-6">
          <p className="text-neutral-500 text-sm">{t('Welcome back,', 'Bon retour,')}</p>
          <h1 className="text-2xl font-bold text-neutral-900">{user?.firstName || ''} {user?.lastName || ''}</h1>
          <div className="mt-2 w-16 h-1 bg-[#e2bd87] rounded-full" />
        </div>

        {/* Raffle Countdown */}
        <FadeIn>
          <div className="bg-[#0f1419] rounded-2xl p-5 mb-5 text-white">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-white/50 mb-4">{raffleName || t('RAFFLE ENDS IN', 'TIRAGE DANS')}</p>
            {raffleEndDate ? (
              <div className="flex justify-center">
                <CountdownTimer targetDate={raffleEndDate} locale={locale} variant="dark" />
              </div>
            ) : (
              <p className="text-center text-sm text-white/60">{t('No active raffle.', 'Aucun raffle actif.')}</p>
            )}
          </div>
        </FadeIn>

        {/* Stats Row - 2x2 on mobile */}
        <StaggerContainer className="grid grid-cols-2 gap-3 mb-5">
          <StaggerItem><StatCard icon={TicketCheck} label={t('Total Entries', 'Total')} sublabel={t('All Time', 'Tous temps')} value={totalEntries} colorClass="bg-amber-50 text-[#b88238]" /></StaggerItem>
          <StaggerItem><StatCard icon={Gift} label={t('Active Raffles', 'Active')} sublabel={t('Joined', 'Rejoint')} value={activeRafflesCount} colorClass="bg-emerald-50 text-emerald-600" /></StaggerItem>
          <StaggerItem><StatCard icon={ShoppingBag} label={t('Total Orders', 'Orders')} sublabel={t('Orders', 'Commandes')} value={orders.length} colorClass="bg-blue-50 text-blue-600" /></StaggerItem>
          <StaggerItem><StatCard icon={Trophy} label={t('Prizes Won', 'Won')} sublabel={t('Won', 'Gagnés')} value={wins} colorClass="bg-purple-50 text-purple-600" /></StaggerItem>
        </StaggerContainer>

        {/* Active Giveaways */}
        <FadeIn>
          <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-neutral-900">{t('Active Giveaways', 'Giveaways')}</h2>
              <Link href="/raffles" className="text-xs text-[#b88238] font-medium">{t('View All', 'Voir tout')}</Link>
            </div>

            {raffles.length === 0 ? (
              <div className="text-center py-6 text-neutral-400"><Gift className="w-6 h-6 mx-auto mb-1" /><p className="text-xs">{t('No active giveaways', 'Aucun')}</p></div>
            ) : (
              <div className="rounded-xl border border-neutral-200 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />LIVE
                    </span>
                  </div>
                  <div className="flex gap-2 mb-3">
                    {rafflePrizes.slice(0, 3).map((prize, i) => (
                      <div key={i} className="w-16 h-16 rounded-lg bg-neutral-100 overflow-hidden border border-neutral-200">
                        {prize.image ? <img src={prize.image} alt={prize.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Trophy className="w-5 h-5 text-neutral-400" /></div>}
                      </div>
                    ))}
                  </div>
                  <h3 className="font-bold text-sm text-neutral-900">{raffleName || t('Active Giveaway', 'Giveaway')}</h3>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-neutral-500">{progressRaffleTicketCount.toLocaleString()} / {progressRaffleMaxTickets.toLocaleString()} {t('Entries', 'Entries')}</span>
                      <span className="text-[#b88238] font-semibold">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#e2bd87] to-[#b88238] rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>
                  <Link href="/raffles" className="mt-3 block w-full text-center py-2.5 bg-[#b88238] hover:bg-[#a07030] text-white text-xs font-bold rounded-lg">{t('View Giveaway', 'Voir Giveaway')}</Link>
                </div>
              </div>
            )}
          </div>
        </FadeIn>

        {/* Recent Orders */}
        <FadeIn>
          <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-neutral-900">{t('Recent Orders', 'Orders')}</h2>
              <Link href="/orders" className="text-xs text-[#b88238] font-medium">{t('View All', 'Voir tout')}</Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="text-center py-6 text-neutral-400"><ShoppingBag className="w-6 h-6 mx-auto mb-1" /><p className="text-xs">{t('No orders yet', 'Aucune')}</p></div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const orderState = getOrderState(order, locale);
                  const productImage = order.items?.[0]?.image;
                  const productName = order.items?.[0]?.name || t('Premium Cap', 'Casquette');
                  return (
                    <div key={order._id} className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-lg bg-neutral-100 overflow-hidden border border-neutral-200 flex-shrink-0">
                        {productImage ? <img src={productImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-5 h-5 text-neutral-400" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">{productName}</p>
                        <p className="text-[10px] text-neutral-500">{t('Order', 'Cmd')} #{order.orderNumber}</p>
                        <p className="text-[10px] text-neutral-400">{new Date(order.createdAt).toLocaleDateString('fr-CH')}</p>
                      </div>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${orderState.tone}`}>{orderState.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </FadeIn>

        {/* My Entries */}
        <FadeIn>
          <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-neutral-900">{t('My Entries', 'Tickets')}</h2>
              <span className="text-xs text-[#b88238] font-semibold">{totalEntries} {t('total', 'total')}</span>
            </div>
            {tickets.length === 0 ? (
              <div className="text-center py-6 text-neutral-400"><Ticket className="w-6 h-6 mx-auto mb-1" /><p className="text-xs">{t('No tickets yet', 'Aucun')}</p></div>
            ) : (
              <div className="space-y-3">
                {Object.values(ticketsByRaffle).slice(0, 2).map((group) => {
                  const displayName = locale === 'fr' ? (group.raffle?.name || 'Unknown') : (group.raffle?.nameEn || group.raffle?.name || 'Unknown');
                  return (
                    <div key={group.raffle?._id || displayName} className="border border-neutral-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-xs text-neutral-900">{displayName}</h3>
                        <span className="text-[10px] text-neutral-500">{group.tickets.length} {t('entries', 'tickets')}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {group.tickets.slice(0, 6).map((ticket) => (
                          <div key={ticket._id} className="text-center p-1.5 rounded-lg border border-neutral-200">
                            <p className="font-mono font-bold text-neutral-900 text-xs">{ticket.ticketNumber || '-'}</p>
                            <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-semibold rounded-full">{t('Active', 'Actif')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </FadeIn>

        {/* Winner Updates */}
        <FadeIn>
          <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-neutral-900">{t('Winner Updates', 'Winners')}</h2>
              <Link href="/winners" className="text-xs text-[#b88238] font-medium">{t('View All', 'Voir')}</Link>
            </div>
            {latestWinner ? (
              <div className="flex items-start gap-3 p-3 rounded-xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e2bd87] to-[#b88238] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {latestWinner.user?.firstName?.[0] || ''}{latestWinner.user?.lastName?.[0] || ''}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-neutral-900 text-xs">{latestWinner.user?.firstName || ''} {latestWinner.user?.lastName || ''}</span>
                    <span className="px-1.5 py-0.5 bg-[#e2bd87]/15 text-[#b88238] text-[9px] font-bold uppercase rounded-full">{t('Won', 'Gagné')}</span>
                  </div>
                  <p className="text-xs text-neutral-700 mt-0.5"><span className="text-[#b88238] font-semibold">{locale === 'fr' ? latestWinner.prize : latestWinner.prizeEn || latestWinner.prize}</span></p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-neutral-400"><Trophy className="w-6 h-6 mx-auto mb-1" /><p className="text-xs">{t('No winners yet', 'Aucun')}</p></div>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
