'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight, AlertTriangle } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useCart } from '@/contexts/CartContext';
import { FadeIn } from '@/components/animations';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function CartPage() {
  const locale = useLocale();
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();
  const [drawnProductIds, setDrawnProductIds] = useState(new Set());
  const [checkingRaffles, setCheckingRaffles] = useState(true);
  const shipping = subtotal > 100 ? 0 : 9.90;
  const total = subtotal + shipping;

  // Check if any cart item's product is linked to a drawn raffle
  useEffect(() => {
    const checkRaffles = async () => {
      if (cart.length === 0) {
        setCheckingRaffles(false);
        return;
      }
      try {
        const res = await api.get('/api/raffles');
        const raffles = Array.isArray(res.data) ? res.data : [];
        const drawn = new Set(
          raffles
            .filter(r => r.status === 'drawn' || r.status === 'closed')
            .map(r => String(r.product?._id || r.product))
        );
        setDrawnProductIds(drawn);
      } catch {
        // silently fail — backend will block anyway
      } finally {
        setCheckingRaffles(false);
      }
    };
    checkRaffles();
  }, [cart]);

  const blockedItems = cart.filter(item => drawnProductIds.has(String(item.productId)));
  const hasBlockedItems = blockedItems.length > 0;

  const handleCheckout = () => {
    if (hasBlockedItems) {
      toast.error(
        locale === 'fr'
          ? 'Certaines tombolas sont terminees. Veuillez retirer ces articles.'
          : 'Some raffles have ended. Please remove those items.'
      );
      return;
    }
    router.push(`/${locale}/checkout`);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8 text-neutral-400" />
        </div>
        <h2 className="text-xl font-semibold text-neutral-900">
          {locale === 'fr' ? 'Votre panier est vide' : 'Your cart is empty'}
        </h2>
        <p className="text-neutral-500 mt-2 mb-6">
          {locale === 'fr' ? 'Decouvrez nos produits' : 'Discover our products'}
        </p>
        <Link
          href="/products"
          className="px-6 py-3 bg-neutral-900 text-white font-medium rounded-xl hover:bg-neutral-800 transition-colors"
        >
          {locale === 'fr' ? 'Continuer les achats' : 'Continue shopping'}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-8">
          {locale === 'fr' ? 'Votre panier' : 'Your cart'} ({totalItems} {totalItems === 1 ? (locale === 'fr' ? 'article' : 'item') : (locale === 'fr' ? 'articles' : 'items')})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {hasBlockedItems && (
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                {locale === 'fr'
                  ? 'Certaines tombolas ont deja ete tirees. Veuillez retirer ces articles du panier.'
                  : 'Some raffles have already been drawn. Please remove those items from your cart.'}
              </div>
            )}
            {cart.map((item, index) => {
              const isBlocked = drawnProductIds.has(String(item.productId));
              return (
                <FadeIn key={`${item.productId}-${item.color}-${item.size}`} delay={index * 0.05}>
                  <div className={`flex gap-4 bg-white rounded-2xl border p-4 ${isBlocked ? 'border-amber-300 bg-amber-50/30' : 'border-neutral-200'}`}>
                    <img src={item.image} alt={item.name} className="w-24 h-24 rounded-xl object-cover" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-neutral-900">{item.name}</h3>
                          <p className="text-sm text-neutral-500 mt-1">
                            {item.color} / {item.size}
                          </p>
                          {isBlocked && (
                            <p className="text-xs text-amber-600 mt-1 font-medium">
                              {locale === 'fr' ? 'Tombola terminee — non disponible' : 'Raffle ended — unavailable'}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId, item.color, item.size)}
                          className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className={`flex items-center border rounded-lg ${isBlocked ? 'border-amber-200 opacity-60' : 'border-neutral-200'}`}>
                          <button
                            onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity - 1)}
                            disabled={isBlocked}
                            className="p-2 hover:bg-neutral-100 transition-colors disabled:opacity-40"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity + 1)}
                            disabled={isBlocked}
                            className="p-2 hover:bg-neutral-100 transition-colors disabled:opacity-40"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="font-bold text-neutral-900">{(item.price * item.quantity).toFixed(2)} CHF</p>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>

          <FadeIn delay={0.2}>
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 h-fit">
              <h2 className="text-lg font-semibold mb-4">
                {locale === 'fr' ? 'Resume' : 'Summary'}
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">{locale === 'fr' ? 'Sous-total' : 'Subtotal'}</span>
                  <span className="font-medium">{subtotal.toFixed(2)} CHF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">{locale === 'fr' ? 'Livraison' : 'Shipping'}</span>
                  <span className="font-medium">{shipping === 0 ? (locale === 'fr' ? 'Gratuite' : 'Free') : `${shipping.toFixed(2)} CHF`}</span>
                </div>
                {subtotal < 100 && (
                  <p className="text-xs text-amber-600">
                    {locale === 'fr' ? `Plus que ${(100 - subtotal).toFixed(2)} CHF pour la livraison gratuite` : `${(100 - subtotal).toFixed(2)} CHF more for free shipping`}
                  </p>
                )}
                <div className="border-t border-neutral-200 pt-3 flex justify-between">
                  <span className="font-semibold">{locale === 'fr' ? 'Total' : 'Total'}</span>
                  <span className="font-bold text-lg">{total.toFixed(2)} CHF</span>
                </div>
              </div>
              <motion.button
                whileHover={hasBlockedItems ? {} : { scale: 1.01 }}
                whileTap={hasBlockedItems ? {} : { scale: 0.99 }}
                onClick={handleCheckout}
                disabled={hasBlockedItems || checkingRaffles}
                className={`mt-6 w-full flex items-center justify-center gap-2 py-3.5 font-medium rounded-xl transition-colors ${
                  hasBlockedItems || checkingRaffles
                    ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                    : 'bg-neutral-900 text-white hover:bg-neutral-800'
                }`}
              >
                {checkingRaffles
                  ? (locale === 'fr' ? 'Verification...' : 'Checking...')
                  : hasBlockedItems
                    ? (locale === 'fr' ? 'Articles non disponibles' : 'Items unavailable')
                    : (locale === 'fr' ? 'Passer la commande' : 'Checkout')}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <Link href="/products" className="mt-3 block text-center text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
                {locale === 'fr' ? 'Continuer les achats' : 'Continue shopping'}
              </Link>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
