'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ExternalLink, Clock, CreditCard, Receipt, Image } from 'lucide-react';
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
  const [expanded, setExpanded] = useState(null); // payment _id with proof open

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
      await api.post(`/api/payments/${id}/approve`);
      toast.success('Payment approved');
      fetchList();
    } catch {
      toast.error('Failed to approve');
    }
  };

  const handleDecline = async (id) => {
    try {
      await api.post(`/api/payments/${id}/decline`);
      toast.success('Payment declined');
      fetchList();
    } catch {
      toast.error('Failed to decline');
    }
  };

  const filters = ['all', 'pending', 'approved', 'declined', 'paid'];

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
            {f}
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
                      {canModerate ? (
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
                      ) : (
                        p.proofUrl && (
                          <a
                            href={p.proofUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Proof
                          </a>
                        )
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
    </div>
  );
}
