"use client";

import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ManualPaymentForm({ order, onDone }) {
  const [txId, setTxId] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!txId) return toast.error('Transaction ID required');
    const fd = new FormData();
    fd.append('orderId', order._id);
    fd.append('amount', order.total);
    fd.append('txId', txId);
    if (file) fd.append('proof', file);
    setSubmitting(true);
    try {
      await api.post('/api/payments/manual', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Submitted for review');
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Transaction ID</label>
        <input value={txId} onChange={e => setTxId(e.target.value)} className="w-full px-3 py-2 border rounded" />
      </div>
      <div>
        <label className="text-sm font-medium">Upload proof (screenshot)</label>
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
      </div>
      <div>
        <button type="submit" disabled={submitting} className="px-4 py-2 bg-neutral-900 text-white rounded">
          {submitting ? 'Submitting...' : 'Submit Payment Proof'}
        </button>
      </div>
    </form>
  );
}
