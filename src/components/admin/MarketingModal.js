'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Send, Users, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

/**
 * MarketingModal
 *
 * Props:
 *   open        — boolean, controls visibility
 *   onClose     — () => void
 *   itemName    — string, display name of the product / raffle
 *   itemUrl     — string, full public URL to include in the email
 */
export default function MarketingModal({ open, onClose, itemName = '', itemUrl = '' }) {
  const [templates, setTemplates] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [sending, setSending] = useState(false);

  // Fetch templates + subscriber count whenever modal opens
  useEffect(() => {
    if (!open) return;
    setLoadingData(true);

    Promise.all([
      api.get('/api/newsletters/templates'),
      api.get('/api/newsletters'),
    ])
      .then(([tplRes, subRes]) => {
        const tplList = Array.isArray(tplRes.data) ? tplRes.data : [];
        const subList = Array.isArray(subRes.data) ? subRes.data : [];
        setTemplates(tplList);
        setSubscribers(subList);

        // Pre-select the default BULK template, or first available
        const defaultTpl =
          tplList.find((t) => t.type === 'BULK' && t.isDefault) ||
          tplList.find((t) => t.type === 'BULK') ||
          tplList[0];
        setSelectedTemplateId(defaultTpl?._id || '');
      })
      .catch(() => toast.error('Failed to load templates / subscribers'))
      .finally(() => setLoadingData(false));
  }, [open]);

  const activeSubscriberCount = subscribers.filter((s) => s.isActive !== false).length;
  const selectedTemplate = templates.find((t) => t._id === selectedTemplateId);

  const handleSend = async () => {
    if (!selectedTemplateId) {
      toast.error('Please select an email template');
      return;
    }
    if (activeSubscriberCount === 0) {
      toast.error('No active subscribers to send to');
      return;
    }

    setSending(true);
    try {
      const res = await api.post('/api/newsletters/marketing-send', {
        templateId: selectedTemplateId,
        productName: itemName,
        productUrl: itemUrl,
      });

      const sent = res.data?.sent ?? 0;
      const total = res.data?.total ?? activeSubscriberCount;
      toast.success(`Marketing email sent: ${sent}/${total} subscribers`);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send marketing email';
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18 }}
            className="bg-white rounded-2xl shadow-xl border border-neutral-200 w-full max-w-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-neutral-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-neutral-600" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-neutral-900">Email Marketing</h2>
                  <p className="text-xs text-neutral-500 mt-0.5 truncate max-w-[220px]">{itemName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Subscriber count pill */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200">
                <Users className="w-4 h-4 text-neutral-500 shrink-0" />
                {loadingData ? (
                  <span className="text-sm text-neutral-400">Loading subscribers…</span>
                ) : (
                  <span className="text-sm text-neutral-700">
                    Will be sent to{' '}
                    <span className="font-semibold text-neutral-900">{activeSubscriberCount}</span>{' '}
                    active subscriber{activeSubscriberCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Product link preview */}
              {itemUrl && (
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5 block">
                    Product Link
                  </label>
                  <a
                    href={itemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors truncate"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                    <span className="truncate">{itemUrl}</span>
                  </a>
                  <p className="text-xs text-neutral-400 mt-1">
                    Use <code className="bg-neutral-100 px-1 rounded">{'{{productLink}}'}</code> or{' '}
                    <code className="bg-neutral-100 px-1 rounded">{'{{productUrl}}'}</code> in your template to embed this link.
                  </p>
                </div>
              )}

              {/* Template selector */}
              <div>
                <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5 block">
                  Email Template
                </label>
                {loadingData ? (
                  <div className="h-10 bg-neutral-100 rounded-xl animate-pulse" />
                ) : templates.length === 0 ? (
                  <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">
                    No templates found. Add one in Settings → Newsletter Templates.
                  </p>
                ) : (
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                  >
                    <option value="">Choose a template…</option>
                    {templates.map((tpl) => (
                      <option key={tpl._id} value={tpl._id}>
                        {tpl.name} ({tpl.type}){tpl.isDefault ? ' — default' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Template preview */}
              {selectedTemplate && (
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 space-y-1">
                  <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide">Preview</p>
                  <p className="text-sm text-neutral-800">
                    <span className="text-neutral-500">Subject: </span>
                    {selectedTemplate.subject}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100">
              <button
                onClick={onClose}
                disabled={sending}
                className="px-4 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || loadingData || !selectedTemplateId || activeSubscriberCount === 0}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {sending ? 'Sending…' : `Send to ${activeSubscriberCount} subscriber${activeSubscriberCount !== 1 ? 's' : ''}`}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
