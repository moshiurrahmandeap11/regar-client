'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function NotificationsContent() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const sendNotification = () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in subject and message');
      return;
    }
    toast.success('Notification module ready. Connect provider for sending.');
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
      <h2 className="text-lg font-semibold mb-4">Notifications</h2>
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
          className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-sm"
        >
          Send Notification
        </button>
      </div>
    </div>
  );
}
