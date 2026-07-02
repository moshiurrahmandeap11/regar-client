"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function PaymentsContent() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchList(); }, []);

  const fetchList = async () => {
    try { const res = await api.get('/api/payments'); setList(res.data); } catch (err) { toast.error('Failed to load'); } finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    try { await api.post(`/api/payments/${id}/approve`); toast.success('Approved'); fetchList(); } catch { toast.error('Failed'); }
  };

  const handleDecline = async (id) => {
    try { await api.post(`/api/payments/${id}/decline`); toast.success('Declined'); fetchList(); } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="h-40 flex items-center justify-center">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Payments</h2>
        {list.length === 0 ? <p className="text-sm text-neutral-500">No payments</p> : (
          <div className="divide-y">
            {list.map(p => {
              const canModerate = !p.synthetic && p.status === 'pending';

              return (
              <div key={p._id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{p.userId?.email || 'Guest'} — {p.method}{p.synthetic ? ' (from order)' : ''}</div>
                  <div className="text-xs text-neutral-500">{p.amount} {p.currency} — {p.status}</div>
                  <div className="text-xs text-neutral-500 mt-1">
                    Order: {p.orderId?.orderNumber || 'N/A'}
                    {p.providerPaymentId ? ` | Ref: ${p.providerPaymentId}` : ''}
                  </div>
                  {p.proofUrl ? (
                    <a href={p.proofUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                      View proof
                    </a>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(p._id)}
                    className="text-green-600 disabled:text-neutral-400 disabled:cursor-not-allowed"
                    disabled={!canModerate}
                    title={canModerate ? 'Approve payment' : 'Only real pending payments can be approved'}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDecline(p._id)}
                    className="text-red-600 disabled:text-neutral-400 disabled:cursor-not-allowed"
                    disabled={!canModerate}
                    title={canModerate ? 'Decline payment' : 'Only real pending payments can be declined'}
                  >
                    Decline
                  </button>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}
