'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UserCheck, UserX, Mail, Calendar, ChevronLeft, ChevronRight, Shield, Users } from 'lucide-react';
import { FadeIn } from '@/components/animations';
import toast from 'react-hot-toast';

export default function UsersContent() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const API = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/api/auth`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const res = await fetch(`${API}/api/auth/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success(currentStatus ? 'User suspended' : 'User activated');
      fetchUsers();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' ? true :
      statusFilter === 'active' ? u.isActive :
      !u.isActive;
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
            placeholder="Search users..."
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
          <option value="all">All Users</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
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
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Phone</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Joined</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((user) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-neutral-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                          </div>
                          <div>
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                            {user.isAdmin && (
                              <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                                <Shield className="w-3 h-3" /> Admin
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-neutral-600">{user.email}</td>
                      <td className="py-3 px-4 text-neutral-600">{user.phone || '-'}</td>
                      <td className="py-3 px-4 text-neutral-500">
                        {new Date(user.createdAt).toLocaleDateString('fr-CH')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                          user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {user.isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          {user.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleStatus(user._id, user.isActive)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            user.isActive
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {user.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500 text-sm">No users found</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200">
                <p className="text-sm text-neutral-500">{filtered.length} users</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 rounded-lg hover:bg-neutral-100 disabled:opacity-30">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium">{currentPage} / {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1 rounded-lg hover:bg-neutral-100 disabled:opacity-30">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

