'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Grid3X3, List } from 'lucide-react';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import SectionTitle from '@/components/SectionTitle';
import { FadeIn } from '@/components/animations';

export default function ProductsPage() {
  const locale = useLocale();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [view, setView] = useState('grid');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/products').then(res => {
      setProducts(res.data);
      setLoading(false);
    });
  }, []);

  const filtered = products.filter(p => {
    const searchLower = search.toLowerCase();
    const matchSearch = p.name?.toLowerCase().includes(searchLower) ||
      p.nameEn?.toLowerCase().includes(searchLower) ||
      p.description?.toLowerCase().includes(searchLower) ||
      p.descriptionEn?.toLowerCase().includes(searchLower);
    const matchCategory = category === 'all' || p.category === category;
    return matchSearch && matchCategory;
  });

  const categories = ['all', ...new Set(products.map(p => p.category))];

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle title={locale === 'fr' ? 'Nos produits' : 'Our products'} />

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={locale === 'fr' ? 'Rechercher...' : 'Search...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'all' ? (locale === 'fr' ? 'Toutes' : 'All') : c}</option>
              ))}
            </select>
            <div className="flex border border-neutral-200 rounded-xl overflow-hidden">
              <button onClick={() => setView('grid')} className={`p-2.5 ${view === 'grid' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600'}`}>
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button onClick={() => setView('list')} className={`p-2.5 ${view === 'list' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map(product => (
              <ProductCard key={product._id} product={product} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(product => (
              <FadeIn key={product._id}>
                <div className="flex gap-4 bg-white rounded-2xl border border-neutral-200 p-4 hover:shadow-md transition-shadow">
                  <img src={product.images?.[0] || '/placeholder.jpg'} alt={locale === 'fr' ? product.name : (product.nameEn || product.name)} className="w-32 h-32 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{locale === 'fr' ? product.name : (product.nameEn || product.name)}</h3>
                    <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{locale === 'fr' ? product.description : (product.descriptionEn || product.description)}</p>
                    <p className="text-lg font-bold mt-2">{product.price} CHF</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-neutral-500">{locale === 'fr' ? 'Aucun produit trouve' : 'No products found'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
