'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, Truck, Shield, Check } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import ManualPaymentForm from '@/components/ManualPaymentForm';
import { FadeIn } from '@/components/animations';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const locale = useLocale();
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();
  const { user, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    street: '', city: '', zip: '', country: 'Suisse',
  });

  // Auth guard: redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/login`);
    }
  }, [user, loading, router, locale]);

  // Pre-fill form when user data loads
  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        zip: user.address?.zip || '',
        country: user.address?.country || 'Suisse',
      });
    }
  }, [user]);

  const shipping = subtotal > 100 ? 0 : 9.90;
  const total = subtotal + shipping;

  const handleCreateOrder = async () => {
    if (!ageConfirmed) {
      toast.error(locale === 'fr' ? 'Veuillez confirmer votre age' : 'Please confirm your age');
      return;
    }

    // Pre-check: block if any cart item is linked to a drawn or closed raffle
    try {
      const raffleRes = await api.get('/api/raffles');
      const raffles = Array.isArray(raffleRes.data) ? raffleRes.data : [];
      const blockedProductIds = new Set(
        raffles
          .filter(r => r.status === 'drawn' || r.status === 'closed')
          .map(r => String(r.product?._id || r.product))
      );
      const blocked = cart.filter(item => blockedProductIds.has(String(item.productId)));
      if (blocked.length > 0) {
        toast.error(
          locale === 'fr'
            ? 'Certaines tombolas sont terminees. Veuillez retirer ces articles.'
            : 'Some raffles have ended. Please remove those items.'
        );
        return;
      }
    } catch {
      // If check fails, let backend handle it
    }

    setOrderLoading(true);
    try {
      const res = await api.post('/api/orders', {
        items: cart.map(item => ({
          product: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          image: item.image,
        })),
        shippingAddress: {
          firstName: form.firstName,
          lastName: form.lastName,
          street: form.street,
          city: form.city,
          zip: form.zip,
          country: form.country,
          phone: form.phone,
        },
        subtotal,
        shipping,
        discount: 0,
        total,
        paymentMethod,
      });

      setOrder(res.data);

      if (Array.isArray(res.data?.participationSkippedProducts) && res.data.participationSkippedProducts.length > 0) {
        toast(
          locale === 'fr'
            ? 'Commande acceptee. Participation tombola deja utilisee pour ce produit.'
            : 'Order accepted. Raffle participation already used for this product.',
          { icon: '⚠️' }
        );
      }

      if (paymentMethod === 'stripe') {
        const sessionRes = await api.post('/api/payments/stripe/session', { orderId: res.data._id, amount: total });
        if (sessionRes.data?.url) {
          window.location.href = sessionRes.data.url;
          return;
        }
        // If no URL returned, Stripe session failed — show error and don't proceed
        toast.error(sessionRes.data?.message || (locale === 'fr' ? 'Erreur de paiement Stripe' : 'Stripe payment error'));
        setOrderLoading(false);
        return;
      }

      if (paymentMethod === 'manual') {
        setStep(2);
        return;
      }

      clearCart();
      setStep(3);
      toast.success(locale === 'fr' ? 'Commande passee !' : 'Order placed!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error');
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full" /></div>;
  if (!user) return null;

  if (cart.length === 0 && step !== 3) {
    router.push(`/${locale}/products`);
    return null;
  }

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-8">
          {locale === 'fr' ? 'Passer la commande' : 'Checkout'}
        </h1>

        {step === 3 && order ? (
          <FadeIn>
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900">
                {order.paymentStatus === 'completed'
                  ? (locale === 'fr' ? 'Commande confirmee !' : 'Order confirmed!')
                  : (locale === 'fr' ? 'Paiement soumis' : 'Payment submitted')}
              </h2>
              <p className="text-neutral-500 mt-2">
                {order.paymentStatus === 'completed'
                  ? `${locale === 'fr' ? 'Numero de commande' : 'Order number'}: ${order.orderNumber}`
                  : (locale === 'fr'
                    ? `Numero de commande: ${order.orderNumber}. En attente de validation du paiement.`
                    : `Order number: ${order.orderNumber}. Waiting for payment approval.`)}
              </p>
              <div className="mt-6 space-y-2 text-sm">
                {order.tickets?.map((ticket, i) => (
                  <div key={i} className="bg-neutral-50 rounded-lg p-3">
                    <span className="font-mono font-bold text-amber-600">{ticket}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => router.push(`/${locale}/orders`)}
                className="mt-6 px-6 py-3 bg-neutral-900 text-white font-medium rounded-xl hover:bg-neutral-800 transition-colors"
              >
                {locale === 'fr' ? 'Voir mes commandes' : 'View my orders'}
              </button>
            </div>
          </FadeIn>
        ) : step === 2 ? (
          <FadeIn>
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 max-w-2xl mx-auto">
              <h2 className="text-lg font-semibold mb-4">{locale === 'fr' ? 'Paiement manuel' : 'Manual payment'}</h2>
              <p className="text-sm text-neutral-500 mb-4">{locale === 'fr' ? 'Veuillez effectuer le virement et fournir la preuve' : 'Make the transfer and upload proof below'}</p>
              <ManualPaymentForm order={order} locale={locale} onDone={() => { clearCart(); setStep(3); toast.success(locale === 'fr' ? 'Paiement soumis' : 'Payment submitted'); }} />
            </div>
          </FadeIn>
        ) : (
          <div className="space-y-6">
            {/* Contact & Shipping */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold mb-4">
                {locale === 'fr' ? 'Informations de livraison' : 'Shipping information'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['firstName', 'lastName', 'email', 'phone'].map(field => (
                  <div key={field}>
                    <label className="text-sm font-medium text-neutral-700 mb-1 block capitalize">
                      {field === 'firstName' ? (locale === 'fr' ? 'Prenom' : 'First name') :
                       field === 'lastName' ? (locale === 'fr' ? 'Nom' : 'Last name') :
                       field === 'email' ? 'Email' :
                       (locale === 'fr' ? 'Telephone' : 'Phone')}
                    </label>
                    <input
                      type={field === 'email' ? 'email' : 'text'}
                      value={form[field]}
                      onChange={e => setForm({ ...form, [field]: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-neutral-700 mb-1 block">
                    {locale === 'fr' ? 'Rue' : 'Street'}
                  </label>
                  <input
                    type="text"
                    value={form.street}
                    onChange={e => setForm({ ...form, street: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                  />
                </div>
                {['city', 'zip', 'country'].map(field => (
                  <div key={field}>
                    <label className="text-sm font-medium text-neutral-700 mb-1 block capitalize">
                      {field === 'city' ? (locale === 'fr' ? 'Ville' : 'City') :
                       field === 'zip' ? (locale === 'fr' ? 'Code postal' : 'ZIP') :
                       (locale === 'fr' ? 'Pays' : 'Country')}
                    </label>
                    <input
                      type="text"
                      value={form[field]}
                      onChange={e => setForm({ ...form, [field]: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold mb-4">
                {locale === 'fr' ? 'Mode de paiement' : 'Payment method'}
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setPaymentMethod('stripe')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-colors ${paymentMethod === 'stripe' ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200'}`}
                >
                  <CreditCard className="w-5 h-5" />
                  {locale === 'fr' ? 'Stripe' : 'Stripe'}
                </button>
                <button
                  onClick={() => setPaymentMethod('manual')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-colors ${paymentMethod === 'manual' ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200'}`}
                >
                  {locale === 'fr' ? 'Paiement manuel' : 'Manual'}
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold mb-4">
                {locale === 'fr' ? 'Resume de la commande' : 'Order summary'}
              </h2>
              <div className="space-y-2 text-sm">
                {cart.map(item => (
                  <div key={`${item.productId}-${item.color}-${item.size}`} className="flex justify-between">
                    <span className="text-neutral-600">{item.name} x{item.quantity}</span>
                    <span className="font-medium">{(item.price * item.quantity).toFixed(2)} CHF</span>
                  </div>
                ))}
                <div className="border-t border-neutral-200 pt-2 flex justify-between">
                  <span className="text-neutral-500">{locale === 'fr' ? 'Sous-total' : 'Subtotal'}</span>
                  <span>{subtotal.toFixed(2)} CHF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">{locale === 'fr' ? 'Livraison' : 'Shipping'}</span>
                  <span>{shipping === 0 ? (locale === 'fr' ? 'Gratuite' : 'Free') : `${shipping.toFixed(2)} CHF`}</span>
                </div>
                <div className="border-t border-neutral-200 pt-2 flex justify-between">
                  <span className="font-semibold">{locale === 'fr' ? 'Total' : 'Total'}</span>
                  <span className="font-bold text-lg">{total.toFixed(2)} CHF</span>
                </div>
              </div>
            </div>

            {/* Age & Submit */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={e => setAgeConfirmed(e.target.checked)}
                  className="w-5 h-5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
                <span className="text-sm text-neutral-700">
                  {locale === 'fr' ? 'Je confirme avoir plus de 18 ans' : 'I confirm I am over 18 years old'}
                </span>
              </label>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleCreateOrder}
                disabled={orderLoading}
                className="mt-4 w-full py-3.5 bg-neutral-900 text-white font-medium rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {orderLoading ? (locale === 'fr' ? 'Traitement...' : 'Processing...') : (locale === 'fr' ? 'Commander' : 'Place order')}
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
