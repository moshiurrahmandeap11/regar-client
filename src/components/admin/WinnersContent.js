'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Search, Package, ChevronLeft, ChevronRight, Truck, CheckCircle, Trash2, UserPlus } from 'lucide-react';
import { FadeIn } from '@/components/animations';
import toast from 'react-hot-toast';

export default function WinnersContent() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const API = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => { fetchWinners(); }, []);

  const fetchWinners = async () => {
    try {
      const res = await fetch(`${API}/api/tickets/winners`);
      const data = await res.json();
      setWinners(data);
    } catch (error) {
      toast.error('Failed to load winners');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, claimStatus, trackingNumber = '') => {
    try {
      const body = { claimStatus };
      if (trackingNumber) body.trackingNumber = trackingNumber;
      const res = await fetch(`${API}/api/tickets/winners/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success('Status updated');
      fetchWinners();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const addSampleWinners = async () => {
    try {
      const res = await fetch(`${API}/api/tickets/winners/admin/seed`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to add sample winners');
      toast.success(data?.created?.length ? 'Sample winners added' : 'Sample winners already exist');
      fetchWinners();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteWinner = async (id) => {
    if (!confirm('Delete this winner?')) return;
    try {
      const res = await fetch(`${API}/api/tickets/winners/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Failed to delete winner');
      toast.success('Winner deleted');
      fetchWinners();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filtered = winners.filter(w => {
    const matchSearch = w.user?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      w.user?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      w.prize?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || w.claimStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
    claimed: { label: 'Claimed', color: 'bg-blue-100 text-blue-700' },
    shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700' },
    delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-700' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search winners..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        >
          <option value="all">All Status</option>
          {Object.entries(statusConfig).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
        <button
          onClick={addSampleWinners}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add sample winners
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Winner</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Prize</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Ticket</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Raffle</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((winner) => {
                    const status = statusConfig[winner.claimStatus] || statusConfig.pending;
                    return (
                      <motion.tr
                        key={winner._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center overflow-hidden">
                              {winner.user?.avatar ? (
                                <img src={winner.user.avatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Trophy className="w-4 h-4 text-amber-600" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{winner.user?.firstName} {winner.user?.lastName}</p>
                                {winner.isSeeded ? <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-medium">Sample</span> : null}
                              </div>
                              <p className="text-xs text-neutral-500">{winner.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium">{winner.prize}</p>
                          <p className="text-xs text-neutral-500">{winner.prizeValue?.toFixed(2)} CHF</p>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">{winner.ticket?.ticketNumber}</td>
                        <td className="py-3 px-4 text-sm">{winner.raffle?.name}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {winner.claimStatus === 'pending' && (
                              <button onClick={() => updateStatus(winner._id, 'claimed')} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">Mark Claimed</button>
                            )}
                            {winner.claimStatus === 'claimed' && (
                              <button onClick={() => {
                                const tracking = prompt('Enter tracking number:');
                                if (tracking) updateStatus(winner._id, 'shipped', tracking);
                              }} className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">Mark Shipped</button>
                            )}
                            {winner.claimStatus === 'shipped' && (
                              <button onClick={() => updateStatus(winner._id, 'delivered')} className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors">Mark Delivered</button>
                            )}
                            <button onClick={() => deleteWinner(winner._id)} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                          {winner.trackingNumber && (
                            <p className="text-xs text-neutral-500 mt-1">Tracking: {winner.trackingNumber}</p>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500 text-sm">No winners found</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200">
                <p className="text-sm text-neutral-500">{filtered.length} winners</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 rounded-lg hover:bg-neutral-100 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                  <span className="text-sm font-medium">{currentPage} / {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1 rounded-lg hover:bg-neutral-100 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
