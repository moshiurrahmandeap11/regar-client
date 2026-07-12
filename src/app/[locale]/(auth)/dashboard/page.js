'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Ticket, ShoppingBag, Gift, Trophy,
  Shield, Scale, Award, Globe, TicketCheck,
  Clock, ArrowRight, ChevronLeft, ChevronRight
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
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-neutral-500">{label}</p>
          <p className="text-xl font-bold text-neutral-900">{value}</p>
          <p className="text-[10px] text-neutral-400">{sublabel}</p>
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
  const [winnerIndex, setWinnerIndex] = useState(0);

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
  const raffleDescription = activeRaffle ? (locale === 'fr' ? activeRaffle.description : activeRaffle.descriptionEn || activeRaffle.description) : '';

  const runningRaffleImage = activeRaffle?.prizes?.[0]?.image || activeRaffle?.product?.images?.[0] || activeRaffle?.product?.colors?.find(c => c.image)?.image || '';

  const progressRaffle = activeRaffle;
  const progressRaffleTicketCount = progressRaffle?.soldTickets || progressRaffle?.ticketCount || 0;
  const progressRaffleMaxTickets = progressRaffle?.maxTickets || progressRaffle?.product?.maxTickets || 1000;
  const progressPercent = useMemo(() => progressRaffleMaxTickets > 0 ? Math.round((progressRaffleTicketCount / progressRaffleMaxTickets) * 100) : 0, [progressRaffleTicketCount, progressRaffleMaxTickets]);

  const rafflePrizes = useMemo(() => {
    const prizes = [];
    raffles.forEach((raffle) => { (raffle.prizes || []).forEach((prize) => prizes.push({ ...prize, raffleName: locale === 'fr' ? raffle.name : raffle.nameEn || raffle.name, raffleId: raffle._id })); });
    return prizes.slice(0, 5);
  }, [raffles, locale]);

  const giveawayImages = useMemo(() => {
    const images = [];
    raffles.forEach((raffle) => {
      const prizeImages = (raffle.prizes || []).map(p => p.image).filter(Boolean);
      const productImage = raffle.product?.images?.[0] || raffle.product?.colors?.find(c => c.image)?.image;
      if (prizeImages.length > 0) {
        images.push(...prizeImages);
      } else if (productImage) {
        images.push(productImage);
      }
    });
    return images.slice(0, 3);
  }, [raffles]);

  const latestWinner = winners[winnerIndex] || null;
  const t = (en, fr) => (locale === 'fr' ? fr : en);
  const isFr = locale === 'fr';

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
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Welcome + Countdown + Product - Horizontal Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Welcome */}
          <div className="lg:col-span-3 flex flex-col justify-center">
            <p className="text-neutral-500 text-sm">{t('Welcome back,', 'Bon retour,')}</p>
            <h1 className="text-2xl font-bold text-neutral-900">{user?.firstName || ''} {user?.lastName || ''}</h1>
            <div className="mt-2 w-12 h-1 bg-[#e2bd87] rounded-full" />
          </div>

          {/* Countdown */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl border border-neutral-200 p-5">
              <p className="text-center text-xs font-bold uppercase tracking-widest text-[#b88238] mb-3">{t('RAFFLE ENDS IN', 'TIRAGE DANS')}</p>
              {raffleEndDate ? (
                <div className="flex justify-center">
                  <CountdownTimer targetDate={raffleEndDate} locale={locale} variant="dashboard" />
                </div>
              ) : (
                <p className="text-center text-sm text-neutral-400">{t('No active raffle.', 'Aucun raffle actif.')}</p>
              )}
            </div>
          </div>

          {/* Product Image */}
          <div className="lg:col-span-3 flex items-center justify-center">
            {runningRaffleImage && (
              <div className="w-32 h-32 rounded-2xl overflow-hidden border border-neutral-200 bg-white shadow-sm">
                <img src={runningRaffleImage} alt={raffleName || 'Raffle'} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Stats Row - 4 columns */}
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StaggerItem><StatCard icon={TicketCheck} label={t('Total Entries', 'Total')} sublabel={t('All Time', 'Tous temps')} value={totalEntries} colorClass="bg-amber-50 text-[#b88238]" /></StaggerItem>
          <StaggerItem><StatCard icon={Gift} label={t('Active Raffles', 'Active')} sublabel={t('Joined', 'Rejoint')} value={activeRafflesCount} colorClass="bg-emerald-50 text-emerald-600" /></StaggerItem>
          <StaggerItem><StatCard icon={ShoppingBag} label={t('Total Orders', 'Orders')} sublabel={t('Orders', 'Commandes')} value={orders.length} colorClass="bg-blue-50 text-blue-600" /></StaggerItem>
          <StaggerItem><StatCard icon={Trophy} label={t('Prizes Won', 'Won')} sublabel={t('Won', 'Gagnés')} value={wins} colorClass="bg-purple-50 text-purple-600" /></StaggerItem>
        </StaggerContainer>

        {/* Active Giveaways + Recent Orders - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Active Giveaways */}
          <FadeIn>
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className="flex items-center justify-between mb-4">
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

                    {/* Prize Images Row with names */}
                    <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
                      {rafflePrizes.length > 0 ? rafflePrizes.map((prize, i) => (
                        <div key={i} className="flex-shrink-0 text-center">
                          <div className="w-20 h-20 rounded-lg bg-neutral-100 overflow-hidden border border-neutral-200 mx-auto">
                            {prize.image ? <img src={prize.image} alt={prize.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Trophy className="w-5 h-5 text-neutral-400" /></div>}
                          </div>
                          <p className="text-[10px] font-medium text-neutral-700 mt-1 truncate max-w-[80px]">{prize.name}</p>
                          {prize.value > 0 && <p className="text-[9px] text-neutral-400">{prize.value.toLocaleString()} CHF</p>}
                        </div>
                      )) : giveawayImages.slice(0, 3).map((img, i) => (
                        <div key={i} className="flex-shrink-0">
                          <div className="w-20 h-20 rounded-lg bg-neutral-100 overflow-hidden border border-neutral-200">
                            <img src={img} alt={raffleName} className="w-full h-full object-cover" />
                          </div>
                        </div>
                      ))}
                    </div>

                    <h3 className="font-bold text-sm text-neutral-900">{raffleName || t('Active Giveaway', 'Giveaway')}</h3>
                    {raffleDescription && (
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{raffleDescription}</p>
                    )}

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-neutral-500">{progressRaffleTicketCount.toLocaleString()} / {progressRaffleMaxTickets.toLocaleString()} {t('Entries', 'Entries')}</span>
                        <span className="text-[#b88238] font-semibold">{progressPercent}% {t('Completed', 'Complete')}</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#e2bd87] to-[#b88238] rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                      </div>
                    </div>

                    {raffleEndDate && (
                      <p className="text-[10px] text-neutral-400 mt-2">
                        {t('Ends on', 'Termine le')} {new Date(raffleEndDate).toLocaleString('fr-CH', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}

                    <Link href="/raffles" className="mt-3 block w-full text-center py-2.5 bg-[#b88238] hover:bg-[#a07030] text-white text-xs font-bold rounded-lg transition-colors">
                      {t('View Giveaway', 'Voir Giveaway')}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </FadeIn>

          {/* Recent Orders */}
          <FadeIn>
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-neutral-900">{t('Recent Orders', 'Orders')}</h2>
                <Link href="/orders" className="text-xs text-[#b88238] font-medium">{t('View All', 'Voir tout')}</Link>
              </div>
              {recentOrders.length === 0 ? (
                <div className="text-center py-6 text-neutral-400"><ShoppingBag className="w-6 h-6 mx-auto mb-1" /><p className="text-xs">{t('No orders yet', 'Aucune')}</p></div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => {
                    const orderState = getOrderState(order, locale);
                    const firstItem = order.items?.[0];
                    const ticketCount = (order.tickets || []).length;
                    return (
                      <div key={order._id} className="flex items-center gap-3 p-3 rounded-xl border border-neutral-100 hover:bg-neutral-50 transition-colors">
                        <div className="w-14 h-14 rounded-lg bg-neutral-100 overflow-hidden border border-neutral-200 flex-shrink-0">
                          {firstItem?.image ? <img src={firstItem.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-5 h-5 text-neutral-400" /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 truncate">{firstItem?.name || t('Premium Cap', 'Casquette')}</p>
                          <p className="text-[10px] text-neutral-500">{t('Order', 'Cmd')} #{order.orderNumber}</p>
                          <p className="text-[10px] text-neutral-400">{new Date(order.createdAt).toLocaleDateString('fr-CH')}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${orderState.tone}`}>{orderState.label}</span>
                          {ticketCount > 0 && (
                            <p className="text-[10px] text-neutral-500 mt-1">{ticketCount} {t('tickets', 'tickets')}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <Link href="/orders" className="flex items-center justify-center gap-1.5 py-2 text-xs text-[#b88238] font-medium hover:text-[#a07030] transition-colors">
                    {t('View All Orders', 'Voir toutes les commandes')}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </FadeIn>
        </div>

        {/* My Entries + Winner Updates - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* My Entries in Current Raffle */}
          <FadeIn>
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-neutral-900">{t('My Entries in Current Raffle', 'Mes tickets')}</h2>
                <span className="text-xs text-[#b88238] font-semibold">{t('Total', 'Total')} {totalEntries} {t('Entries', 'tickets')}</span>
              </div>
              {tickets.length === 0 ? (
                <div className="text-center py-6 text-neutral-400"><Ticket className="w-6 h-6 mx-auto mb-1" /><p className="text-xs">{t('No tickets yet', 'Aucun')}</p></div>
              ) : (
                <div className="space-y-3">
                  {Object.values(ticketsByRaffle).slice(0, 2).map((group) => {
                    const displayName = locale === 'fr' ? (group.raffle?.name || 'Unknown') : (group.raffle?.nameEn || group.raffle?.name || 'Unknown');
                    const visibleTickets = group.tickets.slice(0, 4);
                    const moreCount = group.tickets.length - visibleTickets.length;
                    return (
                      <div key={group.raffle?._id || displayName}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-xs text-neutral-900">{displayName}</h3>
                          <span className="text-[10px] text-neutral-500">{group.tickets.length} {t('entries', 'tickets')}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {visibleTickets.map((ticket) => (
                            <div key={ticket._id} className="text-center px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-50">
                              <p className="font-mono font-bold text-neutral-900 text-xs">{ticket.ticketNumber || '-'}</p>
                              <p className="text-[9px] text-neutral-400 mt-0.5">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('fr-CH') : ''}</p>
                              <span className="inline-block mt-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-semibold rounded-full">{t('Active', 'Actif')}</span>
                            </div>
                          ))}
                          {moreCount > 0 && (
                            <div className="flex items-center justify-center px-3 py-2 rounded-lg border border-dashed border-neutral-300">
                              <span className="text-xs font-bold text-[#b88238]">+{moreCount}</span>
                            </div>
                          )}
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
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-neutral-900">{t('Winner Updates', 'Winners')}</h2>
                <Link href="/winners" className="text-xs text-[#b88238] font-medium">{t('View All', 'Voir')}</Link>
              </div>
              {latestWinner ? (
                <div>
                  <div className="flex items-start gap-3 p-4 rounded-xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white">
                    {latestWinner.user?.avatar ? (
                      <img src={latestWinner.user.avatar} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e2bd87] to-[#b88238] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {latestWinner.user?.firstName?.[0] || ''}{latestWinner.user?.lastName?.[0] || ''}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-neutral-900 text-sm">{latestWinner.user?.firstName || ''} {latestWinner.user?.lastName || ''}</span>
                        <span className="px-1.5 py-0.5 bg-[#e2bd87]/15 text-[#b88238] text-[9px] font-bold uppercase rounded-full">{t('Won', 'Gagné')}</span>
                      </div>
                      <p className="text-xs text-neutral-700 mt-1">
                        <span className="text-[#b88238] font-semibold">{locale === 'fr' ? latestWinner.prize : latestWinner.prizeEn || latestWinner.prize}</span>
                      </p>
                      {latestWinner.createdAt && (
                        <p className="text-[10px] text-neutral-400 mt-1">
                          {t('Won on', 'Gagné le')} {new Date(latestWinner.createdAt).toLocaleDateString('fr-CH', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      )}
                      {(latestWinner.quote || latestWinner.quoteEn) && (
                        <p className="text-[10px] text-neutral-500 mt-2 italic">
                          &ldquo;{locale === 'fr' ? latestWinner.quote : latestWinner.quoteEn || latestWinner.quote}&rdquo;
                        </p>
                      )}
                    </div>
                    {latestWinner.user?.avatar && (
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={latestWinner.user.avatar} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  {/* Navigation arrows */}
                  {winners.length > 1 && (
                    <div className="flex items-center justify-end gap-2 mt-3">
                      <button
                        onClick={() => setWinnerIndex(prev => prev > 0 ? prev - 1 : winners.length - 1)}
                        className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-neutral-700 hover:border-neutral-300 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setWinnerIndex(prev => prev < winners.length - 1 ? prev + 1 : 0)}
                        className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-neutral-700 hover:border-neutral-300 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-neutral-400"><Trophy className="w-6 h-6 mx-auto mb-1" /><p className="text-xs">{t('No winners yet', 'Aucun')}</p></div>
              )}
            </div>
          </FadeIn>
        </div>

        {/* Trust Banner */}
        <FadeIn>
          <div className="bg-[#0f1419] rounded-2xl p-6 lg:p-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-[#e2bd87]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{t('100% Secure', '100% Securise')}</p>
                  <p className="text-xs text-white/50 mt-0.5">{t('Your data is always safe with us.', 'Vos donnees sont toujours en securite.')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Scale className="w-5 h-5 text-[#e2bd87]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{t('Fair & Transparent', 'Equitable & Transparent')}</p>
                  <p className="text-xs text-white/50 mt-0.5">{t('Random & verified winner selection.', 'Selection aleatoire et verifiee.')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-[#e2bd87]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{t('Verified Winners', 'Gagnants Verifies')}</p>
                  <p className="text-xs text-white/50 mt-0.5">{t('Real people, real prizes.', 'Vraies personnes, vrais prix.')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-[#e2bd87]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{t('Worldwide Shipping', 'Livraison Mondiale')}</p>
                  <p className="text-xs text-white/50 mt-0.5">{t('Fast & reliable delivery.', 'Livraison rapide et fiable.')}</p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
