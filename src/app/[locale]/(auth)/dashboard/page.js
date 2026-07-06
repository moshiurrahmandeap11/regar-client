'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Ticket, ShoppingBag, Gift, Trophy, Bell, User, CreditCard, HelpCircle, LogOut,
  Crown, ChevronRight, ExternalLink, Shield, Scale, Award, Globe, TicketCheck, CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Link } from '@/i18n/routing';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations';
import { getOrderState } from '@/lib/orderDisplay';
import CountdownTimer from '@/components/CountdownTimer';

const sidebarNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', labelFr: 'Tableau de bord', href: '/dashboard', active: true },
  { icon: TicketCheck, label: 'My Entries', labelFr: 'Mes participations', href: '/tickets' },
  { icon: ShoppingBag, label: 'My Orders', labelFr: 'Mes commandes', href: '/orders' },
  { icon: Gift, label: 'Active Giveaways', labelFr: 'Giveaways actifs', href: '/raffles' },
  { icon: Trophy, label: 'Prizes Won', labelFr: 'Prix gagnés', href: '/winners' },
  { icon: Bell, label: 'Winner Updates', labelFr: 'Mises à jour gagnants', href: '/winners' },
  { icon: User, label: 'Profile Settings', labelFr: 'Paramètres profil', href: '/profile' },
  { icon: CreditCard, label: 'Payment Methods', labelFr: 'Méthodes de paiement', href: '/profile' },
  { icon: HelpCircle, label: 'Support', labelFr: 'Support', href: '/contact' },
  { icon: LogOut, label: 'Logout', labelFr: 'Déconnexion', href: '/logout', isLogout: true },
];

function Sidebar({ user, locale, mobileOpen, setMobileOpen }) {
  const { logout } = useAuth();
  const t = (en, fr) => (locale === 'fr' ? fr : en);

  const userInitials = useMemo(() => {
    if (!user) return '?';
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    return (first + last) || '?';
  }, [user]);

  const userId = useMemo(() => {
    if (!user) return 'CR-0000';
    const idStr = user._id?.toString?.() || String(user._id) || '';
    if (idStr) return idStr.slice(-6).toUpperCase();
    return 'CR-0000';
  }, [user]);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-[#0f1419] border-r border-white/5 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="px-6 pt-6 pb-4">
          <Link href="/" className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-[#e2bd87]" />
            <span className="text-xl font-bold tracking-wider text-white">
              CAP<span className="text-[#e2bd87]">RAFFLE</span>
            </span>
          </Link>
        </div>

        {/* User Profile */}
        <div className="px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-[#e2bd87]/30" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e2bd87] to-[#b88238] flex items-center justify-center text-white font-bold text-lg">
                {userInitials}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-semibold text-sm">{user?.firstName || ''} {user?.lastName || ''}</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#e2bd87]" />
                <span className="text-xs text-[#e2bd87]">{t('Verified User', 'Utilisateur vérifié')}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 px-2 py-1.5 bg-white/5 rounded-md text-center">
            <span className="text-xs text-neutral-400">User ID: </span>
            <span className="text-xs text-white font-mono">#{userId}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {sidebarNavItems.map((item) => {
            const isLogout = item.isLogout;
            const handleClick = isLogout ? () => { logout(); } : undefined;
            const content = (
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  item.active
                    ? 'bg-[#e2bd87]/15 text-[#e2bd87] border border-[#e2bd87]/20'
                    : isLogout
                    ? 'text-red-400 hover:bg-red-500/10'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
                onClick={handleClick}
              >
                <item.icon className="w-5 h-5" />
                <span>{locale === 'fr' ? item.labelFr : item.label}</span>
                {item.active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#e2bd87]" />}
              </div>
            );
            return isLogout ? (
              <div key={item.label}>{content}</div>
            ) : (
              <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)}>
                {content}
              </Link>
            );
          })}
        </nav>

        {/* Promo Card */}
        <div className="px-4 pb-6">
          <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-white/10 p-4">
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
              <Crown className="w-full h-full text-[#e2bd87]" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg bg-[#e2bd87]/10 flex items-center justify-center mb-3">
                <Crown className="w-6 h-6 text-[#e2bd87]" />
              </div>
              <p className="text-white font-bold text-sm leading-tight">
                {t('Buy Cap. Enter Raffle.', 'Achetez une casquette.')}
              </p>
              <p className="text-white font-bold text-sm leading-tight mb-3">
                {t('Win Big Prizes!', 'Gagnez de gros prix!')}
              </p>
              <Link
                href="/products"
                className="inline-flex items-center justify-center w-full px-4 py-2 bg-[#e2bd87] hover:bg-[#d4af7a] text-[#0f1419] text-xs font-bold rounded-lg transition-colors"
              >
                {t('SHOP NOW', 'ACHETER')}
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function StatCard({ icon: Icon, label, sublabel, value, colorClass }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500">{label}</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{value}</p>
          <p className="text-xs text-neutral-400 mt-0.5">{sublabel}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
          <Icon className="w-5 h-5" />
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ALL hooks must be called before any conditional returns
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${locale}/login`);
    }
  }, [user, authLoading, router, locale]);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      try {
        const [ordersRes, ticketsRes, rafflesRes, winnersRes] = await Promise.all([
          api.get('/api/orders'),
          api.get('/api/tickets/my'),
          api.get('/api/raffles?status=active'),
          api.get('/api/tickets/winners?limit=5'),
        ]);
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
        setTickets(Array.isArray(ticketsRes.data) ? ticketsRes.data : []);
        setRaffles(Array.isArray(rafflesRes.data) ? rafflesRes.data : []);
        setWinners(Array.isArray(winnersRes.data) ? winnersRes.data : []);
      } catch (error) {
        console.error('Dashboard load error:', error);
        toast.error(error.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setPageLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // Compute ALL derived values with hooks BEFORE any conditional returns
  const wins = useMemo(() => tickets.filter((ticket) => ticket.isWinner).length, [tickets]);
  const recentOrders = useMemo(() => orders.slice(0, 3), [orders]);
  const totalEntries = tickets.length;
  const activeRafflesCount = useMemo(() => new Set(tickets.map(t => t.raffle?._id || t.raffle)).size, [tickets]);

  // Group tickets by raffle for "My Entries" section
  const ticketsByRaffle = useMemo(() => {
    const groups = {};
    tickets.forEach(ticket => {
      const raffleId = ticket.raffle?._id || ticket.raffle;
      if (!raffleId) return;
      if (!groups[raffleId]) {
        groups[raffleId] = {
          raffle: ticket.raffle,
          tickets: [],
        };
      }
      groups[raffleId].tickets.push(ticket);
    });
    return groups;
  }, [tickets]);

  const activeRaffle = raffles[0] || null;
  const raffleEndDate = activeRaffle?.endDate || null;
  const raffleName = activeRaffle ? (locale === 'fr' ? activeRaffle.name : activeRaffle.nameEn || activeRaffle.name) : '';

  // Per-raffle progress: use first active raffle's ticketCount and product.maxTickets
  const progressRaffle = activeRaffle;
  const progressRaffleTicketCount = progressRaffle?.ticketCount || 0;
  const progressRaffleMaxTickets = progressRaffle?.product?.maxTickets || 1000;
  const progressPercent = useMemo(() => {
    if (progressRaffleMaxTickets > 0) {
      return Math.round((progressRaffleTicketCount / progressRaffleMaxTickets) * 100);
    }
    return 0;
  }, [progressRaffleTicketCount, progressRaffleMaxTickets]);

  // Participant count: SUM of all ticket counts across raffles
  const totalSoldTickets = useMemo(() => raffles.reduce((sum, r) => sum + (r.ticketCount || 0), 0), [raffles]);

  const rafflePrizes = useMemo(() => {
    const prizes = [];
    raffles.forEach((raffle) => {
      (raffle.prizes || []).forEach((prize) => {
        prizes.push({
          ...prize,
          raffleName: locale === 'fr' ? raffle.name : raffle.nameEn || raffle.name,
          raffleId: raffle._id,
        });
      });
    });
    return prizes.slice(0, 5);
  }, [raffles, locale]);

  const latestWinner = winners[0] || null;

  const t = (en, fr) => (locale === 'fr' ? fr : en);

  // NOW conditional returns are safe - all hooks have been called
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin w-8 h-8 border-2 border-[#e2bd87] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  if (pageLoading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar user={user} locale={locale} mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />
        <div className="flex-1 flex items-center justify-center bg-neutral-50">
          <div className="animate-spin w-8 h-8 border-2 border-[#e2bd87] border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <Sidebar user={user} locale={locale} mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-neutral-100"
          >
            <LayoutDashboard className="w-5 h-5 text-neutral-700" />
          </button>
          <span className="font-bold text-lg tracking-wider">
            CAP<span className="text-[#e2bd87]">RAFFLE</span>
          </span>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e2bd87] to-[#b88238] flex items-center justify-center text-white text-xs font-bold">
            {user?.firstName?.[0] || ''}{user?.lastName?.[0] || ''}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Welcome Header */}
          <FadeIn>
            <div className="mb-8">
              <p className="text-neutral-500 text-sm">{t('Welcome back,', 'Bon retour,')}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mt-0.5">
                {user?.firstName || ''} {user?.lastName || ''}
              </h1>
              <div className="mt-2 w-16 h-1 bg-[#e2bd87] rounded-full" />
            </div>
          </FadeIn>

          {/* Raffle Countdown + Cap Image */}
          <FadeIn delay={0.05}>
            <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs font-bold tracking-widest uppercase text-[#b88238] mb-3">
                    {raffleName || t('RAFFLE ENDS IN', 'TIRAGE DANS')}
                  </p>
                  {raffleEndDate ? (
                    <CountdownTimer targetDate={raffleEndDate} locale={locale} variant="dashboard" />
                  ) : (
                    <p className="text-sm text-neutral-500">{t('No active raffle at the moment.', 'Aucun raffle actif pour le moment.')}</p>
                  )}
                </div>
                <div className="hidden sm:block">
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] flex items-center justify-center border border-[#e2bd87]/20">
                    <Crown className="w-12 h-12 text-[#e2bd87]" />
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Stats Row */}
          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StaggerItem>
              <StatCard
                icon={TicketCheck}
                label={t('Total Entries', 'Total participations')}
                sublabel={t('All Time', 'Tous temps')}
                value={totalEntries}
                colorClass="bg-amber-50 text-[#b88238]"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                icon={Gift}
                label={t('Active Raffles', 'Raffles actives')}
                sublabel={t('Joined', 'Rejoint')}
                value={activeRafflesCount}
                colorClass="bg-emerald-50 text-emerald-600"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                icon={ShoppingBag}
                label={t('Total Orders', 'Total commandes')}
                sublabel={t('Orders', 'Commandes')}
                value={orders.length}
                colorClass="bg-blue-50 text-blue-600"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                icon={Trophy}
                label={t('Prizes Won', 'Prix gagnés')}
                sublabel={t('Won', 'Gagnés')}
                value={wins}
                colorClass="bg-purple-50 text-purple-600"
              />
            </StaggerItem>
          </StaggerContainer>

          {/* Active Giveaways + Recent Orders */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            {/* Active Giveaways */}
            <FadeIn>
              <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-neutral-900">{t('Active Giveaways', 'Giveaways actifs')}</h2>
                  <Link href="/raffles" className="text-sm text-[#b88238] hover:text-[#e2bd87] font-medium flex items-center gap-1">
                    {t('View All', 'Voir tout')} <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {raffles.length === 0 ? (
                  <div className="text-center py-8 text-neutral-400">
                    <Gift className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">{t('No active giveaways', 'Aucun giveaway actif')}</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-neutral-200 overflow-hidden">
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          LIVE
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-shrink-0">
                          <div className="flex gap-2">
                            {rafflePrizes.slice(0, 3).map((prize, i) => (
                              <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-neutral-100 overflow-hidden border border-neutral-200">
                                {prize.image ? (
                                  <img src={prize.image} alt={prize.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Trophy className="w-6 h-6 text-neutral-400" />
                                  </div>
                                )}
                              </div>
                            ))}
                            {rafflePrizes.length === 0 && (
                              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-neutral-100 flex items-center justify-center border border-neutral-200">
                                <Trophy className="w-6 h-6 text-neutral-400" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-neutral-900 text-sm sm:text-base">
                            {raffleName || t('Active Giveaway', 'Giveaway Actif')}
                          </h3>
                          <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                            {rafflePrizes.length > 0
                              ? t(`Win ${rafflePrizes.map(p => p.name).join(', ')} and more amazing prizes!`,
                                  `Gagnez ${rafflePrizes.map(p => p.name).join(', ')} et plus de prix incroyables!`)
                              : t('Join now for a chance to win amazing prizes!', 'Rejoignez maintenant pour gagner des prix incroyables!')}
                          </p>
                        </div>
                      </div>

                      {/* Progress - per-raffle using first active raffle */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-neutral-500">
                            {progressRaffleTicketCount.toLocaleString()} / {progressRaffleMaxTickets.toLocaleString()} {t('Entries', 'Participations')}
                          </span>
                          <span className="text-[#b88238] font-semibold">{progressPercent}% {t('Completed', 'Complété')}</span>
                        </div>
                        <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#e2bd87] to-[#b88238] rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                        </div>
                      </div>

                      {raffleEndDate && (
                        <p className="text-xs text-neutral-400 mt-3">
                          {t('Ends on', 'Se termine le')} {new Date(raffleEndDate).toLocaleDateString(locale === 'fr' ? 'fr-CH' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                          , {new Date(raffleEndDate).toLocaleTimeString(locale === 'fr' ? 'fr-CH' : 'en-US', { hour: '2-digit', minute: '2-digit' })} (UTC)
                        </p>
                      )}
                    </div>

                    {/* Prize Grid - actual prizes from API */}
                    {rafflePrizes.length > 0 && (
                      <div className="border-t border-neutral-200 p-4">
                        <div className="grid grid-cols-5 gap-2">
                          {rafflePrizes.map((prize, i) => (
                            <div key={i} className="text-center">
                              <div className="w-full aspect-square rounded-lg bg-neutral-100 overflow-hidden border border-neutral-200 mb-1.5">
                                {prize.image ? (
                                  <img src={prize.image} alt={prize.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Trophy className="w-4 h-4 text-neutral-400" />
                                  </div>
                                )}
                              </div>
                              <p className="text-[10px] text-neutral-700 font-medium truncate">{prize.name}</p>
                              {prize.value ? <p className="text-[10px] text-neutral-400">{Number(prize.value).toLocaleString()} CHF</p> : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </FadeIn>

            {/* Recent Orders */}
            <FadeIn delay={0.1}>
              <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-neutral-900">{t('Recent Orders', 'Commandes récentes')}</h2>
                  <Link href="/orders" className="text-sm text-[#b88238] hover:text-[#e2bd87] font-medium flex items-center gap-1">
                    {t('View All', 'Voir tout')} <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-neutral-400">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">{t('No orders yet', 'Aucune commande')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((order) => {
                      const orderState = getOrderState(order, locale);
                      const productImage = order.items?.[0]?.image;
                      const productName = order.items?.[0]?.name || t('Premium Cap', 'Casquette premium');
                      return (
                        <div key={order._id} className="flex items-center gap-3 p-3 rounded-lg border border-neutral-100 hover:border-neutral-200 transition-colors">
                          <div className="w-14 h-14 rounded-lg bg-neutral-100 overflow-hidden border border-neutral-200 flex-shrink-0">
                            {productImage ? (
                              <img src={productImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5 text-neutral-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 truncate">{productName}</p>
                            <p className="text-xs text-neutral-500 mt-0.5">{t('Order', 'Commande')} #{order.orderNumber}</p>
                            <p className="text-xs text-neutral-400">{new Date(order.createdAt).toLocaleDateString('fr-CH')}</p>
                          </div>
                          <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${orderState.tone}`}>
                            {orderState.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <Link
                  href="/orders"
                  className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 border border-neutral-200 rounded-lg text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
                >
                  {t('View All Orders', 'Voir toutes les commandes')}
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </FadeIn>
          </div>

          {/* My Entries + Winner Updates */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            {/* My Entries - ALL tickets grouped by raffle */}
            <FadeIn>
              <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-neutral-900">{t('My Entries', 'Mes participations')}</h2>
                  <span className="text-sm text-[#b88238] font-semibold">{t('Total', 'Total')} {totalEntries} {t('Entries', 'Participations')}</span>
                </div>

                {tickets.length === 0 ? (
                  <div className="text-center py-8 text-neutral-400">
                    <Ticket className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">{t('No tickets yet', 'Aucun ticket')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.values(ticketsByRaffle).map((group) => {
                      const raffleNameDisplay = group.raffle?.name || t('Unknown Raffle', 'Raffle inconnu');
                      const raffleNameEn = group.raffle?.nameEn || raffleNameDisplay;
                      const displayName = locale === 'fr' ? raffleNameDisplay : raffleNameEn;
                      return (
                        <div key={group.raffle?._id || displayName} className="border border-neutral-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-sm text-neutral-900">{displayName}</h3>
                            <span className="text-xs text-neutral-500">{group.tickets.length} {t('entries', 'participations')}</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {group.tickets.map((ticket) => (
                              <div key={ticket._id} className="text-center p-2 rounded-lg border border-neutral-200 hover:border-[#e2bd87]/30 transition-colors">
                                <p className="font-mono font-bold text-neutral-900 text-sm">{ticket.ticketNumber || '-'}</p>
                                <p className="text-[10px] text-neutral-400 mt-0.5">
                                  {ticket.order?.orderNumber ? `${t('Order', 'Cmd')} #${ticket.order.orderNumber}` : ''}
                                </p>
                                <p className="text-[10px] text-neutral-400">
                                  {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('fr-CH') : '-'}
                                </p>
                                <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-semibold rounded-full">
                                  {t('Active', 'Actif')}
                                </span>
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
            <FadeIn delay={0.1}>
              <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-neutral-900">{t('Winner Updates', 'Mises à jour gagnants')}</h2>
                  <Link href="/winners" className="text-sm text-[#b88238] hover:text-[#e2bd87] font-medium flex items-center gap-1">
                    {t('View All', 'Voir tout')} <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {latestWinner ? (
                  <div className="flex items-start gap-4 p-4 rounded-xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e2bd87] to-[#b88238] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {latestWinner.user?.firstName?.[0] || ''}{latestWinner.user?.lastName?.[0] || ''}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-neutral-900 text-sm">{latestWinner.user?.firstName || ''} {latestWinner.user?.lastName || ''}</span>
                        <span className="px-2 py-0.5 bg-[#e2bd87]/15 text-[#b88238] text-[10px] font-bold uppercase rounded-full">{t('Won', 'Gagné')}</span>
                      </div>
                      <p className="text-sm text-neutral-700 mt-1">
                        <span className="text-[#b88238] font-semibold">{locale === 'fr' ? latestWinner.prize : latestWinner.prizeEn || latestWinner.prize}</span>
                      </p>
                      {latestWinner.ticket?.drawDate && (
                        <p className="text-xs text-neutral-400 mt-1">
                          {t('Won on', 'Gagné le')} {new Date(latestWinner.ticket.drawDate).toLocaleDateString(locale === 'fr' ? 'fr-CH' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <div className="w-16 h-16 rounded-lg bg-neutral-100 overflow-hidden border border-neutral-200 flex-shrink-0 hidden sm:block">
                      {latestWinner.raffle?.prizes?.[0]?.image ? (
                        <img src={latestWinner.raffle.prizes[0].image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-[#b88238]" />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-400">
                    <Trophy className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">{t('No winners yet', 'Aucun gagnant pour le moment')}</p>
                  </div>
                )}
              </div>
            </FadeIn>
          </div>

          {/* Trust Banner */}
          <FadeIn>
            <div className="bg-[#0f1419] rounded-xl p-5 sm:p-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#e2bd87]/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-[#e2bd87]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t('100% Secure', '100% Sécurisé')}</p>
                    <p className="text-neutral-400 text-xs">{t('Your data is always safe with us.', 'Vos données sont toujours en sécurité.')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#e2bd87]/10 flex items-center justify-center flex-shrink-0">
                    <Scale className="w-5 h-5 text-[#e2bd87]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t('Fair & Transparent', 'Équitable & Transparent')}</p>
                    <p className="text-neutral-400 text-xs">{t('Random & verified winner selection.', 'Sélection aléatoire et vérifiée.')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#e2bd87]/10 flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-[#e2bd87]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t('Verified Winners', 'Gagnants Vérifiés')}</p>
                    <p className="text-neutral-400 text-xs">{t('Real people, real prizes.', 'Vraies personnes, vrais prix.')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#e2bd87]/10 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-[#e2bd87]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t('Worldwide Shipping', 'Livraison Mondiale')}</p>
                    <p className="text-neutral-400 text-xs">{t('Fast & reliable delivery.', 'Livraison rapide et fiable.')}</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
