'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Package, Search, ChevronLeft, ChevronRight, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { FadeIn } from '@/components/animations';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  paid: { label: 'Paid', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function OrdersContent() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const API = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API}/api/orders`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const body = { status };
      if (status === 'shipped' && trackingNumber) body.trackingNumber = trackingNumber;
      
      const res = await fetch(`${API}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success('Status updated');
      fetchOrders();
      setSelectedOrder(null);
      setTrackingNumber('');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filtered = orders.filter(o => {
    const matchSearch = o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        >
          <option value="all">All Status</option>
          {Object.entries(statusConfig).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Order</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Items</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Total</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((order) => {
                    const status = statusConfig[order.status] || statusConfig.pending;
                    const StatusIcon = status.icon;
                    return (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="font-mono font-medium text-sm">{order.orderNumber}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{order.user?.firstName} {order.user?.lastName}</p>
                            <p className="text-xs text-neutral-500">{order.user?.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm">{order.items?.length || 0} items</span>
                        </td>
                        <td className="py-3 px-4 font-medium">{order.total?.toFixed(2)} CHF</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-neutral-500">
                          {new Date(order.createdAt).toLocaleDateString('fr-CH')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500 text-sm">No orders found</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200">
                <p className="text-sm text-neutral-500">{filtered.length} orders</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 rounded-lg hover:bg-neutral-100 disabled:opacity-30">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium">{currentPage} / {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1 rounded-lg hover:bg-neutral-100 disabled:opacity-30">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Order {selectedOrder.orderNumber}</h2>
                <p className="text-sm text-neutral-500">{new Date(selectedOrder.createdAt).toLocaleString('fr-CH')}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-neutral-100 rounded-lg">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-2">Customer</h3>
                <div className="bg-neutral-50 rounded-xl p-4">
                  <p className="font-medium">{selectedOrder.user?.firstName} {selectedOrder.user?.lastName}</p>
                  <p className="text-sm text-neutral-500">{selectedOrder.user?.email}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-2">Shipping Address</h3>
                <div className="bg-neutral-50 rounded-xl p-4">
                  <p className="font-medium">{selectedOrder.shippingAddress?.firstName} {selectedOrder.shippingAddress?.lastName}</p>
                  <p className="text-sm text-neutral-500">{selectedOrder.shippingAddress?.street}</p>
                  <p className="text-sm text-neutral-500">{selectedOrder.shippingAddress?.zip} {selectedOrder.shippingAddress?.city}</p>
                  <p className="text-sm text-neutral-500">{selectedOrder.shippingAddress?.country}</p>
                  <p className="text-sm text-neutral-500 mt-1">{selectedOrder.shippingAddress?.phone}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-2">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-neutral-50 rounded-xl p-3">
                      <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-neutral-500">{item.color} / {item.size} x{item.quantity}</p>
                      </div>
                      <p className="font-medium text-sm">{(item.price * item.quantity).toFixed(2)} CHF</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tickets */}
              {selectedOrder.tickets?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 mb-2">Raffle Tickets</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedOrder.tickets.map((ticket, i) => (
                      <span key={i} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-mono font-medium">{ticket}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="border-t border-neutral-200 pt-4">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span>{selectedOrder.subtotal?.toFixed(2)} CHF</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Shipping</span><span>{selectedOrder.shipping?.toFixed(2)} CHF</span></div>
                  {selectedOrder.discount > 0 && <div className="flex justify-between"><span className="text-neutral-500">Discount</span><span className="text-emerald-600">-{selectedOrder.discount?.toFixed(2)} CHF</span></div>}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-neutral-200"><span>Total</span><span>{selectedOrder.total?.toFixed(2)} CHF</span></div>
                </div>
              </div>

              {/* Status Update */}
              <div className="border-t border-neutral-200 pt-4">
                <h3 className="text-sm font-medium text-neutral-700 mb-3">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => updateStatus(selectedOrder._id, key)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        selectedOrder.status === key
                          ? config.color
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
                {selectedOrder.status !== 'shipped' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Tracking number (optional)"
                      value={trackingNumber}
                      onChange={e => setTrackingNumber(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                )}
                {selectedOrder.trackingNumber && (
                  <p className="text-sm text-neutral-500 mt-2">Tracking: {selectedOrder.trackingNumber}</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
