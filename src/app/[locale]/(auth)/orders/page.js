'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { FadeIn } from '@/components/animations';
import { getOrderState } from '@/lib/orderDisplay';
import { Ticket, ShoppingBag, ArrowRight, Copy, Check } from 'lucide-react';

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

  const isFr = locale === 'fr';

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h1 className="text-2xl font-bold text-neutral-900 mb-8">
            {isFr ? 'Mes commandes' : 'My orders'}
          </h1>

          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
              <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500">{isFr ? 'Aucune commande pour le moment' : 'No orders yet'}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const orderState = getOrderState(order, locale);
                const ticketCount = (order.tickets || []).length;
                const ticketDocs = order.ticketDocs || [];

                // Group tickets by raffle for display
                const ticketsByRaffle = {};
                ticketDocs.forEach(t => {
                  const rid = t.raffle?._id || 'none';
                  if (!ticketsByRaffle[rid]) {
                    ticketsByRaffle[rid] = { raffle: t.raffle, tickets: [] };
                  }
                  ticketsByRaffle[rid].tickets.push(t.ticketNumber);
                });

                return (
                  <div key={order._id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                    {/* Order Header */}
                    <div className="p-5 sm:p-6 border-b border-neutral-100">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-neutral-900 flex items-center justify-center text-white flex-shrink-0">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-neutral-900">{order.orderNumber}</p>
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${orderState.tone}`}>
                                {orderState.label}
                              </span>
                            </div>
                            <p className="text-sm text-neutral-500 mt-0.5">
                              {new Date(order.createdAt).toLocaleString('fr-CH')}
                            </p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-2xl font-bold text-neutral-900">{order.total?.toFixed(2)} CHF</p>
                          <p className="text-xs text-neutral-500">
                            {isFr ? 'Paiement' : 'Payment'}: <span className="capitalize">{order.paymentStatus}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Items Section */}
                    <div className="p-5 sm:p-6">
                      <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        {isFr ? 'Articles' : 'Items'} ({order.items?.length || 0})
                      </h3>

                      <div className="space-y-4">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex gap-4 p-4 bg-neutral-50 rounded-xl">
                            {/* Product Image */}
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-white border border-neutral-200 flex-shrink-0">
                              <img
                                src={item.image || '/placeholder.jpg'}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                <div className="flex-1">
                                  <p className="font-semibold text-neutral-900">{item.name}</p>
                                  <p className="text-sm text-neutral-500 mt-1">
                                    {isFr ? 'Couleur' : 'Color'}: {item.color} · {isFr ? 'Taille' : 'Size'}: {item.size}
                                  </p>
                                  <p className="text-sm text-neutral-500">
                                    {isFr ? 'Quantite' : 'Quantity'}: {item.quantity}
                                  </p>
                                </div>
                                <div className="text-left sm:text-right">
                                  <p className="font-bold text-neutral-900">{(item.price * item.quantity).toFixed(2)} CHF</p>
                                  <p className="text-xs text-neutral-400">{item.price.toFixed(2)} CHF / {isFr ? 'unite' : 'unit'}</p>
                                </div>
                              </div>

                              {/* Raffle Info Badge */}
                              {item.raffleNumber ? (
                                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                                  <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                                    {isFr ? 'Tombola' : 'Raffle'} #{String(item.raffleNumber).padStart(3, '0')}
                                  </span>
                                  <span className="text-xs text-emerald-600">
                                    {isFr ? item.raffleName : (item.raffleNameEn || item.raffleName)}
                                  </span>
                                </div>
                              ) : (
                                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 border border-neutral-200 rounded-lg">
                                  <Ticket className="w-3.5 h-3.5 text-neutral-400" />
                                  <span className="text-xs text-neutral-500">
                                    {isFr ? 'Tombola non attribuee' : 'Raffle not assigned'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                      <div className="bg-neutral-50 rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-500">{isFr ? 'Sous-total' : 'Subtotal'}</span>
                          <span>{order.subtotal?.toFixed(2)} CHF</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">{isFr ? 'Livraison' : 'Shipping'}</span>
                          <span>{order.shipping === 0 ? (isFr ? 'Gratuite' : 'Free') : `${order.shipping?.toFixed(2)} CHF`}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-neutral-500">{isFr ? 'Remise' : 'Discount'}</span>
                            <span className="text-emerald-600">-{order.discount.toFixed(2)} CHF</span>
                          </div>
                        )}
                        <div className="border-t border-neutral-200 pt-2 flex justify-between font-bold">
                          <span>{isFr ? 'Total' : 'Total'}</span>
                          <span>{order.total?.toFixed(2)} CHF</span>
                        </div>
                      </div>
                    </div>

                    {/* Tickets Section */}
                    {ticketCount > 0 && (
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                          <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Ticket className="w-3.5 h-3.5" />
                            {isFr ? 'Tickets' : 'Tickets'} ({ticketCount})
                          </h3>

                          {/* Group tickets by raffle */}
                          {Object.values(ticketsByRaffle).length > 0 ? (
                            <div className="space-y-3">
                              {Object.values(ticketsByRaffle).map((group, gIdx) => (
                                <div key={gIdx}>
                                  {group.raffle && (
                                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1.5">
                                      {isFr ? 'Tombola' : 'Raffle'} #{String(group.raffle.raffleNumber || 0).padStart(3, '0')} · {isFr ? group.raffle.name : (group.raffle.nameEn || group.raffle.name)}
                                    </p>
                                  )}
                                  <div className="flex flex-wrap gap-2">
                                    {group.tickets.map((ticket, tIdx) => (
                                      <span key={tIdx} className="px-2.5 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-mono font-bold text-amber-700">
                                        {ticket}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {order.tickets?.map((ticket, i) => (
                                <span key={i} className="px-2.5 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-mono font-bold text-amber-700">
                                  {ticket}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                        <div className="bg-neutral-50 rounded-xl p-4">
                          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2">
                            {isFr ? 'Adresse de livraison' : 'Shipping Address'}
                          </h3>
                          <div className="text-sm text-neutral-700">
                            <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                            <p className="text-neutral-500">{order.shippingAddress.street}</p>
                            <p className="text-neutral-500">{order.shippingAddress.zip} {order.shippingAddress.city}</p>
                            <p className="text-neutral-500">{order.shippingAddress.country}</p>
                            {order.shippingAddress.phone && (
                              <p className="text-neutral-500 mt-1">{order.shippingAddress.phone}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="px-5 sm:px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
                      <p className="text-xs text-neutral-500">
                        {order.items?.length || 0} {isFr ? 'articles' : 'items'}
                        {ticketCount > 0 && ` · ${ticketCount} ${isFr ? 'tickets' : 'tickets'}`}
                      </p>
                      <Link
                        href={`/order-detail?id=${order._id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
                      >
                        {isFr ? 'Voir le detail' : 'View details'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </FadeIn>
      </div>
    </div>
  );
}
