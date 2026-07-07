'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Users, Ticket, TrendingUp, ArrowUpRight,
  Search, Eye, Pencil, MoreVertical, ChevronDown, Gift
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

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
        <text key={i} x={padding.left - 6} y={yFor(t) + 4} textAnchor="end" className="text-[10px] fill-neutral-400">{Math.round(t / 1000)}K</text>
      ))}
      {data.filter((_, i) => i % 2 === 0 || i === data.length - 1).map((d, i) => (
        <text key={`x-${i}`} x={xFor(d.i || i * 2)} y={height - 4} textAnchor="middle" className="text-[10px] fill-neutral-400">{d.label}</text>
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
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalUsers: 0, activeRaffles: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [allRaffles, setAllRaffles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, salesRes, ticketsRes, rafflesRes] = await Promise.all([
        api.get('/api/analytics/dashboard'), api.get('/api/analytics/sales'), api.get('/api/tickets?limit=20'), api.get('/api/raffles'),
      ]);
      const data = analyticsRes.data || {};
      setStats({ totalRevenue: toNumber(data.totalRevenue), totalOrders: toNumber(data.totalOrders), totalUsers: toNumber(data.totalUsers), activeRaffles: toNumber(data.activeRaffles) });
      setRecentOrders(data.recentOrders || []);
      setSalesData(salesRes.data || []);
      setAllTickets((ticketsRes.data || []).slice(0, 5));
      setAllRaffles(rafflesRes.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if (salesData.length === 0) return [];
    return salesData.slice(-7).map((sale, i) => ({ label: sale.month?.split(' ')[0] || `M${i + 1}`, value: toNumber(sale.orders), i }));
  }, [salesData]);

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
      return { _id: ticket._id, name: name || 'Unknown', ticket: ticket.ticketNumber || '-', time: timeAgo(ticket.createdAt), entries: 1, avatar: initials || '??' };
    });
  }, [allTickets]);

  const totalEntries = allRaffles.reduce((sum, r) => sum + (r.ticketCount || 0), 0);
  const totalTicketsCount = allTickets.length;

  const statCards = [
    { label: 'Total Entries', value: totalEntries.toLocaleString() || totalTicketsCount.toLocaleString(), sub: '+18.6%', icon: Ticket, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Total Orders', value: stats.totalOrders.toLocaleString(), sub: '+12.4%', icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), sub: '+22.8%', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Giveaways', value: stats.activeRaffles.toLocaleString(), sub: 'Running now', icon: Gift, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const displayOrders = recentOrders.length > 0 ? recentOrders.slice(0, 3) : [];
  const displayEntries = recentEntries.length > 0 ? recentEntries : [];
  const displayGiveaways = activeGiveaways.length > 0 ? activeGiveaways : [];

  if (loading) return <div className="h-40 flex items-center justify-center text-neutral-500">Loading dashboard...</div>;

  return (
    <div className="space-y-5">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-medium ${stat.sub.startsWith('+') ? 'text-emerald-600' : 'text-neutral-500'}`}>{stat.sub}</span>
            </div>
            <p className="text-xl font-bold text-neutral-900">{stat.value}</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Entries Overview */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-neutral-900">Entries Overview</h3>
            <button className="flex items-center gap-1 text-[10px] text-neutral-500 bg-neutral-50 px-2 py-1 rounded-lg border border-neutral-200">
              Last 30 Days <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          {chartData.length === 0 ? (
            <div className="text-center py-8 text-neutral-400"><TrendingUp className="w-6 h-6 mx-auto mb-1" /><p className="text-xs">No sales data</p></div>
          ) : <LineChart data={chartData} />}
        </motion.div>

        {/* Giveaway Status */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-neutral-900">Giveaway Status</h3>
            <button className="text-[10px] text-neutral-500 hover:text-neutral-700 font-medium">View All</button>
          </div>
          <DonutChart data={donutData} />
        </motion.div>
      </div>

      {/* Active Giveaways */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-neutral-900">Active Giveaways</h3>
          <button className="text-[10px] text-neutral-500 hover:text-neutral-700 font-medium">View All</button>
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
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Recent Orders */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-neutral-900">Recent Orders</h3>
          <button className="text-[10px] text-neutral-500 hover:text-neutral-700 font-medium">View All</button>
        </div>
        {displayOrders.length === 0 ? (
          <div className="text-center py-6 text-neutral-400"><ShoppingCart className="w-6 h-6 mx-auto mb-1" /><p className="text-xs">No orders yet</p></div>
        ) : (
          <div className="space-y-3">
            {displayOrders.map((order) => (
              <div key={order._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50/50">
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
    </div>
  );
}
