'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Search, Filter, ChevronDown, Clock, CheckCircle2,
  AlertCircle, XCircle, User, Send, ArrowLeft, Mail, Tag,
  MoreHorizontal, RefreshCw, Inbox
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const statusConfig = {
  open: { label: 'Open', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  closed: { label: 'Closed', color: 'bg-neutral-100 text-neutral-600', icon: XCircle },
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-neutral-100 text-neutral-600' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700' },
  high: { label: 'High', color: 'bg-red-100 text-red-700' },
};

const categoryLabels = {
  order: 'Order', payment: 'Payment', product: 'Product', account: 'Account', other: 'Other',
};

export default function SupportContent() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { fetchTickets(); }, [statusFilter]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedTicket?.replies?.length]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await api.get(`/api/support/all${query}`);
      setTickets(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const q = search.toLowerCase();
    return (
      t.ticketNumber?.toLowerCase().includes(q) ||
      t.subject?.toLowerCase().includes(q) ||
      t.user?.firstName?.toLowerCase().includes(q) ||
      t.user?.lastName?.toLowerCase().includes(q) ||
      t.user?.email?.toLowerCase().includes(q)
    );
  });

  const openTicket = async (ticket) => {
    try {
      const res = await api.get(`/api/support/${ticket._id}`);
      setSelectedTicket(res.data);
      setReplyText('');
    } catch (error) {
      toast.error('Failed to load ticket');
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    try {
      setSending(true);
      const res = await api.post(`/api/support/${selectedTicket._id}/reply`, { message: replyText.trim() });
      setSelectedTicket(res.data);
      setReplyText('');
      // Update in list
      setTickets(prev => prev.map(t => t._id === res.data._id ? res.data : t));
      toast.success('Reply sent');
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const changeStatus = async (status) => {
    if (!selectedTicket) return;
    try {
      setUpdatingStatus(true);
      const res = await api.patch(`/api/support/${selectedTicket._id}/status`, { status });
      setSelectedTicket(res.data);
      setTickets(prev => prev.map(t => t._id === res.data._id ? res.data : t));
      toast.success(`Status updated to ${statusConfig[status]?.label || status}`);
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (selectedTicket) {
    const status = statusConfig[selectedTicket.status] || statusConfig.open;
    const StatusIcon = status.icon;

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold truncate">{selectedTicket.subject}</h2>
            <p className="text-xs text-neutral-500">{selectedTicket.ticketNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${status.color}`}>
              <StatusIcon className="w-3.5 h-3.5" /> {status.label}
            </span>
            {/* Status dropdown */}
            <div className="relative group">
              <button className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500">
                <MoreHorizontal className="w-4 h-4" />
              </button>
              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl border border-neutral-200 shadow-lg z-20 hidden group-hover:block">
                {Object.entries(statusConfig).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => changeStatus(key)}
                    disabled={updatingStatus || selectedTicket.status === key}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 flex items-center gap-2 ${selectedTicket.status === key ? 'opacity-50' : ''}`}
                  >
                    <cfg.icon className="w-4 h-4" /> {cfg.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Conversation */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border flex flex-col" style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Original message */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-amber-700" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{selectedTicket.user?.firstName} {selectedTicket.user?.lastName}</span>
                      <span className="text-xs text-neutral-400">{formatDate(selectedTicket.createdAt)}</span>
                    </div>
                    <div className="bg-neutral-50 rounded-xl rounded-tl-none px-4 py-3 text-sm text-neutral-700">
                      {selectedTicket.message}
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {selectedTicket.replies?.slice(1).map((reply, idx) => {
                  const isAdmin = reply.sender === 'admin';
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${isAdmin ? 'flex-row' : 'flex-row'}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isAdmin ? 'bg-[#b88238]' : 'bg-amber-100'}`}>
                        {isAdmin ? (
                          <MessageSquare className="w-4 h-4 text-white" />
                        ) : (
                          <User className="w-4 h-4 text-amber-700" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {isAdmin ? 'Support Team' : `${selectedTicket.user?.firstName} ${selectedTicket.user?.lastName}`}
                          </span>
                          <span className="text-xs text-neutral-400">{formatDate(reply.createdAt)}</span>
                          {isAdmin && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-[#b88238]/10 text-[#b88238] rounded font-medium">Admin</span>
                          )}
                        </div>
                        <div className={`rounded-xl rounded-tl-none px-4 py-3 text-sm ${isAdmin ? 'bg-[#b88238]/10 text-neutral-800' : 'bg-neutral-50 text-neutral-700'}`}>
                          {reply.message}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Reply input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                    placeholder="Type your reply..."
                    className="flex-1 bg-neutral-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#b88238]/20 resize-none"
                    rows={2}
                  />
                  <button
                    onClick={sendReply}
                    disabled={!replyText.trim() || sending}
                    className="px-4 py-2 bg-[#b88238] hover:bg-[#a07030] disabled:opacity-50 text-white rounded-xl font-medium text-sm flex items-center gap-2 transition-colors self-end"
                  >
                    <Send className="w-4 h-4" />
                    {sending ? '...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar info */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border p-5">
              <h3 className="text-sm font-semibold mb-4">Customer Info</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden">
                    {selectedTicket.user?.avatar ? (
                      <img src={selectedTicket.user.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-medium text-neutral-600">
                        {selectedTicket.user?.firstName?.[0]}{selectedTicket.user?.lastName?.[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{selectedTicket.user?.firstName} {selectedTicket.user?.lastName}</p>
                    <p className="text-xs text-neutral-500">{selectedTicket.user?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-5">
              <h3 className="text-sm font-semibold mb-4">Ticket Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Category</span>
                  <span className="font-medium">{categoryLabels[selectedTicket.category] || 'Other'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Priority</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityConfig[selectedTicket.priority]?.color || priorityConfig.medium.color}`}>
                    {priorityConfig[selectedTicket.priority]?.label || 'Medium'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Created</span>
                  <span>{formatDate(selectedTicket.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Last Reply</span>
                  <span>{formatDate(selectedTicket.lastReplyAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Replies</span>
                  <span>{selectedTicket.replies?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Support Tickets</h2>
          <p className="text-sm text-neutral-500">{tickets.length} total tickets</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchTickets} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#b88238]/20"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#b88238]/20 appearance-none pr-10"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        </div>
      </div>

      {/* Tickets list */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-[#b88238] border-t-transparent rounded-full" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-16 text-center">
            <Inbox className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 text-sm">No tickets found</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredTickets.map((ticket) => {
              const status = statusConfig[ticket.status] || statusConfig.open;
              const StatusIcon = status.icon;
              const lastReply = ticket.replies?.[ticket.replies.length - 1];
              const isUnread = ticket.status === 'open' && lastReply?.sender === 'user';

              return (
                <button
                  key={ticket._id}
                  onClick={() => openTicket(ticket)}
                  className="w-full text-left px-5 py-4 hover:bg-neutral-50 transition-colors flex items-start gap-4"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isUnread ? 'bg-amber-100' : 'bg-neutral-100'}`}>
                    {ticket.user?.avatar ? (
                      <img src={ticket.user.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-sm font-medium text-neutral-600">
                        {ticket.user?.firstName?.[0]}{ticket.user?.lastName?.[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-sm truncate">{ticket.subject}</span>
                      {isUnread && (
                        <span className="w-2 h-2 bg-amber-500 rounded-full shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 truncate">
                      {lastReply?.message || ticket.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${status.color}`}>
                        <StatusIcon className="w-3 h-3" /> {status.label}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {ticket.user?.firstName} {ticket.user?.lastName} · {formatDate(ticket.lastReplyAt)}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-neutral-400 font-medium shrink-0">
                    {ticket.ticketNumber}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
