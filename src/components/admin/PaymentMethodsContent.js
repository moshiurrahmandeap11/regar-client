'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Upload, QrCode, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL;

const emptyForm = { name: '', description: '', isActive: true, qrImageFile: null, qrImagePreview: '' };

export default function PaymentMethodsContent() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // subdoc _id
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => { fetchMethods(); }, []);

  const fetchMethods = async () => {
    try {
      const res = await fetch(`${API}/api/content/payment-methods`);
      const data = await res.json();
      setMethods(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, qrImageFile: file }));
    const reader = new FileReader();
    reader.onloadend = () => setForm((f) => ({ ...f, qrImagePreview: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('description', form.description.trim());
      fd.append('isActive', String(form.isActive));
      if (form.qrImageFile) fd.append('qrImage', form.qrImageFile);

      const url = editing
        ? `${API}/api/content/payment-methods/${editing}`
        : `${API}/api/content/payment-methods`;
      const method = editing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success(editing ? 'Updated' : 'Created');
      resetForm();
      fetchMethods();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (m) => {
    setEditing(m._id);
    setForm({ name: m.name, description: m.description || '', isActive: m.isActive !== false, qrImageFile: null, qrImagePreview: m.qrImage || '' });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const confirmed = await new Promise((resolve) => {
      toast((t) => (
        <div className="space-y-2">
          <p className="text-sm">Delete this payment method?</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded bg-neutral-900 text-white text-xs" onClick={() => { toast.dismiss(t.id); resolve(true); }}>Delete</button>
            <button className="px-3 py-1 rounded border text-xs" onClick={() => { toast.dismiss(t.id); resolve(false); }}>Cancel</button>
          </div>
        </div>
      ), { duration: 10000 });
    });
    if (!confirmed) return;
    try {
      const res = await fetch(`${API}/api/content/payment-methods/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Deleted');
      fetchMethods();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          Add payment methods that appear as tabs during manual checkout (PayPal, Payoneer, etc.)
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Add Method'}
        </motion.button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h3 className="text-base font-semibold mb-4">{editing ? 'Edit Payment Method' : 'New Payment Method'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1 block">Name <span className="text-red-500">*</span></label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="PayPal, Payoneer, Bank Transfer…"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        className="w-4 h-4 rounded border-neutral-300"
                      />
                      <span className="text-sm font-medium text-neutral-700">Active (visible at checkout)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1 block">Instructions / Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    placeholder="e.g. Send payment to payments@regar.ch and upload your screenshot."
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                  />
                </div>

                {/* QR upload */}
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-2 block">QR Code Image (optional)</label>
                  <div className="flex items-start gap-4">
                    <label className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50 transition-colors text-sm">
                      <Upload className="w-4 h-4 text-neutral-500" />
                      {form.qrImageFile ? form.qrImageFile.name : 'Choose image'}
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                    {form.qrImagePreview && (
                      <div className="relative">
                        <img src={form.qrImagePreview} alt="QR preview" className="w-20 h-20 rounded-xl border border-neutral-200 object-cover" />
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, qrImageFile: null, qrImagePreview: '' }))}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
                  </motion.button>
                  {editing && (
                    <button type="button" onClick={resetForm} className="px-6 py-2.5 border border-neutral-200 rounded-xl text-sm hover:bg-neutral-50">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : methods.length === 0 ? (
          <div className="p-8 text-center">
            <QrCode className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 text-sm">No payment methods yet. Add your first one above.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {methods.map((m) => (
              <div key={m._id} className="flex items-center gap-4 px-5 py-4">
                {/* QR thumbnail */}
                <div className="w-12 h-12 rounded-xl border border-neutral-200 bg-neutral-50 overflow-hidden shrink-0 flex items-center justify-center">
                  {m.qrImage ? (
                    <img src={m.qrImage} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <QrCode className="w-6 h-6 text-neutral-300" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-neutral-900 truncate">{m.name}</p>
                    {m.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-medium">
                        <CheckCircle className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-100 text-neutral-500 text-xs font-medium">
                        <XCircle className="w-3 h-3" /> Inactive
                      </span>
                    )}
                  </div>
                  {m.description && (
                    <p className="text-sm text-neutral-500 truncate mt-0.5">{m.description}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleEdit(m)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(m._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
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
