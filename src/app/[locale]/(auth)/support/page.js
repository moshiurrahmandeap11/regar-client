'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, Clock, CheckCircle2, AlertCircle,
  XCircle, ChevronDown, Plus, ArrowLeft, User, HelpCircle,
  Inbox, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const statusConfig = {
  open: { label: 'Open', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  closed: { label: 'Closed', color: 'bg-neutral-100 text-neutral-600', icon: XCircle },
};

const categories = [
  { value: 'order', label: 'Order Issue' },
  { value: 'payment', label: 'Payment Problem' },
  { value: 'product', label: 'Product Question' },
  { value: 'account', label: 'Account Help' },
  { value: 'other', label: 'Other' },
];

export default function UserSupportPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', message: '', category: 'other' });
  const [creating, setCreating] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { fetchTickets(); }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedTicket?.replies?.length]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/support/my');
      setTickets(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      toast.error('Subject and message are required');
      return;
    }
    try {
      setCreating(true);
      const res = await api.post('/api/support', newTicket);
      setTickets(prev => [res.data, ...prev]);
      setShowNewForm(false);
      setNewTicket({ subject: '', message: '', category: 'other' });
      toast.success('Ticket created successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    } finally {
      setCreating(false);
    }
  };

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
      setTickets(prev => prev.map(t => t._id === res.data._id ? res.data : t));
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Ticket detail view
  if (selectedTicket) {
    const status = statusConfig[selectedTicket.status] || statusConfig.open;
    const StatusIcon = status.icon;

    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-white rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-neutral-600" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold truncate">{selectedTicket.subject}</h1>
              <p className="text-xs text-neutral-500">{selectedTicket.ticketNumber}</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${status.color}`}>
              <StatusIcon className="w-3.5 h-3.5" /> {status.label}
            </span>
          </div>

          {/* Conversation */}
          <div className="bg-white rounded-2xl border shadow-sm flex flex-col" style={{ minHeight: '400px' }}>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Original message */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-amber-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">You</span>
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
                    className="flex gap-3"
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
                          {isAdmin ? 'Support Team' : 'You'}
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
            {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
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
            )}

            {(selectedTicket.status === 'closed' || selectedTicket.status === 'resolved') && (
              <div className="p-4 border-t text-center">
                <p className="text-sm text-neutral-500">This ticket is {selectedTicket.status}. You can create a new ticket if you need further assistance.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // New ticket form
  if (showNewForm) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setShowNewForm(false)} className="p-2 hover:bg-white rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-neutral-600" />
            </button>
            <h1 className="text-lg font-semibold">New Support Ticket</h1>
          </div>

          <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setNewTicket(prev => ({ ...prev, category: cat.value }))}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      newTicket.category === cat.value
                        ? 'border-[#b88238] bg-[#b88238]/10 text-[#b88238]'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Subject</label>
              <input
                type="text"
                value={newTicket.subject}
                onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Brief summary of your issue"
                className="w-full px-4 py-2.5 bg-neutral-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#b88238]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Message</label>
              <textarea
                value={newTicket.message}
                onChange={(e) => setNewTicket(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Describe your issue in detail..."
                rows={6}
                className="w-full px-4 py-3 bg-neutral-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#b88238]/20 resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowNewForm(false)}
                className="px-5 py-2.5 border rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createTicket}
                disabled={creating || !newTicket.subject.trim() || !newTicket.message.trim()}
                className="px-5 py-2.5 bg-[#b88238] hover:bg-[#a07030] disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Ticket list
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Support Center</h1>
            <p className="text-sm text-neutral-500 mt-0.5">{tickets.length} tickets</p>
          </div>
          <button
            onClick={() => setShowNewForm(true)}
            className="px-4 py-2.5 bg-[#b88238] hover:bg-[#a07030] text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Ticket
          </button>
        </div>

        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-[#b88238] border-t-transparent rounded-full" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-2xl border shadow-sm py-16 text-center">
            <HelpCircle className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-base font-medium text-neutral-700 mb-1">No tickets yet</h3>
            <p className="text-sm text-neutral-500 mb-4">Create a ticket if you need help with anything</p>
            <button
              onClick={() => setShowNewForm(true)}
              className="px-4 py-2.5 bg-[#b88238] hover:bg-[#a07030] text-white rounded-xl text-sm font-medium transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Ticket
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => {
              const status = statusConfig[ticket.status] || statusConfig.open;
              const StatusIcon = status.icon;
              const lastReply = ticket.replies?.[ticket.replies.length - 1];
              const hasAdminReply = ticket.replies?.some(r => r.sender === 'admin');

              return (
                <button
                  key={ticket._id}
                  onClick={() => openTicket(ticket)}
                  className="w-full text-left bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${hasAdminReply ? 'bg-[#b88238]/10' : 'bg-neutral-100'}`}>
                      <MessageSquare className={`w-4 h-4 ${hasAdminReply ? 'text-[#b88238]' : 'text-neutral-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">{ticket.subject}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${status.color}`}>
                          <StatusIcon className="w-3 h-3" /> {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 truncate">
                        {lastReply?.message || ticket.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
                        <span>{ticket.ticketNumber}</span>
                        <span>·</span>
                        <span>{formatDate(ticket.lastReplyAt)}</span>
                        <span>·</span>
                        <span>{ticket.replies?.length || 0} messages</span>
                      </div>
                    </div>
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
