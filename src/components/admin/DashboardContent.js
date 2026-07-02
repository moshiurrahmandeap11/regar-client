'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, ShoppingCart, Users, Ticket, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function DashboardContent() {
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalUsers: 0, activeRaffles: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const toNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/api/analytics/dashboard');
      const data = res.data || {};
      setStats({
        totalRevenue: toNumber(data.totalRevenue),
        totalOrders: toNumber(data.totalOrders),
        totalUsers: toNumber(data.totalUsers),
        activeRaffles: toNumber(data.activeRaffles),
      });
      setRecentOrders(data.recentOrders || []);
      setTopProducts((data.topProducts || []).map((product) => ({
        ...product,
        count: toNumber(product.count),
        revenue: toNumber(product.revenue),
      })));
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="h-40 flex items-center justify-center">Loading dashboard...</div>;
  }

  const statCards = [
    { label: 'Total Revenue', value: `${stats.totalRevenue.toFixed(2)} CHF`, icon: TrendingUp, color: 'bg-emerald-100 text-emerald-600', change: '+12%', positive: true },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'bg-blue-100 text-blue-600', change: '+8%', positive: true },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-purple-100 text-purple-600', change: '+24%', positive: true },
    { label: 'Active Raffles', value: stats.activeRaffles, icon: Ticket, color: 'bg-amber-100 text-amber-600', change: '-2%', positive: false },
  ];

  return (
    <div className="space-y-8">
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <StaggerItem key={i}>
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl border border-neutral-200 p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${stat.positive ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
              <p className="text-sm text-neutral-500 mt-1">{stat.label}</p>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeIn>
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-3 px-2 font-medium text-neutral-500">Order</th>
                      <th className="text-left py-3 px-2 font-medium text-neutral-500">Customer</th>
                      <th className="text-left py-3 px-2 font-medium text-neutral-500">Total</th>
                      <th className="text-left py-3 px-2 font-medium text-neutral-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order._id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                        <td className="py-3 px-2 font-medium">{order.orderNumber}</td>
                        <td className="py-3 px-2">{order.user?.firstName} {order.user?.lastName}</td>
                        <td className="py-3 px-2">{order.total?.toFixed(2)} CHF</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            order.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                            order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                            'bg-neutral-100 text-neutral-600'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingCart className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500 text-sm">No recent orders</p>
              </div>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Top Products</h2>
            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center text-sm font-bold text-neutral-600">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.name || product._id || 'Product'}</p>
                      <p className="text-xs text-neutral-500">{product.count} sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{product.revenue?.toFixed(2)} CHF</p>
                    </div>
                    <div className="w-24 h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((product.count / (topProducts[0]?.count || 1)) * 100, 100)}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="h-full bg-neutral-900 rounded-full"
                      />
                    </div>
                  </div>
                ))}
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
    </div>
  );
}
