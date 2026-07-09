'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, XCircle, ExternalLink, Clock, CreditCard, Receipt, Image,
  Eye, X, User, Package, FileText, AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  pending:  'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  paid:     'bg-emerald-100 text-emerald-700',
  declined: 'bg-red-100 text-red-700',
};

export default function PaymentsContent() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');

  useEffect(() => { fetchList(); }, []);

  const fetchList = async () => {
    try {
      const res = await api.get('/api/payments');
      setList(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load payments');
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/api/payments/${id}/approve`, { note });
      toast.success('Payment approved');
      setSelected(null);
      setNote('');
      fetchList();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleDecline = async (id) => {
    try {
      await api.post(`/api/payments/${id}/decline`, { note });
      toast.success('Payment declined');
      setSelected(null);
      setNote('');
      fetchList();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to decline');
    }
  };

  const filters = ['all', 'pending', 'approved', 'declined', 'paid'];

  const counts = useMemo(() => {
    const c = { all: list.length, pending: 0, approved: 0, declined: 0, paid: 0 };
    list.forEach((p) => { if (c[p.status] !== undefined) c[p.status]++; });
    return c;
  }, [list]);

  const filtered = filter === 'all'
    ? list
    : list.filter((p) => p.status === filter);

  if (loading) {
    return (
      <div className="h-40 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              filter === f
                ? 'bg-neutral-900 text-white'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {f} {counts[f] > 0 && <span className="ml-1 opacity-70">({counts[f]})</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
          <Receipt className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 text-sm">No payments found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const canModerate = !p.synthetic && p.status === 'pending';
            const isExpanded = expanded === p._id;

            return (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-neutral-200 overflow-hidden"
              >
                {/* Main row */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">

                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
                      <CreditCard className="w-5 h-5 text-neutral-600" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-neutral-900">
                          {p.userId?.firstName} {p.userId?.lastName}
                        </span>
                        <span className="text-xs text-neutral-400">{p.userId?.email}</span>
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${STATUS_STYLES[p.status] || 'bg-neutral-100 text-neutral-600'}`}>
                          {p.status}
                        </span>
                        {p.synthetic && (
                          <span className="px-2 py-0.5 rounded-lg text-xs bg-neutral-100 text-neutral-500">from order</span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-600">
                        <span className="font-bold text-neutral-900">{Number(p.amount).toFixed(2)} {p.currency || 'CHF'}</span>
                        <span>Order: <span className="font-medium">{p.orderId?.orderNumber || 'N/A'}</span></span>
                        <span className="capitalize">via {p.paymentMethodName || p.method}</span>
                        {p.createdAt && (
                          <span className="flex items-center gap-1 text-neutral-400 text-xs">
                            <Clock className="w-3 h-3" />
                            {new Date(p.createdAt).toLocaleString('fr-CH', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      {/* Transaction ID */}
                      {p.txId && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-neutral-400">TX ID:</span>
                          <code className="bg-neutral-100 px-2 py-0.5 rounded font-mono text-neutral-700 select-all">{p.txId}</code>
                        </div>
                      )}

                      {/* Admin note */}
                      {p.adminNote && (
                        <p className="text-xs text-neutral-500 italic">Note: {p.adminNote}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* View details */}
                      <button
                        onClick={() => setSelected(p)}
                        className="p-1.5 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Toggle screenshot */}
                      {p.proofUrl && (
                        <button
                          onClick={() => setExpanded(isExpanded ? null : p._id)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View screenshot"
                        >
                          <Image className="w-4 h-4" />
                        </button>
                      )}

                      {/* Quick approve/decline (only for pending real payments) */}
                      {canModerate && (
                        <>
                          <button
                            onClick={() => handleApprove(p._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-medium hover:bg-emerald-700 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleDecline(p._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-medium hover:bg-red-700 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Decline
                          </button>
                        </>
                      )}

                      {/* For non-moderatable with proof, show proof link */}
                      {!canModerate && p.proofUrl && (
                        <a
                          href={p.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Proof
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded screenshot */}
                {isExpanded && p.proofUrl && (
                  <div className="border-t border-neutral-100 p-4 bg-neutral-50">
                    <p className="text-xs font-medium text-neutral-500 mb-3">Payment screenshot</p>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <img
                        src={p.proofUrl}
                        alt="Payment proof"
                        className="max-w-xs w-full rounded-xl border border-neutral-200 object-contain bg-white"
                      />
                      <div className="space-y-2 text-sm">
                        {p.txId && (
                          <div>
                            <p className="text-xs text-neutral-400 font-medium uppercase tracking-wide mb-1">Transaction ID</p>
                            <code className="block bg-white border border-neutral-200 px-3 py-2 rounded-lg font-mono text-neutral-800 text-sm select-all">
                              {p.txId}
                            </code>
                          </div>
                        )}
                        {p.paymentMethodName && (
                          <div>
                            <p className="text-xs text-neutral-400 font-medium uppercase tracking-wide mb-1">Payment Method</p>
                            <p className="font-medium text-neutral-700">{p.paymentMethodName}</p>
                          </div>
                        )}
                        <a
                          href={p.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Open full size
                        </a>
                      </div>
                    </div>

                    {canModerate && (
                      <div className="flex gap-3 mt-4 pt-4 border-t border-neutral-200">
                        <button
                          onClick={() => handleApprove(p._id)}
                          className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve Payment
                        </button>
                        <button
                          onClick={() => handleDecline(p._id)}
                          className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-4 h-4" /> Decline
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Detail Modal ── */}
      <AnimatePresence>
        {selected && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-neutral-200 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Payment Details</h2>
                  <p className="text-sm text-neutral-500">
                    {selected.orderId?.orderNumber || 'N/A'} · {new Date(selected.createdAt).toLocaleString('fr-CH')}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-2 hover:bg-neutral-100 rounded-lg shrink-0"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status badge */}
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${STATUS_STYLES[selected.status] || 'bg-neutral-100 text-neutral-600'}`}>
                    {selected.status}
                  </span>
                  {selected.synthetic && (
                    <span className="px-2 py-1 rounded-lg text-xs bg-neutral-100 text-neutral-500">from order</span>
                  )}
                </div>

                {/* Customer */}
                <section>
                  <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Customer
                  </h3>
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <p className="font-medium">{selected.userId?.firstName} {selected.userId?.lastName}</p>
                    <p className="text-sm text-neutral-500">{selected.userId?.email}</p>
                  </div>
                </section>

                {/* Order */}
                <section>
                  <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" /> Order
                  </h3>
                  <div className="bg-neutral-50 rounded-xl p-4 text-sm space-y-1">
                    <p><span className="text-neutral-500">Order Number:</span> <span className="font-medium">{selected.orderId?.orderNumber || 'N/A'}</span></p>
                    <p><span className="text-neutral-500">Amount:</span> <span className="font-bold text-neutral-900">{Number(selected.amount).toFixed(2)} {selected.currency || 'CHF'}</span></p>
                    <p><span className="text-neutral-500">Method:</span> <span className="capitalize">{selected.paymentMethodName || selected.method}</span></p>
                    {selected.txId && (
                      <p><span className="text-neutral-500">TX ID:</span> <code className="bg-white border border-neutral-200 px-2 py-0.5 rounded font-mono text-xs">{selected.txId}</code></p>
                    )}
                    {selected.providerPaymentId && (
                      <p><span className="text-neutral-500">Provider ID:</span> <code className="bg-white border border-neutral-200 px-2 py-0.5 rounded font-mono text-xs">{selected.providerPaymentId}</code></p>
                    )}
                  </div>
                </section>

                {/* Payment Proof */}
                {selected.proofUrl && (
                  <section>
                    <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Payment Proof
                    </h3>
                    <div className="bg-neutral-50 rounded-xl p-4">
                      <img
                        src={selected.proofUrl}
                        alt="Payment proof"
                        className="max-w-xs w-full rounded-xl border border-neutral-200 object-contain bg-white mb-3"
                      />
                      <a
                        href={selected.proofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Open full size
                      </a>
                    </div>
                  </section>
                )}

                {/* Admin Note */}
                {selected.adminNote && (
                  <section>
                    <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> Admin Note
                    </h3>
                    <div className="bg-neutral-50 rounded-xl p-4 text-sm text-neutral-700">
                      {selected.adminNote}
                    </div>
                  </section>
                )}

                {/* Moderation */}
                {!selected.synthetic && selected.status === 'pending' && (
                  <section className="border-t border-neutral-200 pt-4">
                    <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                      Moderation
                    </h3>

                    {/* Note input */}
                    <div className="mb-4">
                      <label className="text-sm text-neutral-600 mb-1 block">Admin note (optional)</label>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Add a note about this decision..."
                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(selected._id)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve Payment
                      </button>
                      <button
                        onClick={() => handleDecline(selected._id)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="w-4 h-4" /> Decline
                      </button>
                    </div>
                  </section>
                )}

                {/* Already moderated message */}
                {!selected.synthetic && selected.status !== 'pending' && (
                  <div className="border-t border-neutral-200 pt-4">
                    <p className="text-sm text-neutral-500">
                      This payment has already been <span className="font-medium capitalize">{selected.status}</span>.
                      {selected.adminNote && (
                        <span className="block mt-1">Note: {selected.adminNote}</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
