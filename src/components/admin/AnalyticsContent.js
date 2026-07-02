'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Users, Calendar } from 'lucide-react';
import { FadeIn } from '@/components/animations';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function AnalyticsContent() {
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalUsers: 0, activeRaffles: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const toNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };

  const fetchAnalytics = async () => {
    try {
      const [salesRes, dashboardRes] = await Promise.all([
        api.get('/api/analytics/sales'),
        api.get('/api/analytics/dashboard'),
      ]);

      const salesData = Array.isArray(salesRes.data)
        ? salesRes.data.map((entry) => ({
            month: entry?.month || '-',
            revenue: toNumber(entry?.revenue),
            orders: toNumber(entry?.orders),
          }))
        : [];
      const dashboardData = dashboardRes.data || {};

      setSales(salesData);
      setStats({
        totalRevenue: toNumber(dashboardData.totalRevenue),
        totalOrders: toNumber(dashboardData.totalOrders),
        totalUsers: toNumber(dashboardData.totalUsers),
        activeRaffles: toNumber(dashboardData.activeRaffles),
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const maxRevenue = Math.max(...sales.map(s => s.revenue), 1);
  const maxOrders = Math.max(...sales.map(s => s.orders), 1);
  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.revenue, 0);
  const totalSalesOrders = sales.reduce((sum, s) => sum + s.orders, 0);

  const statCards = [
    { label: 'Total Revenue', value: `${stats.totalRevenue.toFixed(2)} CHF`, icon: DollarSign, color: 'bg-emerald-100 text-emerald-600', change: '+12%' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-blue-100 text-blue-600', change: '+8%' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-purple-100 text-purple-600', change: '+24%' },
    { label: 'Active Raffles', value: stats.activeRaffles, icon: Calendar, color: 'bg-amber-100 text-amber-600', change: '-2%' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <FadeIn key={i} delay={i * 0.05}>
            <motion.div whileHover={{ y: -4 }} className="bg-white rounded-2xl border border-neutral-200 p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
              <p className="text-sm text-neutral-500 mt-1">{stat.label}</p>
            </motion.div>
          </FadeIn>
        ))}
      </div>

      {/* Sales Chart */}
      <FadeIn>
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Sales Overview</h2>
              <p className="text-sm text-neutral-500">Monthly revenue and orders</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-neutral-900 rounded-full" />
                <span className="text-neutral-500">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full" />
                <span className="text-neutral-500">Orders</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full" />
            </div>
          ) : sales.length > 0 ? (
            <div className="space-y-6">
              {/* Revenue Bars */}
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-3">Revenue (CHF)</h3>
                <div className="space-y-3">
                  {sales.map((s, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-neutral-600">{s.month}</span>
                        <span className="font-medium">{s.revenue.toFixed(2)} CHF</span>
                      </div>
                      <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(s.revenue / maxRevenue) * 100}%` }}
                          transition={{ duration: 0.8, delay: i * 0.05 }}
                          className="h-full bg-neutral-900 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Orders Bars */}
              <div className="border-t border-neutral-200 pt-6">
                <h3 className="text-sm font-medium text-neutral-700 mb-3">Orders</h3>
                <div className="space-y-3">
                  {sales.map((s, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-neutral-600">{s.month}</span>
                        <span className="font-medium">{s.orders} orders</span>
                      </div>
                      <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(s.orders / maxOrders) * 100}%` }}
                          transition={{ duration: 0.8, delay: i * 0.05 }}
                          className="h-full bg-amber-500 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="border-t border-neutral-200 pt-6 grid grid-cols-2 gap-4">
                <div className="bg-neutral-50 rounded-xl p-4">
                  <p className="text-sm text-neutral-500">Total Revenue (12 months)</p>
                  <p className="text-2xl font-bold text-neutral-900 mt-1">{totalSalesRevenue.toFixed(2)} CHF</p>
                </div>
                <div className="bg-neutral-50 rounded-xl p-4">
                  <p className="text-sm text-neutral-500">Total Orders (12 months)</p>
                  <p className="text-2xl font-bold text-neutral-900 mt-1">{totalSalesOrders}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500 text-sm">No sales data yet</p>
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  );
}
