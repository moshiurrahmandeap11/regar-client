'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { FadeIn } from '@/components/animations';

export default function OrdersPage() {
  const locale = useLocale();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/login`);
    }
  }, [user, loading, router, locale]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;
      try {
        const res = await api.get('/api/orders');
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load orders');
      } finally {
        setPageLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full" /></div>;
  if (!user) return null;
  if (pageLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h1 className="text-2xl font-bold text-neutral-900 mb-8">
            {locale === 'fr' ? 'Mes commandes' : 'My orders'}
          </h1>

          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
              <p className="text-neutral-500">{locale === 'fr' ? 'Aucune commande pour le moment' : 'No orders yet'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-2xl border border-neutral-200 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <p className="text-sm text-neutral-500">{new Date(order.createdAt).toLocaleString('fr-CH')}</p>
                      <p className="font-semibold text-neutral-900 mt-1">{order.orderNumber}</p>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 text-neutral-700 capitalize">
                        {order.status}
                      </span>
                      <p className="text-lg font-bold text-neutral-900 mt-2">{order.total?.toFixed(2)} CHF</p>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-neutral-600">
                    <p>{order.items?.length || 0} {locale === 'fr' ? 'articles' : 'items'} • {(order.tickets || []).length} {locale === 'fr' ? 'tickets' : 'tickets'}</p>
                    <p className="mt-1">{locale === 'fr' ? 'Paiement' : 'Payment'}: <span className="capitalize">{order.paymentStatus}</span></p>
                  </div>

                  <div className="mt-4">
                    <Link
                      href={`/order-detail?id=${order._id}`}
                      className="inline-flex px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
                    >
                      {locale === 'fr' ? 'Voir le detail' : 'View details'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </FadeIn>
      </div>
    </div>
  );
}
