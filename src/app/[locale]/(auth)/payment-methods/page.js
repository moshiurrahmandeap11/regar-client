'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { FadeIn } from '@/components/animations';
import { PageLoader } from '@/components/Loader';
import {
  CreditCard, Wallet, Building2, ArrowLeft, Clock, CheckCircle, XCircle,
  Receipt, ChevronRight, Shield
} from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function PaymentMethodsPage() {
  const locale = useLocale();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const t = (en, fr) => (locale === 'fr' ? fr : en);

  useEffect(() => {
    if (!authLoading && !user) router.push(`/${locale}/login`);
  }, [user, authLoading, router, locale]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const [ordersRes, paymentsRes] = await Promise.all([
          api.get('/api/orders').catch(() => ({ data: [] })),
          api.get('/api/payments/my').catch(() => ({ data: [] })),
        ]);
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
        setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : []);
      } catch (error) {
        console.error('Payment methods load error:', error);
      } finally {
        setPageLoading(false);
      }
    };
    load();
  }, [user]);

  if (authLoading) return <PageLoader color="primary" />;
  if (!user) return null;
  if (pageLoading) return <PageLoader color="primary" />;

  // Derive unique payment methods from orders + payments
  const usedMethods = new Map();

  // From orders (Stripe)
  orders
    .filter(o => o.paymentMethod === 'stripe' && o.paymentStatus === 'completed')
    .forEach(o => {
      usedMethods.set('stripe', {
        type: 'stripe',
        label: 'Stripe',
        icon: CreditCard,
        lastUsed: o.createdAt,
        status: 'active',
        details: `Order ${o.orderNumber}`,
      });
    });

  // From manual payments
  payments
    .filter(p => p.method === 'manual')
    .forEach(p => {
      const key = p.paymentMethodId || `manual-${p.paymentMethodName}`;
      const existing = usedMethods.get(key);
      const lastUsed = existing && new Date(existing.lastUsed) > new Date(p.createdAt)
        ? existing.lastUsed
        : p.createdAt;

      usedMethods.set(key, {
        type: 'manual',
        label: p.paymentMethodName || t('Manual Transfer', 'Virement manuel'),
        icon: Building2,
        lastUsed,
        status: p.status === 'approved' || p.status === 'paid' ? 'active' : p.status,
        details: p.txId ? `TX: ${p.txId}` : '',
        paymentMethodName: p.paymentMethodName,
        txId: p.txId,
        proofUrl: p.proofUrl,
        amount: p.amount,
        currency: p.currency,
      });
    });

  const methodsList = Array.from(usedMethods.values()).sort(
    (a, b) => new Date(b.lastUsed) - new Date(a.lastUsed)
  );

  const statusConfig = {
    active: { color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle, label: t('Active', 'Actif') },
    pending: { color: 'text-amber-600 bg-amber-50', icon: Clock, label: t('Pending', 'En attente') },
    approved: { color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle, label: t('Approved', 'Approuvé') },
    paid: { color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle, label: t('Paid', 'Payé') },
    declined: { color: 'text-red-600 bg-red-50', icon: XCircle, label: t('Declined', 'Refusé') },
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-6 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <FadeIn>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link href="/dashboard" className="p-2 hover:bg-neutral-200 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-neutral-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">{t('Payment Methods', 'Moyens de paiement')}</h1>
              <p className="text-sm text-neutral-500">{t('Your saved and used payment methods', 'Vos moyens de paiement utilisés')}</p>
            </div>
          </div>

          {/* Methods List */}
          {methodsList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
              <Wallet className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="font-semibold text-neutral-900 mb-1">{t('No payment methods yet', 'Aucun moyen de paiement')}</h3>
              <p className="text-sm text-neutral-500 mb-4">
                {t('Payment methods will appear here after you make your first purchase.', 'Les moyens de paiement apparaîtront ici après votre premier achat.')}
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors"
              >
                {t('Shop Now', 'Acheter')}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {methodsList.map((method, index) => {
                const StatusIcon = statusConfig[method.status]?.icon || Shield;
                const statusStyle = statusConfig[method.status]?.color || 'text-neutral-600 bg-neutral-50';
                const statusLabel = statusConfig[method.status]?.label || method.status;

                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl border border-neutral-200 p-5 flex items-start gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
                      <method.icon className="w-6 h-6 text-neutral-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-neutral-900">{method.label}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${statusStyle}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusLabel}
                        </span>
                      </div>

                      {method.type === 'stripe' && (
                        <p className="text-sm text-neutral-500">
                          {t('Secure card payments via Stripe', 'Paiements par carte sécurisés via Stripe')}
                        </p>
                      )}

                      {method.type === 'manual' && method.details && (
                        <p className="text-sm text-neutral-500 font-mono">{method.details}</p>
                      )}

                      {method.lastUsed && (
                        <p className="text-xs text-neutral-400 mt-2">
                          {t('Last used', 'Dernier usage')}: {new Date(method.lastUsed).toLocaleDateString('fr-CH', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Payment History */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">{t('Payment History', 'Historique de paiement')}</h2>
            {payments.length === 0 && orders.filter(o => o.paymentStatus === 'completed').length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center">
                <Receipt className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">{t('No payment history yet', 'Aucun historique')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Payment records */}
                {payments.map((p) => (
                  <div key={p._id} className="bg-white rounded-2xl border border-neutral-200 p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                      {p.method === 'stripe' ? <CreditCard className="w-5 h-5 text-neutral-600" /> : <Building2 className="w-5 h-5 text-neutral-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm text-neutral-900">
                          {p.method === 'stripe' ? 'Stripe' : (p.paymentMethodName || t('Manual', 'Manuel'))}
                        </p>
                        <span className="font-bold text-sm text-neutral-900">
                          {Number(p.amount).toFixed(2)} {p.currency || 'CHF'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          p.status === 'approved' || p.status === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                          p.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                          {p.status}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {new Date(p.createdAt).toLocaleDateString('fr-CH')}
                        </span>
                      </div>
                      {p.txId && (
                        <p className="text-xs text-neutral-500 font-mono mt-1">TX: {p.txId}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Completed orders without payment records (Stripe direct) */}
                {orders
                  .filter(o => o.paymentStatus === 'completed' && !payments.some(p => p.orderId === o._id || p.orderId?._id === o._id))
                  .map((o) => (
                    <div key={o._id} className="bg-white rounded-2xl border border-neutral-200 p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5 text-neutral-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm text-neutral-900">Stripe</p>
                          <span className="font-bold text-sm text-neutral-900">{Number(o.total).toFixed(2)} CHF</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-600">
                            {t('Paid', 'Payé')}
                          </span>
                          <span className="text-xs text-neutral-400">
                            {new Date(o.createdAt).toLocaleDateString('fr-CH')}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">{t('Order', 'Commande')} #{o.orderNumber}</p>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
