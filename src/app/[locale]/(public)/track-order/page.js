'use client';

import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim() || (!email.trim() && !phone.trim())) {
      toast.error('Enter order number and email or phone');
      return;
    }

    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (email.trim()) query.set('email', email.trim());
      if (phone.trim()) query.set('phone', phone.trim());

      const res = await api.get(`/api/orders/track/${orderNumber.trim().toUpperCase()}?${query.toString()}`);
      setOrder(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Order not found');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-neutral-900">Suivi de commande</h1>
          <p className="text-sm text-neutral-500 mt-2">Entrez votre numero de commande et votre e-mail ou telephone.</p>

          <form onSubmit={handleTrack} className="mt-6 space-y-3">
            <input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="REG-XXXXX"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Telephone"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-neutral-900 text-white text-sm font-medium disabled:opacity-60"
            >
              {loading ? 'Recherche...' : 'Suivre'}
            </button>
          </form>

          {order ? (
            <div className="mt-6 rounded-xl border border-neutral-200 p-4">
              <p className="text-sm"><span className="font-medium">Commande:</span> {order.orderNumber}</p>
              <p className="text-sm mt-1"><span className="font-medium">Statut:</span> {order.status}</p>
              <p className="text-sm mt-1"><span className="font-medium">Paiement:</span> {order.paymentStatus}</p>
              <p className="text-sm mt-1"><span className="font-medium">Total:</span> {order.total?.toFixed(2)} CHF</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
