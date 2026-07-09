'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Eye, Package, Search, ChevronLeft, ChevronRight,
  Truck, CheckCircle, XCircle, Clock, Ticket, CreditCard,
  Image as ImageIcon, ExternalLink, QrCode, ThumbsUp, ThumbsDown, FileText,
} from 'lucide-react';
import { FadeIn } from '@/components/animations';
import toast from 'react-hot-toast';

const statusConfig = {
  awaiting_payment: { label: 'Awaiting payment', color: 'bg-neutral-100 text-neutral-600', icon: Clock },
  pending:    { label: 'Pending',    color: 'bg-amber-100 text-amber-700',   icon: Clock },
  paid:       { label: 'Paid',       color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700',     icon: Package },
  shipped:    { label: 'Shipped',    color: 'bg-purple-100 text-purple-700', icon: Truck },
  delivered:  { label: 'Delivered',  color: 'bg-green-100 text-green-700',   icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-100 text-red-700',       icon: XCircle },
};

const paymentStatusColor = {
  pending:   'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  failed:    'bg-red-100 text-red-700',
  refunded:  'bg-neutral-100 text-neutral-600',
};

const fulfillmentStatuses = ['paid', 'processing', 'shipped', 'delivered'];

export default function OrdersContent() {
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [currentPage, setCurrentPage]   = useState(1);
  const [proofOpen, setProofOpen]       = useState(false);
  const [orderNote, setOrderNote]       = useState('');
  const itemsPerPage = 10;

  const API   = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res  = await fetch(`${API}/api/orders`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setOrders(data);
    } catch {
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
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleApprovePayment = async (id) => {
    try {
      const res = await fetch(`${API}/api/orders/${id}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paymentStatus: 'completed' }),
      });
      if (!res.ok) throw new Error('Failed to approve');
      toast.success('Payment approved, tickets generated');
      fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeclinePayment = async (id) => {
    try {
      const res = await fetch(`${API}/api/orders/${id}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paymentStatus: 'failed' }),
      });
      if (!res.ok) throw new Error('Failed to decline');
      toast.success('Payment declined, order cancelled');
      fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      toast.error(err.message);
    }
  };
  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const ticketMatch = Array.isArray(o.tickets) && o.tickets.some((t) => t.toLowerCase().includes(q));
    const matchSearch =
      o.orderNumber?.toLowerCase().includes(q) ||
      o.user?.firstName?.toLowerCase().includes(q) ||
      o.user?.lastName?.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q) ||
      ticketMatch;
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated  = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Derive unique raffles from ticketDocs on the selected order
  const orderRaffles = (() => {
    if (!selectedOrder?.ticketDocs?.length) return [];
    const seen = new Set();
    const result = [];
    for (const t of selectedOrder.ticketDocs) {
      if (t.raffle && !seen.has(String(t.raffle._id))) {
        seen.add(String(t.raffle._id));
        result.push(t.raffle);
      }
    }
    return result;
  })();

  const payment = selectedOrder?.paymentInfo || null;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by order no, customer, or ticket number…"
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
          {Object.entries(statusConfig).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
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
                    const status     = statusConfig[order.status] || statusConfig.pending;
                    const StatusIcon = status.icon;
                    const hasTickets = Array.isArray(order.tickets) && order.tickets.length > 0;
                    return (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <p className="font-mono font-medium text-sm">{order.orderNumber}</p>
                          {/* Show first ticket number if present */}
                          {hasTickets && (
                            <p className="text-xs text-amber-600 font-mono mt-0.5">{order.tickets[0]}{order.tickets.length > 1 ? ` +${order.tickets.length - 1}` : ''}</p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium">{order.user?.firstName} {order.user?.lastName}</p>
                          <p className="text-xs text-neutral-500">{order.user?.email}</p>
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
                          <button
                            onClick={() => { setSelectedOrder(order); setProofOpen(false); setTrackingNumber(''); }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
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
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 rounded-lg hover:bg-neutral-100 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                  <span className="text-sm font-medium">{currentPage} / {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1 rounded-lg hover:bg-neutral-100 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Order Detail Modal ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setSelectedOrder(null); }}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-neutral-200 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Order {selectedOrder.orderNumber}</h2>
                <p className="text-sm text-neutral-500">{new Date(selectedOrder.createdAt).toLocaleString('fr-CH')}</p>
                {/* Ticket numbers alongside order number */}
                {selectedOrder.tickets?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedOrder.tickets.map((t, i) => (
                      <span key={i} className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md text-xs font-mono font-semibold">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-neutral-100 rounded-lg shrink-0">
                <XCircle className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* Customer */}
              <section>
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Customer</h3>
                <div className="bg-neutral-50 rounded-xl p-4">
                  <p className="font-medium">{selectedOrder.user?.firstName} {selectedOrder.user?.lastName}</p>
                  <p className="text-sm text-neutral-500">{selectedOrder.user?.email}</p>
                </div>
              </section>

              {/* Shipping */}
              <section>
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Shipping Address</h3>
                <div className="bg-neutral-50 rounded-xl p-4 text-sm space-y-0.5">
                  <p className="font-medium">{selectedOrder.shippingAddress?.firstName} {selectedOrder.shippingAddress?.lastName}</p>
                  <p className="text-neutral-500">{selectedOrder.shippingAddress?.street}</p>
                  <p className="text-neutral-500">{selectedOrder.shippingAddress?.zip} {selectedOrder.shippingAddress?.city}</p>
                  <p className="text-neutral-500">{selectedOrder.shippingAddress?.country}</p>
                  {selectedOrder.shippingAddress?.phone && <p className="text-neutral-500 mt-1">{selectedOrder.shippingAddress.phone}</p>}
                </div>
              </section>

              {/* Items */}
              <section>
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-neutral-50 rounded-xl p-3">
                      {item.image && <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-neutral-500">{item.color}{item.size ? ` / ${item.size}` : ''} × {item.quantity}</p>
                      </div>
                      <p className="font-medium text-sm shrink-0">{(item.price * item.quantity).toFixed(2)} CHF</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Raffle info */}
              {orderRaffles.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5" /> Raffle
                  </h3>
                  <div className="space-y-2">
                    {orderRaffles.map((raffle) => {
                      const raffleTickets = (selectedOrder.ticketDocs || []).filter((t) => String(t.raffle?._id) === String(raffle._id));
                      return (
                        <div key={raffle._id} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {raffle.raffleNumber && (
                              <span className="px-2 py-0.5 bg-amber-500 text-white rounded-md text-xs font-bold">
                                Raffle No. {String(raffle.raffleNumber).padStart(3, '0')}
                              </span>
                            )}
                            <span className="text-sm font-semibold text-amber-800">{raffle.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded-md bg-white border border-amber-200 text-amber-600 capitalize">{raffle.status}</span>
                          </div>
                          {raffleTickets.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {raffleTickets.map((t, i) => (
                                <span key={i} className="px-2 py-0.5 bg-white border border-amber-200 text-amber-700 rounded-md text-xs font-mono font-semibold">{t.ticketNumber}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Raffle tickets (fallback — order.tickets array, no raffle doc) */}
              {orderRaffles.length === 0 && selectedOrder.tickets?.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5" /> Raffle Tickets
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedOrder.tickets.map((ticket, i) => (
                      <span key={i} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-mono font-medium">{ticket}</span>
                    ))}
                  </div>
                </section>
              )}

              {/* Payment info */}
              <section>
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" /> Payment
                </h3>
                <div className="bg-neutral-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-semibold text-neutral-900">{selectedOrder.total?.toFixed(2)} CHF</span>
                    <span className="capitalize text-neutral-600">via {payment?.paymentMethodName || selectedOrder.paymentMethod}</span>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${paymentStatusColor[selectedOrder.paymentStatus] || 'bg-neutral-100 text-neutral-600'}`}>
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>

                  {/* Transaction ID */}
                  {payment?.txId && (
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-400 text-xs">TX ID:</span>
                      <code className="bg-white border border-neutral-200 px-2 py-0.5 rounded font-mono text-xs text-neutral-800 select-all">{payment.txId}</code>
                    </div>
                  )}

                  {/* Provider / Stripe ref */}
                  {selectedOrder.providerPaymentId && !payment?.txId && (
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-400 text-xs">Ref:</span>
                      <code className="bg-white border border-neutral-200 px-2 py-0.5 rounded font-mono text-xs text-neutral-700 select-all">{selectedOrder.providerPaymentId}</code>
                    </div>
                  )}

                  {/* Payment status */}
                  {payment?.status && payment.status !== selectedOrder.paymentStatus && (
                    <p className="text-xs text-neutral-500">Payment record status: <span className="font-medium capitalize">{payment.status}</span></p>
                  )}

                  {/* Admin note */}
                  {payment?.adminNote && (
                    <p className="text-xs text-neutral-500 italic">Admin note: {payment.adminNote}</p>
                  )}

                  {/* Screenshot */}
                  {payment?.proofUrl && (
                    <div>
                      <button
                        onClick={() => setProofOpen(!proofOpen)}
                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline mt-1"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        {proofOpen ? 'Hide screenshot' : 'View payment screenshot'}
                      </button>
                      {proofOpen && (
                        <div className="mt-3 space-y-2">
                          <img src={payment.proofUrl} alt="Payment proof" className="max-w-xs w-full rounded-xl border border-neutral-200 object-contain bg-white" />
                          <a href={payment.proofUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                            <ExternalLink className="w-3 h-3" /> Open full size
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* Totals */}
              <section className="border-t border-neutral-200 pt-4">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span>{selectedOrder.subtotal?.toFixed(2)} CHF</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Shipping</span><span>{selectedOrder.shipping?.toFixed(2)} CHF</span></div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between"><span className="text-neutral-500">Discount</span><span className="text-emerald-600">−{selectedOrder.discount?.toFixed(2)} CHF</span></div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-neutral-200">
                    <span>Total</span><span>{selectedOrder.total?.toFixed(2)} CHF</span>
                  </div>
                </div>
              </section>

              {/* Payment Moderation */}
              {selectedOrder.paymentStatus !== 'completed' && selectedOrder.paymentStatus !== 'failed' && selectedOrder.paymentMethod === 'manual' && (
                <section className="border-t border-neutral-200 pt-4">
                  <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Payment Moderation
                  </h3>

                  <div className="mb-3">
                    <label className="text-sm text-neutral-600 mb-1 block">Admin note (optional)</label>
                    <textarea
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      placeholder="Add a note about this decision..."
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprovePayment(selectedOrder._id)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Approve Payment
                    </button>
                    <button
                      onClick={() => handleDeclinePayment(selectedOrder._id)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      Decline Payment
                    </button>
                  </div>
                </section>
              )}

              {/* Status Update */}
              <section className="border-t border-neutral-200 pt-4">
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(statusConfig).map(([key, cfg]) => {
                    const disabled = fulfillmentStatuses.includes(key) && selectedOrder.paymentStatus !== 'completed';
                    return (
                      <button
                        key={key}
                        onClick={() => updateStatus(selectedOrder._id, key)}
                        disabled={disabled}
                        title={disabled ? 'Approve payment first' : cfg.label}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                          selectedOrder.status === key ? cfg.color : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
                {selectedOrder.paymentStatus !== 'completed' && (
                  <p className="text-xs text-amber-700 mt-2">
                    Payment is still pending. Approve/complete payment first; tickets become active only after payment is completed.
                  </p>
                )}
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Tracking number (optional)"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                {selectedOrder.trackingNumber && (
                  <p className="text-sm text-neutral-500 mt-2">Current tracking: <span className="font-medium">{selectedOrder.trackingNumber}</span></p>
                )}
              </section>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
