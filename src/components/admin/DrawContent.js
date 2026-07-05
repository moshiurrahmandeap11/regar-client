'use client';

import { useEffect, useMemo, useState } from 'react';
import { Sparkles, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DrawContent() {
  const [raffles, setRaffles] = useState([]);
  const [selectedRaffleId, setSelectedRaffleId] = useState('');
  const [latestWinner, setLatestWinner] = useState(null);
  const [loading, setLoading] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const loadRaffles = async () => {
    try {
      const [raffleRes, ticketRes] = await Promise.all([
        fetch(`${API}/api/raffles`),
        fetch(`${API}/api/tickets`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const raffleData = await raffleRes.json();
      const ticketData = ticketRes.ok ? await ticketRes.json() : [];

      const ticketCountByRaffle = new Map();
      (Array.isArray(ticketData) ? ticketData : []).forEach((ticket) => {
        const raffleId = ticket?.raffle?._id || ticket?.raffle;
        if (!raffleId) return;
        const key = String(raffleId);
        ticketCountByRaffle.set(key, (ticketCountByRaffle.get(key) || 0) + 1);
      });

      const now = new Date();
      const list = (Array.isArray(raffleData) ? raffleData : [])
        .filter((raffle) => ['active', 'closed'].includes(raffle.status) && !raffle.winner)
        .map((raffle) => {
          const raffleId = String(raffle._id);
          const ticketCount = Number.isFinite(raffle.ticketCount)
            ? raffle.ticketCount
            : (ticketCountByRaffle.get(raffleId) || 0);
          const isEnded = raffle.endDate ? new Date(raffle.endDate) <= now : false;
          const canDraw = typeof raffle.canDraw === 'boolean'
            ? raffle.canDraw
            : (ticketCount > 0 && isEnded);

          return {
            ...raffle,
            ticketCount,
            canDraw,
          };
        });

      setRaffles(list);

      if (!selectedRaffleId) {
        const firstEligible = list.find((raffle) => raffle.canDraw) || list[0];
        if (firstEligible?._id) setSelectedRaffleId(firstEligible._id);
      }
    } catch (error) {
      toast.error('Failed to load raffles');
    }
  };

  useEffect(() => {
    loadRaffles();
  }, []);

  const selectedRaffle = useMemo(
    () => raffles.find((raffle) => raffle._id === selectedRaffleId) || null,
    [raffles, selectedRaffleId]
  );

  const getNotReadyReason = (raffle) => {
    if (!raffle) return '';
    if (!raffle.ticketCount) return 'No eligible tickets';
    return 'Raffle is still running';
  };

  const confirmWithToast = (message) => {
    return new Promise((resolve) => {
      toast((t) => (
        <div className="space-y-2">
          <p className="text-sm">{message}</p>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded bg-neutral-900 text-white text-xs"
              onClick={() => { toast.dismiss(t.id); resolve(true); }}
            >
              Confirm
            </button>
            <button
              className="px-3 py-1 rounded border text-xs"
              onClick={() => { toast.dismiss(t.id); resolve(false); }}
            >
              Cancel
            </button>
          </div>
        </div>
      ), { duration: 10000 });
    });
  };

  const handleDraw = async () => {
    if (!selectedRaffleId) {
      toast.error('Select a raffle first');
      return;
    }

    const confirmed = await confirmWithToast('Run draw for this raffle now?');
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/raffles/${selectedRaffleId}/draw`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Draw failed');

      setLatestWinner(data);
      toast.success(`Winner selected: ${data?.winner?.ticketNumber}`);
      await loadRaffles();
      setSelectedRaffleId('');
    } catch (error) {
      toast.error(error.message || 'Draw failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold mb-2">Draw</h2>
        <p className="text-sm text-neutral-500 mb-4">Pick one raffle and run winner draw in one click.</p>

        <div className="max-w-xl space-y-4">
          <select
            value={selectedRaffleId}
            onChange={(e) => setSelectedRaffleId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
          >
            <option value="">Select raffle</option>
            {raffles.map((raffle) => (
                <option key={raffle._id} value={raffle._id}>
                  {raffle.raffleNumber ? `Raffle No. ${String(raffle.raffleNumber).padStart(3, '0')} - ` : ''}{raffle.name} - {raffle.product?.name || 'No product'} ({raffle.ticketCount || 0} paid tickets){raffle.canDraw ? '' : ` - ${getNotReadyReason(raffle)}`}
                </option>
              ))}
          </select>

          {selectedRaffle ? (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm">
              {selectedRaffle.raffleNumber ? (
                <p className="text-xs font-semibold tracking-wide text-amber-700 mb-2">
                  Raffle No. {String(selectedRaffle.raffleNumber).padStart(3, '0')}
                </p>
              ) : null}
              <p><span className="font-medium">Raffle:</span> {selectedRaffle.name}</p>
              <p className="mt-1"><span className="font-medium">Product:</span> {selectedRaffle.product?.name || '-'}</p>
              <p className="mt-1"><span className="font-medium">Ends:</span> {selectedRaffle.endDate ? new Date(selectedRaffle.endDate).toLocaleString('fr-CH') : '-'}</p>
              <p className="mt-1"><span className="font-medium">Paid tickets:</span> {selectedRaffle.ticketCount || 0}</p>
              {!selectedRaffle.canDraw && (
                <p className="mt-2 text-amber-700">Not ready for draw: {getNotReadyReason(selectedRaffle)}</p>
              )}
            </div>
          ) : null}

          <button
            onClick={handleDraw}
            disabled={loading || !selectedRaffleId || !selectedRaffle?.canDraw}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-sm disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Drawing...' : 'Run Draw'}
          </button>
        </div>
      </div>

      {latestWinner?.winner ? (
        <div className="bg-white rounded-2xl border border-amber-200 p-6">
          <h3 className="text-base font-semibold flex items-center gap-2 text-amber-700">
            <Trophy className="w-4 h-4" /> Latest Winner
          </h3>
          <p className="text-sm mt-3"><span className="font-medium">Ticket:</span> {latestWinner.winner.ticketNumber}</p>
          <p className="text-sm mt-1"><span className="font-medium">Prize:</span> {latestWinner.prize?.name || 'Grand Prize'}</p>
        </div>
      ) : null}
    </div>
  );
}
