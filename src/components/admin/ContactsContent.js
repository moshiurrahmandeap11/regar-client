'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function ContactsContent() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchList();
  }, [statusFilter]);

  const fetchList = async () => {
    try {
      const query = statusFilter === 'all' ? '' : `?status=${statusFilter}`;
      const res = await api.get(`/api/content/contacts${query}`);
      setList(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error('Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  };

  const markResolved = async (id) => {
    try {
      await api.put(`/api/content/contacts/${id}/status`, { status: 'resolved' });
      toast.success('Marked as resolved');
      fetchList();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <div className="h-40 flex items-center justify-center">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border p-6">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="text-lg font-semibold">Contact Messages</h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm"
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {list.length === 0 ? (
          <p className="text-sm text-neutral-500">No messages found.</p>
        ) : (
          <div className="divide-y">
            {list.map((item) => (
              <div key={item._id} className="py-4 flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">{item.subject}</div>
                  <div className="text-sm text-neutral-600 mt-1">{item.message}</div>
                  <div className="text-xs text-neutral-500 mt-2">
                    {item.name} ({item.email}) | {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs px-2 py-1 rounded-lg inline-block ${item.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {item.status}
                  </div>
                  {item.status !== 'resolved' && (
                    <button
                      onClick={() => markResolved(item._id)}
                      className="block mt-2 text-xs text-blue-600 hover:underline"
                    >
                      Mark resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
