'use client';

import { useEffect, useState } from 'react';

export default function DrawHistoryContent() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/winners`);
        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
      } catch (error) {
        setRows([]);
      }
    };

    load();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
      <h2 className="text-lg font-semibold mb-4">Draw History</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-neutral-500">No draws have been recorded yet.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row._id} className="rounded-xl border border-neutral-200 p-3">
              <p className="text-sm font-medium">{row.raffle?.name || 'Raffle'} - {row.prize || 'Prize'}</p>
              <p className="text-xs text-neutral-500 mt-1">Winner: {row.user?.firstName} {row.user?.lastName}</p>
              <p className="text-xs text-neutral-500 mt-1">Ticket: {row.ticket?.ticketNumber || '-'}</p>
              <p className="text-xs text-neutral-500 mt-1">Draw Date: {row.createdAt ? new Date(row.createdAt).toLocaleString('fr-CH') : '-'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
