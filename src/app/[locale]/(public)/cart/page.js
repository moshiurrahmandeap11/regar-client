'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useCart } from '@/contexts/CartContext';
import { FadeIn } from '@/components/animations';

export default function CartPage() {
  const locale = useLocale();
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();
  const shipping = subtotal > 100 ? 0 : 9.90;
  const total = subtotal + shipping;

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
            {cart.map((item, index) => (
              <FadeIn key={`${item.productId}-${item.color}-${item.size}`} delay={index * 0.05}>
                <div className="flex gap-4 bg-white rounded-2xl border border-neutral-200 p-4">
                  <img src={item.image} alt={item.name} className="w-24 h-24 rounded-xl object-cover" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-neutral-900">{item.name}</h3>
                        <p className="text-sm text-neutral-500 mt-1">
                          {item.color} / {item.size}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId, item.color, item.size)}
                        className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-neutral-200 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity - 1)}
                          className="p-2 hover:bg-neutral-100 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity + 1)}
                          className="p-2 hover:bg-neutral-100 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="font-bold text-neutral-900">{(item.price * item.quantity).toFixed(2)} CHF</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
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
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => router.push(`/${locale}/checkout`)}
                className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 bg-neutral-900 text-white font-medium rounded-xl hover:bg-neutral-800 transition-colors"
              >
                {locale === 'fr' ? 'Passer la commande' : 'Checkout'} <ArrowRight className="w-4 h-4" />
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
