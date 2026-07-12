'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { getOrderState } from '@/lib/orderDisplay';
import { FadeIn } from '@/components/animations';
import { Ticket, Truck, ShoppingBag, ArrowLeft, Copy, Check } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function OrderDetailPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const locale = useLocale();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!orderId) return;
      try {
        const res = await api.get(`/api/orders/${orderId}`);
        setOrder(res.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  const copyOrderNumber = () => {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen py-10">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-neutral-500">{locale === 'fr' ? 'Commande non trouvee' : 'Order not found'}</p>
        </div>
      </div>
    );
  }

  const orderState = getOrderState(order, locale);
  const ticketCount = (order.tickets || []).length;
  const isFr = locale === 'fr';

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          {/* Back button */}
          <button
            onClick={() => router.push(`/${locale}/orders`)}
            className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {isFr ? 'Retour aux commandes' : 'Back to orders'}
          </button>

          {/* Order Header */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">{isFr ? 'Commande' : 'Order'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <h1 className="text-xl font-bold text-neutral-900">{order.orderNumber}</h1>
                  <button onClick={copyOrderNumber} className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors">
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-sm text-neutral-500 mt-1">
                  {new Date(order.createdAt).toLocaleString('fr-CH')}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-medium ${orderState.tone}`}>
                  {orderState.label}
                </span>
                <p className="text-2xl font-bold text-neutral-900 mt-2">{order.total?.toFixed(2)} CHF</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-4">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              {isFr ? 'Articles' : 'Items'} ({order.items?.length || 0})
            </h2>
            <div className="space-y-4">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex gap-4 pb-4 border-b border-neutral-100 last:border-0 last:pb-0">
                  <img src={item.image || '/placeholder.jpg'} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-neutral-100" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-900">{item.name}</p>
                    <p className="text-sm text-neutral-500">{item.color} / {item.size}</p>
                    <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
                    {item.raffleNumber && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                          {isFr ? 'Tombola' : 'Raffle'} #{String(item.raffleNumber).padStart(3, '0')}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          {isFr ? item.raffleName : (item.raffleNameEn || item.raffleName)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{(item.price * item.quantity).toFixed(2)} CHF</p>
                    <p className="text-xs text-neutral-400">{item.price.toFixed(2)} CHF / unit</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-200 space-y-2 text-sm">
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
              <div className="flex justify-between text-base font-bold pt-2 border-t border-neutral-200">
                <span>{isFr ? 'Total' : 'Total'}</span>
                <span>{order.total?.toFixed(2)} CHF</span>
              </div>
            </div>
          </div>

          {/* Tickets */}
          {ticketCount > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-4">
              <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-amber-500" />
                {isFr ? 'Tickets' : 'Tickets'} ({ticketCount})
              </h2>
              <div className="flex flex-wrap gap-2">
                {order.tickets?.map((ticket, i) => (
                  <span key={i} className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm font-mono font-bold text-amber-700">
                    {ticket}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-4">
              <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                {isFr ? 'Adresse de livraison' : 'Shipping Address'}
              </h2>
              <div className="text-sm text-neutral-700 space-y-1">
                <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.zip} {order.shippingAddress.city}</p>
                <p>{order.shippingAddress.country}</p>
                <p className="text-neutral-500 mt-2">{order.shippingAddress.phone}</p>
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4">
              {isFr ? 'Paiement' : 'Payment'}
            </h2>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-500">{isFr ? 'Methode' : 'Method'}</span>
                <span className="capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">{isFr ? 'Statut' : 'Status'}</span>
                <span className="capitalize">{order.paymentStatus}</span>
              </div>
              {order.trackingNumber && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">{isFr ? 'Numero de suivi' : 'Tracking Number'}</span>
                  <span className="font-mono text-xs">{order.trackingNumber}</span>
                </div>
              )}
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
