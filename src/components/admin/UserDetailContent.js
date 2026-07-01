'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, Mail, Phone, MapPin, Calendar, Shield, Ticket, ShoppingBag, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserDetailContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    const load = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API}/api/auth/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.message || 'Failed to load user details');
        setData(payload);
      } catch (error) {
        toast.error(error.message || 'Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [API, token, userId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <p className="text-sm text-neutral-500">No user id provided.</p>
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <p className="text-sm text-neutral-500">User details not found.</p>
      </div>
    );
  }

  const { user, stats, orders, tickets, winners } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/users" className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900">
          <ChevronLeft className="w-4 h-4" /> Back to users
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">{user.firstName} {user.lastName}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-neutral-600">
              <span className="inline-flex items-center gap-1"><Mail className="w-4 h-4" /> {user.email}</span>
              <span className="inline-flex items-center gap-1"><Phone className="w-4 h-4" /> {user.phone || '-'}</span>
              <span className="inline-flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(user.createdAt).toLocaleString('fr-CH')}</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {user.isActive ? 'Active' : 'Suspended'}
              </span>
              {user.isAdmin ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-amber-100 text-amber-700">
                  <Shield className="w-3 h-3" /> Admin
                </span>
              ) : null}
              <span className="inline-flex px-2 py-1 rounded-lg text-xs font-medium bg-neutral-100 text-neutral-700">
                Age verified: {user.ageVerified ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl border border-neutral-200 p-4">
            <p className="font-medium mb-2 inline-flex items-center gap-1"><MapPin className="w-4 h-4" /> Address</p>
            <p>{user.address?.street || '-'}</p>
            <p>{user.address?.city || '-'} {user.address?.zip || ''}</p>
            <p>{user.address?.country || '-'}</p>
          </div>
          <div className="rounded-xl border border-neutral-200 p-4">
            <p className="font-medium mb-2">Preferences</p>
            <p>Language: {user.preferences?.language || 'fr'}</p>
            <p>Newsletter: {user.preferences?.newsletter ? 'Subscribed' : 'Not subscribed'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500">Orders</p>
          <p className="text-xl font-semibold mt-1">{stats?.orders || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500">Spent</p>
          <p className="text-xl font-semibold mt-1">{(stats?.spent || 0).toFixed(2)} CHF</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500">Tickets</p>
          <p className="text-xl font-semibold mt-1">{stats?.tickets || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500">Active Tickets</p>
          <p className="text-xl font-semibold mt-1">{stats?.activeTickets || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500">Wins</p>
          <p className="text-xl font-semibold mt-1">{stats?.wins || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold inline-flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Recent Orders</h3>
        {orders?.length ? (
          <div className="mt-4 space-y-2">
            {orders.map((order) => (
              <div key={order._id} className="rounded-lg border border-neutral-200 p-3 text-sm">
                <p className="font-medium">{order.orderNumber}</p>
                <p className="text-neutral-600 mt-1">{order.total?.toFixed(2)} CHF • {order.status} • {new Date(order.createdAt).toLocaleDateString('fr-CH')}</p>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-neutral-500 mt-3">No orders found.</p>}
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold inline-flex items-center gap-2"><Ticket className="w-4 h-4" /> Recent Tickets</h3>
        {tickets?.length ? (
          <div className="mt-4 space-y-2">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="rounded-lg border border-neutral-200 p-3 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-mono font-medium">{ticket.ticketNumber}</p>
                  <p className="text-neutral-600 mt-1">{ticket.order?.orderNumber || '-'} • {ticket.raffle?.name || 'Raffle pending'}</p>
                </div>
                <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${ticket.isWinner ? 'bg-amber-100 text-amber-700' : 'bg-neutral-100 text-neutral-700'}`}>
                  {ticket.isWinner ? 'Winner' : 'Active'}
                </span>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-neutral-500 mt-3">No tickets found.</p>}
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold inline-flex items-center gap-2"><Trophy className="w-4 h-4" /> Winner History</h3>
        {winners?.length ? (
          <div className="mt-4 space-y-2">
            {winners.map((winner) => (
              <div key={winner._id} className="rounded-lg border border-neutral-200 p-3 text-sm">
                <p className="font-medium">{winner.prize}</p>
                <p className="text-neutral-600 mt-1">Ticket: {winner.ticket?.ticketNumber || '-'} • {winner.raffle?.name || '-'}</p>
                <p className="text-neutral-600 mt-1">Status: {winner.claimStatus}</p>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-neutral-500 mt-3">No wins recorded.</p>}
      </div>
    </div>
  );
}
