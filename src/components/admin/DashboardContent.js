'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Users, Ticket, TrendingUp, ArrowUpRight, ArrowDownRight,
  Search, Eye, Pencil, MoreVertical, ChevronDown, Gift, X, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/* ─── Simple SVG Line Chart ─── */
function LineChart({ data }) {
  const width = 500;
  const height = 140;
  const padding = { top: 10, right: 10, bottom: 25, left: 35 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const minVal = Math.min(...data.map(d => d.value), 0);
  const range = maxVal - minVal || 1;

  const xFor = (i) => padding.left + (i / (data.length - 1)) * chartW;
  const yFor = (v) => padding.top + chartH - ((v - minVal) / range) * chartH;

  const pathD = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(d.value)}`).join(' ');
  const areaD = `${pathD} L ${xFor(data.length - 1)} ${padding.top + chartH} L ${xFor(0)} ${padding.top + chartH} Z`;
  const yTicks = [0, 1, 2, 3, 4].map(t => minVal + (t / 4) * range);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40">
      {yTicks.map((t, i) => (
        <text key={i} x={padding.left - 6} y={yFor(t) + 4} textAnchor="end" className="text-[10px] fill-neutral-400">{Math.round(t)}</text>
      ))}
      {data.filter((_, i) => i % 4 === 0 || i === data.length - 1).map((d, i) => (
        <text key={`x-${i}`} x={xFor(d.i || i * 4)} y={height - 4} textAnchor="middle" className="text-[10px] fill-neutral-400">{d.label}</text>
      ))}
      {yTicks.map((t, i) => (
        <line key={`grid-${i}`} x1={padding.left} y1={yFor(t)} x2={width - padding.right} y2={yFor(t)} className="stroke-neutral-100" strokeWidth={1} />
      ))}
      <path d={areaD} fill="url(#grad)" opacity={0.15} />
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b88238" />
          <stop offset="100%" stopColor="#b88238" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={pathD} fill="none" stroke="#b88238" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <circle key={i} cx={xFor(i)} cy={yFor(d.value)} r={3} fill="#b88238" />
      ))}
    </svg>
  );
}

/* ─── Simple SVG Donut Chart ─── */
function DonutChart({ data }) {
  const size = 120;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

  let offset = 0;
  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        {data.map((d, i) => {
          const dash = (d.value / total) * circumference;
          const seg = (
            <circle key={i} cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={d.color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${circumference - dash}`} strokeDashoffset={-offset} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
          );
          offset += dash;
          return seg;
        })}
        <text x="50%" y="45%" textAnchor="middle" className="text-xl font-bold fill-neutral-900">{total}</text>
        <text x="50%" y="60%" textAnchor="middle" className="text-[10px] fill-neutral-400">Total</text>
      </svg>
      <div className="space-y-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-xs text-neutral-600 w-16">{d.label}</span>
            <span className="text-xs font-medium text-neutral-900">{d.value} ({total ? Math.round((d.value / total) * 100) : 0}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const statusStyles = {
  paid: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  processing: 'bg-blue-50 text-blue-700 border border-blue-200',
  shipped: 'bg-blue-50 text-blue-700 border border-blue-200',
  delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  closed: 'bg-neutral-50 text-neutral-700 border border-neutral-200',
  drawn: 'bg-purple-50 text-purple-700 border border-purple-200',
  draft: 'bg-neutral-50 text-neutral-700 border border-neutral-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
};

function formatCurrency(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 'CHF 0.00';
  return `CHF ${num.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

export default function DashboardContent() {
  const router = useRouter();
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalUsers: 0, activeRaffles: 0 });
  const [changes, setChanges] = useState({ revenue: 0, orders: 0, users: 0, tickets: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [allRaffles, setAllRaffles] = useState([]);
  const [dailyData, setDailyData] = useState({ entries: [], orders: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [chartFilter, setChartFilter] = useState('7'); // '7' | '14' | '30'
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);
  const [giveawayMenuOpen, setGiveawayMenuOpen] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRaffle, setEditRaffle] = useState(null);

  useEffect(() => { fetchDashboardData(); }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, salesRes, ticketsRes, rafflesRes] = await Promise.all([
        api.get('/api/analytics/dashboard'), api.get('/api/analytics/sales'), api.get('/api/tickets?limit=20'), api.get('/api/raffles'),
      ]);
      const data = analyticsRes.data || {};
      setStats({ totalRevenue: toNumber(data.totalRevenue), totalOrders: toNumber(data.totalOrders), totalUsers: toNumber(data.totalUsers), activeRaffles: toNumber(data.activeRaffles) });
      setChanges(data.changes || { revenue: 0, orders: 0, users: 0, tickets: 0 });
      setRecentOrders(data.recentOrders || []);
      setDailyData(data.dailyData || { entries: [], orders: [], users: [] });
      setSalesData(salesRes.data || []);
      setAllTickets((ticketsRes.data || []).slice(0, 5));
      setAllRaffles(rafflesRes.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Real-time search across dashboard data
  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) {
      setShowSearchResults(false);
      return;
    }
    const lower = q.toLowerCase();
    const results = [];
    // Search orders
    recentOrders.forEach(o => {
      if ((o.orderNumber || '').toLowerCase().includes(lower) || (o.user?.firstName || '').toLowerCase().includes(lower)) {
        results.push({ type: 'order', title: `Order #${o.orderNumber}`, subtitle: `${o.user?.firstName || ''} ${o.user?.lastName || ''}`, id: o._id, link: '/admin/orders' });
      }
    });
    // Search raffles
    allRaffles.forEach(r => {
      if ((r.name || '').toLowerCase().includes(lower)) {
        results.push({ type: 'raffle', title: r.name, subtitle: 'Giveaway', id: r._id, link: '/admin/raffles' });
      }
    });
    // Search tickets
    allTickets.forEach(t => {
      if ((t.ticketNumber || '').toLowerCase().includes(lower)) {
        results.push({ type: 'ticket', title: `Ticket ${t.ticketNumber}`, subtitle: t.user?.firstName || '', id: t._id, link: '/admin/tickets' });
      }
    });
    setSearchResults(results.slice(0, 8));
    setShowSearchResults(true);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const lower = searchQuery.toLowerCase().trim();
      if (lower.includes('order')) router.push('/admin/orders');
      else if (lower.includes('product') || lower.includes('cap')) router.push('/admin/products');
      else if (lower.includes('user')) router.push('/admin/users');
      else if (lower.includes('raffle') || lower.includes('giveaway')) router.push('/admin/raffles');
      else if (lower.includes('ticket') || lower.includes('entry')) router.push('/admin/tickets');
      else if (lower.includes('winner')) router.push('/admin/winners');
      else if (lower.includes('payment') || lower.includes('payout')) router.push('/admin/payments');
      else if (lower.includes('report') || lower.includes('analytic')) router.push('/admin/analytics');
      else if (lower.includes('content') || lower.includes('page')) router.push('/admin/content');
      else if (lower.includes('contact') || lower.includes('support')) router.push('/admin/contacts');
      else if (lower.includes('setting')) router.push('/admin/settings');
      else if (lower.includes('log') || lower.includes('history') || lower.includes('activity')) router.push('/admin/draw-history');
      else router.push('/admin/dashboard');
      setShowSearchResults(false);
      setSearchQuery('');
    }
  };

  const applyDateRange = () => {
    if (dateRange.start && dateRange.end) {
      toast.success(`Date range: ${dateRange.start} to ${dateRange.end}`);
      setShowDatePicker(false);
    }
  };

  const chartData = useMemo(() => {
    const days = parseInt(chartFilter, 10);
    const data = dailyData.entries || [];
    if (data.length === 0) return [];
    return data.slice(-days).map((d, i) => ({ label: d.label, value: toNumber(d.value), i }));
  }, [dailyData, chartFilter]);

  const donutData = useMemo(() => {
    const active = allRaffles.filter(r => r.status === 'active').length;
    const closed = allRaffles.filter(r => r.status === 'closed').length;
    const drawn = allRaffles.filter(r => r.status === 'drawn').length;
    const draft = allRaffles.filter(r => r.status === 'draft').length;
    return [
      { label: 'Active', value: active || 0, color: '#22c55e' },
      { label: 'Closed', value: closed || 0, color: '#f59e0b' },
      { label: 'Drawn', value: drawn || 0, color: '#8b5cf6' },
      { label: 'Draft', value: draft || 0, color: '#9ca3af' },
    ];
  }, [allRaffles]);

  const activeGiveaways = useMemo(() => {
    return allRaffles.filter(r => r.status === 'active').map(r => {
      const sold = r.ticketCount || r.product?.soldTickets || 0;
      const max = r.product?.maxTickets || 1000;
      const progress = max > 0 ? Math.round((sold / max) * 100) : 0;
      const prizeNames = (r.prizes || []).map(p => p.name).join(', ') || 'Grand Prize';
      const prizeImage = r.prizes?.[0]?.image || r.product?.images?.[0] || '';
      return {
        _id: r._id, name: r.name, prize: prizeNames,
        entries: `${sold.toLocaleString()} / ${max.toLocaleString()}`,
        startDate: r.startDate ? new Date(r.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-',
        endDate: r.endDate ? new Date(r.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-',
        status: r.status, progress, prizeImage,
      };
    });
  }, [allRaffles]);

  const recentEntries = useMemo(() => {
    if (allTickets.length === 0) return [];
    return allTickets.slice(0, 5).map(ticket => {
      const user = ticket.user;
      const name = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Unknown';
      const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : '??';
      return { _id: ticket._id, name: name || 'Unknown', ticket: ticket.ticketNumber || '-', time: timeAgo(ticket.createdAt), entries: 1, avatar: initials || '??', userAvatar: user?.avatar };
    });
  }, [allTickets]);

  const totalEntries = allRaffles.reduce((sum, r) => sum + (r.ticketCount || 0), 0);
  const totalTicketsCount = allTickets.length;

  const statCards = [
    { label: 'Total Entries', value: totalEntries.toLocaleString() || totalTicketsCount.toLocaleString(), change: changes.tickets, icon: Ticket, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Total Orders', value: stats.totalOrders.toLocaleString(), change: changes.orders, icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), change: changes.revenue, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Giveaways', value: stats.activeRaffles.toLocaleString(), change: null, icon: Gift, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const displayOrders = recentOrders.length > 0 ? recentOrders.slice(0, 3) : [];
  const displayEntries = recentEntries.length > 0 ? recentEntries : [];
  const displayGiveaways = activeGiveaways.length > 0 ? activeGiveaways : [];

  const handleViewRaffle = (id) => router.push(`/admin/raffles`);
  const handleEditRaffle = (raffle) => { setEditRaffle(raffle); setEditModalOpen(true); setGiveawayMenuOpen(null); };
  const handleSaveEdit = async () => {
    if (!editRaffle) return;
    try {
      await api.put(`/api/raffles/${editRaffle._id}`, editRaffle);
      toast.success('Giveaway updated');
      setEditModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  if (loading) return <div className="h-40 flex items-center justify-center text-neutral-500">Loading dashboard...</div>;

  return (
    <div className="space-y-5">
      {/* Search Bar */}
      <div className="relative" ref={searchRef}>
        <div className="flex items-center rounded-lg px-3 py-2 w-full max-w-md bg-neutral-100 border border-neutral-200">
          <Search className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search orders, raffles, tickets..."
            value={searchQuery}
            onChange={handleSearch}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
            className="bg-transparent text-sm text-neutral-700 placeholder-neutral-400 outline-none w-full"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setShowSearchResults(false); }} className="ml-1 text-neutral-400 hover:text-neutral-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <AnimatePresence>
          {showSearchResults && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute left-0 mt-1 w-full max-w-md bg-white rounded-xl border border-neutral-200 shadow-lg z-50 overflow-hidden"
            >
              {searchResults.map((result, i) => (
                <div
                  key={i}
                  onClick={() => { router.push(result.link); setShowSearchResults(false); setSearchQuery(''); }}
                  className="px-4 py-2.5 hover:bg-neutral-50 cursor-pointer border-b border-neutral-50 last:border-0"
                >
                  <p className="text-sm font-medium text-neutral-900">{result.title}</p>
                  <p className="text-xs text-neutral-500">{result.subtitle}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat, i) => {
          const isPositive = stat.change !== null && stat.change >= 0;
          const changeText = stat.change !== null ? `${isPositive ? '+' : ''}${stat.change}%` : 'Running now';
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-xl border border-neutral-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-medium flex items-center gap-0.5 ${stat.change !== null ? (isPositive ? 'text-emerald-600' : 'text-red-500') : 'text-neutral-500'}`}>
                  {stat.change !== null ? (isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />) : null}
                  {changeText}
                </span>
              </div>
              <p className="text-xl font-bold text-neutral-900">{stat.value}</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Entries Overview */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-neutral-900">Entries Overview</h3>
            <div className="relative">
              <button onClick={() => setShowDatePicker(!showDatePicker)} className="flex items-center gap-1 text-[10px] text-neutral-500 bg-neutral-50 px-2 py-1 rounded-lg border border-neutral-200">
                Last {chartFilter} Days <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {showDatePicker && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute right-0 mt-1 w-48 bg-white rounded-xl border border-neutral-200 shadow-lg z-50 p-3">
                    <div className="space-y-2">
                      {['7', '14', '30'].map((days) => (
                        <button
                          key={days}
                          onClick={() => { setChartFilter(days); setShowDatePicker(false); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs ${chartFilter === days ? 'bg-amber-50 text-amber-700 font-medium' : 'text-neutral-600 hover:bg-neutral-50'}`}
                        >
                          Last {days} Days
                        </button>
                      ))}
                      <div className="border-t border-neutral-100 pt-2">
                        <p className="text-[10px] text-neutral-400 mb-1">Custom range</p>
                        <input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} className="w-full text-xs border border-neutral-200 rounded px-2 py-1 mb-1" />
                        <input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} className="w-full text-xs border border-neutral-200 rounded px-2 py-1 mb-2" />
                        <button onClick={applyDateRange} className="w-full text-xs bg-neutral-900 text-white rounded-lg py-1.5">Apply</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          {chartData.length === 0 ? (
            <div className="text-center py-8 text-neutral-400"><TrendingUp className="w-6 h-6 mx-auto mb-1" /><p className="text-xs">No entries data</p></div>
          ) : <LineChart data={chartData} />}
        </motion.div>

        {/* Giveaway Status */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-neutral-900">Giveaway Status</h3>
            <button onClick={() => router.push('/admin/raffles')} className="text-[10px] text-neutral-500 hover:text-neutral-700 font-medium">View All</button>
          </div>
          <DonutChart data={donutData} />
        </motion.div>
      </div>

      {/* Recent Entries */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-neutral-900">Recent Entries</h3>
          <button onClick={() => router.push('/admin/tickets')} className="text-[10px] text-neutral-500 hover:text-neutral-700 font-medium">View All</button>
        </div>
        {displayEntries.length === 0 ? (
          <div className="text-center py-6 text-neutral-400"><Ticket className="w-6 h-6 mx-auto mb-1" /><p className="text-xs">No recent entries</p></div>
        ) : (
          <div className="space-y-3">
            {displayEntries.map((entry) => (
              <div key={entry._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50/50">
                <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-600 shrink-0 overflow-hidden">
                  {entry.userAvatar ? (
                    <img src={entry.userAvatar} alt={entry.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{entry.avatar}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900">{entry.name}</p>
                  <p className="text-[10px] text-neutral-500">{entry.ticket}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-neutral-400">{entry.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Active Giveaways */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-neutral-900">Active Giveaways</h3>
          <button onClick={() => router.push('/admin/raffles')} className="text-[10px] text-neutral-500 hover:text-neutral-700 font-medium">View All</button>
        </div>
        {displayGiveaways.length === 0 ? (
          <div className="text-center py-6 text-neutral-400"><Ticket className="w-6 h-6 mx-auto mb-1" /><p className="text-xs">No active giveaways</p></div>
        ) : (
          <div className="space-y-3">
            {displayGiveaways.map((giveaway) => (
              <div key={giveaway._id} className="flex items-center gap-3 p-3 rounded-lg border border-neutral-100 hover:bg-neutral-50/50">
                <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                  {giveaway.prizeImage ? (
                    <img src={giveaway.prizeImage} alt={giveaway.name} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-6 h-6 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-neutral-900 truncate">{giveaway.name}</p>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-[10px] text-emerald-600">Live</span>
                  </div>
                  <p className="text-[10px] text-neutral-500 truncate">{giveaway.prize}</p>
                  <div className="mt-1.5">
                    <div className="flex items-center justify-between text-[10px] mb-0.5">
                      <span className="text-neutral-500">{giveaway.entries}</span>
                      <span className="text-[#b88238] font-medium">{giveaway.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#b88238] rounded-full" style={{ width: `${giveaway.progress}%` }} />
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-neutral-400">{giveaway.endDate}</p>
                </div>
                {/* Action Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleViewRaffle(giveaway._id)} className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-600 transition-colors" title="View">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleEditRaffle(giveaway)} className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-600 transition-colors" title="Edit">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <div className="relative">
                    <button onClick={() => setGiveawayMenuOpen(giveawayMenuOpen === giveaway._id ? null : giveaway._id)} className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-600 transition-colors" title="More">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                    <AnimatePresence>
                      {giveawayMenuOpen === giveaway._id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 mt-1 w-36 bg-white rounded-lg border border-neutral-200 shadow-lg z-50 py-1"
                        >
                          <button onClick={() => { router.push(`/admin/raffles`); setGiveawayMenuOpen(null); }} className="w-full text-left px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50">Manage Details</button>
                          <button onClick={() => { router.push('/admin/draw'); setGiveawayMenuOpen(null); }} className="w-full text-left px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50">Draw Winner</button>
                          <button onClick={() => { setGiveawayMenuOpen(null); }} className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50">Close Giveaway</button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Recent Orders */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-neutral-900">Recent Orders</h3>
          <button onClick={() => router.push('/admin/orders')} className="text-[10px] text-neutral-500 hover:text-neutral-700 font-medium">View All</button>
        </div>
        {displayOrders.length === 0 ? (
          <div className="text-center py-6 text-neutral-400"><ShoppingCart className="w-6 h-6 mx-auto mb-1" /><p className="text-xs">No orders yet</p></div>
        ) : (
          <div className="space-y-3">
            {displayOrders.map((order) => (
              <div key={order._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50/50 cursor-pointer" onClick={() => router.push('/admin/orders')}>
                <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-600 shrink-0 overflow-hidden">
                  {order.user?.avatar ? (
                    <img src={order.user.avatar} alt={order.user.firstName || ''} className="w-full h-full object-cover" />
                  ) : (
                    <span>{order.user?.firstName?.[0] || '?'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900">{order.user?.firstName ? `${order.user.firstName} ${order.user.lastName}` : 'Unknown'}</p>
                  <p className="text-[10px] text-neutral-500">{order.items?.[0]?.product?.name || order.items?.[0]?.name || 'Product'}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-neutral-900">{formatCurrency(order.total)}</p>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${statusStyles[order.status] || 'bg-neutral-100 text-neutral-600'}`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editModalOpen && editRaffle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-xl border border-neutral-200 shadow-lg w-full max-w-md p-5 mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-neutral-900">Edit Giveaway</h3>
                <button onClick={() => setEditModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-600"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">Name</label>
                  <input value={editRaffle.name || ''} onChange={(e) => setEditRaffle({ ...editRaffle, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm outline-none focus:ring-2 focus:ring-amber-200" />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">End Date</label>
                  <input type="date" value={editRaffle.endDate ? new Date(editRaffle.endDate).toISOString().split('T')[0] : ''} onChange={(e) => setEditRaffle({ ...editRaffle, endDate: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm outline-none focus:ring-2 focus:ring-amber-200" />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">Status</label>
                  <select value={editRaffle.status || 'draft'} onChange={(e) => setEditRaffle({ ...editRaffle, status: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm outline-none focus:ring-2 focus:ring-amber-200">
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="drawn">Drawn</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setEditModalOpen(false)} className="flex-1 px-4 py-2 rounded-lg border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50">Cancel</button>
                <button onClick={handleSaveEdit} className="flex-1 px-4 py-2 rounded-lg bg-neutral-900 text-white text-sm hover:bg-neutral-800">Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
