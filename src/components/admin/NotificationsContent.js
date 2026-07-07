'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function NotificationsContent() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const sendNotification = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in subject and message');
      return;
    }
    setSending(true);
    try {
      await api.post('/api/notifications/send', {
        title: subject.trim(),
        message: message.trim(),
      });
      toast.success('Notification sent to all users');
      setSubject('');
      setMessage('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
      <h2 className="text-lg font-semibold mb-4">Send Notification</h2>
      <div className="space-y-3 max-w-2xl">
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message"
          rows={5}
          className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
        />
        <button
          onClick={sendNotification}
          disabled={sending}
          className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? 'Sending...' : 'Send Notification'}
        </button>
      </div>
    </div>
  );
}
