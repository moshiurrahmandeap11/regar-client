"use client";

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Mail, Send, Trash, Users } from 'lucide-react';

export default function NewslettersContent() {
  const [list, setList] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [sending, setSending] = useState(false);
  const [showBulkPanel, setShowBulkPanel] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchList(); }, []);

  const fetchList = async () => {
    try {
      const [listRes, templateRes] = await Promise.all([
        api.get('/api/newsletters'),
        api.get('/api/newsletters/templates'),
      ]);

      const subscribers = Array.isArray(listRes.data) ? listRes.data : [];
      const templateList = Array.isArray(templateRes.data) ? templateRes.data : [];

      setList(subscribers);
      setTemplates(templateList);
      setSelectedIds([]);

      const defaultBulk = templateList.find((tpl) => tpl.type === 'BULK' && tpl.isDefault)
        || templateList.find((tpl) => tpl.type === 'BULK')
        || templateList[0];
      setSelectedTemplateId(defaultBulk?._id || '');
    } catch (err) {
      toast.error('Failed to load subscribers/templates');
    } finally { setLoading(false); }
  };

  const isSelected = (id) => selectedIds.includes(id);

  const toggleSelection = (id) => {
    if (isSelected(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
      return;
    }
    setSelectedIds([...selectedIds, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === list.length) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(list.map((item) => item._id));
  };

  const handleDelete = async (id) => {
    const confirmed = await new Promise((resolve) => {
      toast((t) => (
        <div className="space-y-2">
          <p className="text-sm">Delete this subscriber?</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded bg-neutral-900 text-white text-xs" onClick={() => { toast.dismiss(t.id); resolve(true); }}>Delete</button>
            <button className="px-3 py-1 rounded border text-xs" onClick={() => { toast.dismiss(t.id); resolve(false); }}>Cancel</button>
          </div>
        </div>
      ), { duration: 10000 });
    });
    if (!confirmed) return;
    try {
      await api.delete(`/api/newsletters/${id}`);
      toast.success('Deleted');
      setList(list.filter((i) => i._id !== id));
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } catch (err) { toast.error('Delete failed'); }
  };

  const handleBulkSend = async () => {
    if (!selectedTemplateId) {
      toast.error('Please choose an email template');
      return;
    }
    if (!selectedIds.length) {
      toast.error('Please select at least one recipient');
      return;
    }

    setSending(true);
    try {
      const res = await api.post('/api/newsletters/bulk-send', {
        templateId: selectedTemplateId,
        recipientIds: selectedIds,
      });

      const sent = res.data?.sent ?? 0;
      const total = res.data?.total ?? selectedIds.length;
      toast.success(`Bulk email sent: ${sent}/${total}`);
      setShowBulkPanel(false);
      setSelectedIds([]);
    } catch (err) {
      const message = err.response?.data?.message || 'Bulk send failed';
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="h-40 flex items-center justify-center">Loading...</div>;

  const selectedTemplate = templates.find((tpl) => tpl._id === selectedTemplateId);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold">Newsletter Subscribers</h2>
            <p className="text-sm text-neutral-500 mt-1">Select recipients, then send a template email in bulk.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleSelectAll}
              disabled={!list.length}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm hover:bg-neutral-50 disabled:opacity-40"
            >
              <Users className="w-4 h-4" />
              {selectedIds.length === list.length && list.length > 0 ? 'Unselect All' : 'Select All'}
            </button>
            <button
              onClick={() => setShowBulkPanel(!showBulkPanel)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-900 text-white text-sm hover:bg-neutral-800"
            >
              <Mail className="w-4 h-4" />
              Send Bulk Email
            </button>
          </div>
        </div>

        {showBulkPanel && (
          <div className="mb-5 rounded-xl border border-neutral-200 p-4 bg-neutral-50 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Email Template</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm"
              >
                <option value="">Choose template</option>
                {templates.map((tpl) => (
                  <option key={tpl._id} value={tpl._id}>
                    {tpl.name} ({tpl.type}){tpl.isDefault ? ' - default' : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedTemplate && (
              <div className="text-xs text-neutral-600 rounded-lg border bg-white p-3">
                <p><strong>Subject:</strong> {selectedTemplate.subject}</p>
                <p className="mt-1">Selected recipients: {selectedIds.length}</p>
              </div>
            )}

            <button
              onClick={handleBulkSend}
              disabled={sending || !selectedIds.length || !selectedTemplateId}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Sending...' : `Send to ${selectedIds.length || 0} recipient(s)`}
            </button>
          </div>
        )}

        {(!Array.isArray(list) || list.length === 0) ? (
          <p className="text-sm text-neutral-500">No subscribers yet.</p>
        ) : (
          <div className="divide-y">
            {list.map((item) => (
              <div key={item._id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected(item._id)}
                    onChange={() => toggleSelection(item._id)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">{item.email}</div>
                    <div className="text-xs text-neutral-500">{new Date(item.createdAt).toLocaleString()}</div>
                  </div>
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
