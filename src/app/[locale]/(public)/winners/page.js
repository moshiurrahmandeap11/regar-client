'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Ticket } from 'lucide-react';
import api from '@/lib/api';
import SectionTitle from '@/components/SectionTitle';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations';

export default function WinnersPage() {
  const locale = useLocale();
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/tickets/winners').then(res => {
      setWinners(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle title={locale === 'fr' ? 'Nos gagnants' : 'Our winners'} />

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {winners.map((winner, i) => (
            <StaggerItem key={winner._id || i}>
              <FadeIn>
                <div className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">
                        {winner.user?.firstName} {winner.user?.lastName?.charAt(0)}.
                      </p>
                      <p className="text-sm text-neutral-500">
                        {new Date(winner.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-CH' : 'en-US')}
                      </p>
                    </div>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <p className="text-sm font-medium text-neutral-700">{winner.prize}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
                      <Ticket className="w-3 h-3" />
                      {winner.ticket?.ticketNumber}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                      winner.claimStatus === 'claimed' ? 'bg-green-100 text-green-700' :
                      winner.claimStatus === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {winner.claimStatus === 'claimed' ? (locale === 'fr' ? 'Reclame' : 'Claimed') :
                       winner.claimStatus === 'shipped' ? (locale === 'fr' ? 'Expedie' : 'Shipped') :
                       (locale === 'fr' ? 'En attente' : 'Pending')}
                    </span>
                    <span className="text-sm font-bold text-amber-600">
                      {winner.prizeValue > 0 ? `${winner.prizeValue} CHF` : ''}
                    </span>
                  </div>
                </div>
              </FadeIn>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {winners.length === 0 && (
          <div className="text-center py-16">
            <p className="text-neutral-500">{locale === 'fr' ? 'Aucun gagnant pour le moment' : 'No winners yet'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
