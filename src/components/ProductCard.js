'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { ShoppingBag, Clock, ArrowRight } from 'lucide-react';
import { FadeIn, HoverScale } from './animations';

export default function ProductCard({ product, locale }) {
  const [hovered, setHovered] = useState(false);
  const endDate = product.raffleEndDate ? new Date(product.raffleEndDate) : null;
  const isActive = endDate && endDate > new Date();

  return (
    <FadeIn>
      <HoverScale>
        <div
          className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <Link href={`/products/${product._id}`} className="block relative">
            <div className="aspect-square bg-neutral-100 relative overflow-hidden">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-neutral-200">
                  <ShoppingBag className="w-12 h-12 text-neutral-400" />
                </div>
              )}
              {product.featured && (
                <span className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-lg">
                  {locale === 'fr' ? 'Populaire' : 'Popular'}
                </span>
              )}
              {isActive && (
                <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 bg-black/60 text-white text-xs rounded-lg backdrop-blur-sm">
                  <Clock className="w-3 h-3" />
                  {locale === 'fr' ? 'En cours' : 'Active'}
                </div>
              )}
            </div>
          </Link>

          <div className="p-4">
            <h3 className="font-semibold text-neutral-900 truncate">{product.name}</h3>
            <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{product.description}</p>
            <div className="flex items-center justify-between mt-3">
              <div>
                <span className="text-lg font-bold text-neutral-900">{product.price} CHF</span>
                {product.originalPrice && (
                  <span className="text-sm text-neutral-400 line-through ml-2">{product.originalPrice} CHF</span>
                )}
              </div>
              <span className="text-xs text-neutral-500">
                {product.maxTickets} {locale === 'fr' ? 'tickets max' : 'max tickets'}
              </span>
            </div>
            <div className="mt-3 flex gap-1">
              {product.colors?.slice(0, 4).map((color, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full border border-neutral-200"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>
      </HoverScale>
    </FadeIn>
  );
}
