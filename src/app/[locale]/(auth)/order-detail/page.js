'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!orderId) return;
      try {
        const res = await api.get(`/api/orders/${orderId}`);
        setOrder(res.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load order');
      }
    };

    load();
  }, [orderId]);

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-neutral-900">Detail de la commande</h1>
          {!order ? (
            <p className="text-sm text-neutral-500 mt-4">Aucune commande chargee. Ouvrez avec ?id=ORDER_ID</p>
          ) : (
            <div className="mt-6 space-y-2 text-sm">
              <p><span className="font-medium">Numero:</span> {order.orderNumber}</p>
              <p><span className="font-medium">Statut:</span> {order.status}</p>
              <p><span className="font-medium">Paiement:</span> {order.paymentStatus}</p>
              <p><span className="font-medium">Total:</span> {order.total?.toFixed(2)} CHF</p>
              <p><span className="font-medium">Tickets:</span> {(order.tickets || []).join(', ') || '-'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
