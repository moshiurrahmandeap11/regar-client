'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Search, Eye, EyeOff, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { FadeIn } from '@/components/animations';
import toast from 'react-hot-toast';

export default function ReviewsContent() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const API = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API}/api/reviews/admin`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setReviews(data);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (id, currentStatus) => {
    try {
      const res = await fetch(`${API}/api/reviews/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isApproved: !currentStatus }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success(currentStatus ? 'Review hidden' : 'Review approved');
      fetchReviews();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filtered = reviews.filter(r => {
    const matchSearch = r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.comment?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' ? true :
      statusFilter === 'approved' ? r.isApproved :
      !r.isApproved;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search reviews..."
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
          <option value="all">All Reviews</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>
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
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">User</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Rating</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Comment</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((review) => (
                    <motion.tr
                      key={review._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-neutral-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">{review.name?.[0]}</span>
                          </div>
                          <div>
                            <p className="font-medium">{review.name}</p>
                            <p className="text-xs text-neutral-500">{review.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'}`} />
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm max-w-xs truncate">{review.comment}</p>
                      </td>
                      <td className="py-3 px-4 text-neutral-500">
                        {new Date(review.createdAt).toLocaleDateString('fr-CH')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          review.isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {review.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleApproval(review._id, review.isApproved)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            review.isApproved
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {review.isApproved ? <EyeOff className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                          {review.isApproved ? 'Hide' : 'Approve'}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <Star className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500 text-sm">No reviews found</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200">
                <p className="text-sm text-neutral-500">{filtered.length} reviews</p>
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
