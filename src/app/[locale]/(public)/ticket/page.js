'use client';

import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function TicketPage() {
  const [ticketNumber, setTicketNumber] = useState('');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!ticketNumber.trim()) {
      toast.error('Enter a ticket number');
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/api/tickets/${ticketNumber.trim().toUpperCase()}`);
      setTicket(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ticket not found');
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-neutral-900">Mon ticket</h1>
          <p className="text-sm text-neutral-500 mt-2">Consultez le statut d'un ticket de tirage.</p>

          <form onSubmit={handleLookup} className="mt-6 flex gap-2">
            <input
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
              placeholder="TKT-XXXXXXXXX"
              className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
            />
            <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-medium disabled:opacity-60">
              {loading ? '...' : 'Verifier'}
            </button>
          </form>

          {ticket ? (
            <div className="mt-6 rounded-xl border border-neutral-200 p-4">
              <p className="text-sm"><span className="font-medium">Ticket:</span> {ticket.ticketNumber}</p>
              <p className="text-sm mt-1"><span className="font-medium">Gagnant:</span> {ticket.isWinner ? 'Oui' : 'Non'}</p>
              <p className="text-sm mt-1"><span className="font-medium">Prix:</span> {ticket.prize || '-'}</p>
              <p className="text-sm mt-1"><span className="font-medium">Commande:</span> {ticket.order?.orderNumber || '-'}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
