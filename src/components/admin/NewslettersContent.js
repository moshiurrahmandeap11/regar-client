"use client";

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Trash } from 'lucide-react';
import AdminLayout from './AdminLayout';

export default function NewslettersContent() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => { fetchList(); }, []);

  const fetchList = async () => {
    try {
      const res = await api.get('/api/content/newsletters');
      setList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error('Failed to load subscribers');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this subscriber?')) return;
    try {
      await api.delete(`/api/content/newsletter/${id}`);
      toast.success('Deleted');
      setList(list.filter(i => i._id !== id));
    } catch (err) { toast.error('Delete failed'); }
  };

  if (loading) return <div className="h-40 flex items-center justify-center">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Newsletter Subscribers</h2>
        {(!Array.isArray(list) || list.length === 0) ? (
          <p className="text-sm text-neutral-500">No subscribers yet.</p>
        ) : (
          <div className="divide-y">
            {list.map(item => (
              <div key={item._id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{item.email}</div>
                  <div className="text-xs text-neutral-500">{new Date(item.createdAt).toLocaleString()}</div>
                </div>
                <div>
                  <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-600">
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
