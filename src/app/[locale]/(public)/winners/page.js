import { Ticket, Trophy } from 'lucide-react';
import WinnersShowcase from '@/components/WinnersShowcase';

export const dynamic = 'force-dynamic';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.regar.ch';

async function getWinnersShowcase() {
  try {
    const res = await fetch(`${API}/api/content/winners-showcase`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

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
  const [showcaseData, winners] = await Promise.all([
    getWinnersShowcase(),
    getWinners(),
  ]);

  const isFr = locale === 'fr';

  const formatDate = (winner) => {
    const date = new Date(winner?.ticket?.drawDate || winner?.createdAt || Date.now());
    return date.toLocaleDateString(isFr ? 'fr-CH' : 'en-US');
  };

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* 1. Luxury Winners Showcase (Social Proof Grid Matching Client Mockup) */}
      <WinnersShowcase showcaseData={showcaseData} showTopBrand={true} />

      {/* 2. Secondary Verified Draw Ledger (Transparency Section) */}
      {winners.length > 0 && (
        <section className="py-12 border-t border-black/10 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b88238]">
                  {isFr ? 'Transparence & Sécurité' : 'Transparency & Security'}
                </p>
                <h3 className="mt-1 text-xl sm:text-2xl font-black text-neutral-900">
                  {isFr ? 'Registre des tirages vérifiés' : 'Verified Draw Registry'}
                </h3>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-neutral-100 text-neutral-700">
                {winners.length} {isFr ? 'gagnants enregistrés' : 'winners recorded'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {winners.map((winner, index) => {
                const avatar = winner.user?.avatar;
                const statusLabel =
                  winner.claimStatus === 'claimed'
                    ? isFr ? 'Réclamé' : 'Claimed'
                    : winner.claimStatus === 'shipped'
                      ? isFr ? 'Expédié' : 'Shipped'
                      : winner.claimStatus === 'delivered'
                        ? isFr ? 'Livré' : 'Delivered'
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
                  <div
                    key={winner._id || index}
                    className="bg-neutral-50 rounded-2xl border border-neutral-200/80 p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3.5 mb-3">
                      <div className="w-11 h-11 overflow-hidden bg-[#f3eadb] rounded-full flex items-center justify-center shrink-0">
                        {avatar ? (
                          <img src={avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Trophy className="w-5 h-5 text-[#9b6e2d]" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-neutral-900">
                          {winner.user?.firstName} {winner.user?.lastName?.charAt(0)}.
                        </p>
                        <p className="text-xs text-neutral-500">{formatDate(winner)}</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-3 border border-neutral-200/60 space-y-1.5">
                      <p className="text-xs font-bold text-neutral-800">
                        {isFr ? winner.prize : winner.prizeEn || winner.prize}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                        <Ticket className="w-3 h-3 text-[#9b6e2d]" />
                        <span>Ticket #{winner.ticket?.ticketNumber || 'N/A'}</span>
                      </div>
                      {winner.raffle && (
                        <p className="text-[11px] text-neutral-400 truncate">
                          {isFr ? winner.raffle.name : winner.raffle.nameEn || winner.raffle.name}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${statusColor}`}>
                        {statusLabel}
                      </span>
                      {winner.prizeValue ? (
                        <span className="font-black text-[#9b6e2d]">
                          {winner.prizeValue} CHF
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
