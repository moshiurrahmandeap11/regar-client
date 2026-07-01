'use client';

import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TicketsContent() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const API = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const loadTickets = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search.trim()) query.set('q', search.trim());
      if (status !== 'all') query.set('status', status);

      const res = await fetch(`${API}/api/tickets?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to load tickets');
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || 'Failed to load tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadTickets();
    }, 350);
    return () => clearTimeout(timer);
  }, [search, status]);

  if (loading) return <p className="text-sm text-neutral-500">Loading tickets...</p>;

  const totalPages = Math.ceil(tickets.length / itemsPerPage) || 1;
  const paginated = tickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ticket number"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="winner">Winners</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {tickets.length === 0 ? (
          <div className="text-center py-10">
            <Ticket className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-500">No tickets found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="text-left py-3 px-4">Ticket</th>
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Raffle</th>
                    <th className="text-left py-3 px-4">Order</th>
                    <th className="text-left py-3 px-4">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((row) => (
                    <tr key={row._id} className="border-b border-neutral-100">
                      <td className="py-3 px-4 font-mono text-xs">{row.ticketNumber}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium">{row.user?.firstName} {row.user?.lastName}</p>
                        <p className="text-xs text-neutral-500">{row.user?.email || '-'}</p>
                      </td>
                      <td className="py-3 px-4">{row.raffle?.name || 'Not assigned'}</td>
                      <td className="py-3 px-4">{row.order?.orderNumber || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${row.isWinner ? 'bg-amber-100 text-amber-700' : 'bg-neutral-100 text-neutral-600'}`}>
                          {row.isWinner ? 'Winner' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 ? (
              <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200">
                <p className="text-sm text-neutral-500">{tickets.length} tickets</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded-lg hover:bg-neutral-100 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium">{currentPage} / {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded-lg hover:bg-neutral-100 disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
