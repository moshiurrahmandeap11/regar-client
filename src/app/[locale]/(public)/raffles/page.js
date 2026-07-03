'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { Ticket, Clock, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import CountdownTimer from '@/components/CountdownTimer';
import SectionTitle from '@/components/SectionTitle';
import { FadeIn, HoverScale } from '@/components/animations';

export default function RafflesPage() {
  const locale = useLocale();
  const [raffles, setRaffles] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/raffles').then(res => {
      setRaffles(res.data);
      setLoading(false);
    });
  }, []);

  const filtered = filter === 'all' ? raffles : raffles.filter(r => r.status === filter);

  const filters = [
    { key: 'all', label: locale === 'fr' ? 'Toutes' : 'All' },
    { key: 'active', label: locale === 'fr' ? 'Actives' : 'Active' },
    { key: 'closed', label: locale === 'fr' ? 'Terminees' : 'Closed' },
    { key: 'drawn', label: locale === 'fr' ? 'Tirees' : 'Drawn' },
  ];

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle title={locale === 'fr' ? 'Nos tombolas' : 'Our raffles'} />

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === f.key ? 'bg-neutral-900 text-white' : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(raffle => (
            <FadeIn key={raffle._id}>
              <HoverScale>
                <Link
                  href={`/products/${raffle.product?._id}`}
                  className="group block bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                >
                  {/* Image */}
                  <div className="aspect-square bg-neutral-100 relative overflow-hidden">
                    <img
                      src={raffle.product?.images?.[0] || '/placeholder.jpg'}
                      alt={raffle.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 text-xs font-bold rounded-lg ${
                        raffle.status === 'active' ? 'bg-emerald-500 text-white' :
                        raffle.status === 'drawn' ? 'bg-amber-500 text-white' :
                        'bg-neutral-500 text-white'
                      }`}>
                        {raffle.status === 'active' ? (locale === 'fr' ? 'Active' : 'Active') :
                         raffle.status === 'drawn' ? (locale === 'fr' ? 'Tiree' : 'Drawn') :
                         (locale === 'fr' ? 'Terminee' : 'Closed')}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-neutral-900 truncate">{raffle.name}</h3>
                    <p className="text-sm text-neutral-500 mt-1 truncate">{raffle.product?.name}</p>
                    {/* Product description */}
                    {(raffle.product?.description || raffle.product?.descriptionEn) && (
                      <p className="text-sm text-neutral-600 mt-2 line-clamp-2">
                        {locale === 'fr'
                          ? raffle.product.description
                          : raffle.product.descriptionEn || raffle.product.description}
                      </p>
                    )}

                    {raffle.prizes?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-neutral-500 mb-2">{locale === 'fr' ? 'Prix' : 'Prizes'}:</p>
                        <div className="flex flex-wrap gap-2">
                          {raffle.prizes.slice(0, 3).map((prize, i) => (
                            <div key={i} className="flex items-center gap-1 text-xs bg-neutral-100 px-2 py-1 rounded-lg">
                              <Ticket className="w-3 h-3 text-amber-500" />
                              {prize.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tickets sold progress */}
                    {typeof raffle.product?.soldTickets === 'number' && typeof raffle.product?.maxTickets === 'number' && raffle.product.maxTickets > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-neutral-500">{locale === 'fr' ? 'Tickets vendus' : 'Tickets sold'}</span>
                          <span className="font-semibold text-neutral-700">{raffle.product.soldTickets} / {raffle.product.maxTickets}</span>
                        </div>
                        <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#c8442d] rounded-full transition-all duration-700"
                            style={{ width: `${Math.min((raffle.product.soldTickets / raffle.product.maxTickets) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {raffle.endDate && raffle.status === 'active' && (
                      <div className="mt-4">
                        <CountdownTimer targetDate={raffle.endDate} locale={locale} variant="dark" />
                      </div>
                    )}

                    {raffle.winner && (
                      <div className="mt-4 p-3 bg-amber-50 rounded-xl">
                        <p className="text-sm font-medium text-amber-800">
                          {locale === 'fr' ? 'Gagnant' : 'Winner'}: {raffle.winner?.firstName} {raffle.winner?.lastName}
                        </p>
                        <p className="text-xs text-amber-600">{raffle.winningTicket}</p>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-xl group-hover:bg-neutral-800 transition-colors">
                      {locale === 'fr' ? 'Participer' : 'Participate'} <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </HoverScale>
            </FadeIn>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-neutral-500">{locale === 'fr' ? 'Aucune tombola' : 'No raffles'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
