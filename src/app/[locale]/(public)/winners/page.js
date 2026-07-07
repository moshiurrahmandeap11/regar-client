import { Ticket, Trophy } from 'lucide-react';

export const dynamic = 'force-dynamic';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.regar.ch';

async function getWinners() {
  try {
    const res = await fetch(`${API}/api/tickets/winners?limit=50&t=${Date.now()}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];

    const rows = await res.json();
    if (!Array.isArray(rows)) return [];

    return rows.sort((a, b) => {
      const aDate = new Date(a?.ticket?.drawDate || a?.createdAt || 0).getTime();
      const bDate = new Date(b?.ticket?.drawDate || b?.createdAt || 0).getTime();
      return bDate - aDate;
    });
  } catch {
    return [];
  }
}

export default async function WinnersPage({ params }) {
  const { locale } = await params;
  const winners = await getWinners();
  const isFr = locale === 'fr';

  const formatDate = (winner) => {
    const date = new Date(winner?.ticket?.drawDate || winner?.createdAt || Date.now());
    return date.toLocaleDateString(isFr ? 'fr-CH' : 'en-US');
  };

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b88238]">
            {isFr ? 'Gagnants verifies' : 'Verified winners'}
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-neutral-900">
            {isFr ? 'Nos gagnants' : 'Our winners'}
          </h1>
        </div>

        {winners.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {winners.map((winner, index) => {
              const avatar = winner.user?.avatar;
              const statusLabel =
                winner.claimStatus === 'claimed'
                  ? isFr ? 'Reclame' : 'Claimed'
                  : winner.claimStatus === 'shipped'
                    ? isFr ? 'Expedie' : 'Shipped'
                    : winner.claimStatus === 'delivered'
                      ? isFr ? 'Livre' : 'Delivered'
                      : isFr ? 'En attente' : 'Pending';
              const statusColor =
                winner.claimStatus === 'claimed'
                  ? 'bg-green-100 text-green-700'
                  : winner.claimStatus === 'shipped'
                    ? 'bg-blue-100 text-blue-700'
                    : winner.claimStatus === 'delivered'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700';

              return (
                <div key={winner._id || index} className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 overflow-hidden bg-amber-100 rounded-full flex items-center justify-center">
                      {avatar ? (
                        <img src={avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Trophy className="w-6 h-6 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">
                        {winner.user?.firstName} {winner.user?.lastName?.charAt(0)}.
                      </p>
                      <p className="text-sm text-neutral-500">{formatDate(winner)}</p>
                    </div>
                  </div>

                  <div className="bg-neutral-50 rounded-xl p-4">
                    <p className="text-sm font-medium text-neutral-700">
                      {isFr ? winner.prize : winner.prizeEn || winner.prize}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
                      <Ticket className="w-3 h-3" />
                      {winner.ticket?.ticketNumber}
                    </div>
                    {winner.raffle ? (
                      <p className="mt-2 text-xs text-neutral-500">
                        {isFr ? winner.raffle.name : winner.raffle.nameEn || winner.raffle.name}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-lg ${statusColor}`}>
                      {statusLabel}
                    </span>
                    <span className="text-sm font-bold text-amber-600">
                      {winner.prizeValue > 0 ? `${winner.prizeValue} CHF` : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Trophy className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500">{isFr ? 'Aucun gagnant pour le moment' : 'No winners yet'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
