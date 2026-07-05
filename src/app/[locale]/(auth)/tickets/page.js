'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useLocale } from 'next-intl';

export default function MyTicketsPage() {
  const locale = useLocale();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/tickets/my');
        setTickets(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">{locale === 'fr' ? 'Mes tickets' : 'My tickets'}</h1>
        {tickets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center text-neutral-500">
            {locale === 'fr' ? 'Aucun ticket pour le moment.' : 'No tickets yet.'}
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="bg-white rounded-2xl border border-neutral-200 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-sm font-mono font-medium">{ticket.ticketNumber}</p>
                    <p className="text-xs text-neutral-500 mt-1">{ticket.raffle?.name || (locale === 'fr' ? 'Tirage a venir' : 'Raffle pending')} - {ticket.order?.orderNumber || '-'}</p>
                  </div>
                  <span className={`inline-flex w-fit px-2.5 py-1 rounded-lg text-xs font-medium ${ticket.isWinner ? 'bg-amber-100 text-amber-700' : 'bg-neutral-100 text-neutral-700'}`}>
                    {ticket.isWinner ? (locale === 'fr' ? 'Gagnant' : 'Winner') : (locale === 'fr' ? 'Actif' : 'Active')}
                  </span>
                </div>

                {ticket.isWinner ? (
                  <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                    <p><span className="font-medium">{locale === 'fr' ? 'Prix' : 'Prize'}:</span> {ticket.prize || '-'}</p>
                    <p className="mt-1"><span className="font-medium">{locale === 'fr' ? 'Date du tirage' : 'Draw date'}:</span> {ticket.drawDate ? new Date(ticket.drawDate).toLocaleString('fr-CH') : '-'}</p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
