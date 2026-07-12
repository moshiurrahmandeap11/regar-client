'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Check, ShoppingBag, ArrowRight, Ticket } from 'lucide-react';
import { FadeIn } from '@/components/animations';
import { useCart } from '@/contexts/CartContext';
import api from '@/lib/api';

export default function ConfirmationPage() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('orderId');
  const isFr = locale === 'fr';

  useEffect(() => {
    // Always clear cart on this page — payment was attempted/completed
    clearCart();

    const fetchOrder = async () => {
      try {
        if (orderId) {
          // Fetch specific order by ID
          const res = await api.get(`/api/orders/${orderId}`);
          setOrder(res.data);
        } else {
          // Fallback: get most recent order
          const res = await api.get('/api/orders');
          const orders = Array.isArray(res.data) ? res.data : [];
          if (orders.length > 0) {
            setOrder(orders[0]);
          }
        }
      } catch {
        // Silently fail — still show success message
      } finally {
        setLoading(false);
      }
    };

    // Small delay to allow webhook to process
    const timer = setTimeout(fetchOrder, 1000);
    return () => clearTimeout(timer);
  }, [orderId, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-2 border-neutral-900 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-neutral-500">{isFr ? 'Verification du paiement...' : 'Verifying payment...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">
              {isFr ? 'Paiement reussi !' : 'Payment successful!'}
            </h2>
            <p className="text-neutral-500 mt-2">
              {isFr
                ? 'Votre commande a ete traitee avec succes. Merci pour votre achat !'
                : 'Your order has been processed successfully. Thank you for your purchase!'}
            </p>

            {order && (
              <div className="mt-6 bg-neutral-50 rounded-xl p-4 text-left">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-neutral-500">{isFr ? 'Commande' : 'Order'}</span>
                  <span className="font-bold text-neutral-900">{order.orderNumber}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-neutral-500">{isFr ? 'Total' : 'Total'}</span>
                  <span className="font-bold text-neutral-900">{order.total?.toFixed(2)} CHF</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">{isFr ? 'Statut' : 'Status'}</span>
                  <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${order.paymentStatus === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {order.paymentStatus === 'completed'
                      ? (isFr ? 'Paye' : 'Paid')
                      : (isFr ? 'En attente' : 'Pending')}
                  </span>
                </div>

                {order.tickets && order.tickets.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <p className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Ticket className="w-3.5 h-3.5" />
                      {isFr ? 'Vos tickets' : 'Your tickets'} ({order.tickets.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {order.tickets.map((ticket, i) => (
                        <span key={i} className="px-2 py-1 bg-white border border-amber-200 rounded-lg text-[10px] font-mono font-bold text-amber-600">
                          {ticket}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 space-y-3">
              <Link
                href="/orders"
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-neutral-900 text-white font-medium rounded-xl hover:bg-neutral-800 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                {isFr ? 'Voir mes commandes' : 'View my orders'}
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 text-neutral-700 font-medium rounded-xl hover:bg-neutral-100 transition-colors"
              >
                {isFr ? 'Continuer les achats' : 'Continue shopping'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
