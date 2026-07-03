'use client';

import { useState, useEffect } from 'react';
import { Upload, QrCode, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ManualPaymentForm({ order, locale, onDone }) {
  const [methods, setMethods] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [txId, setTxId] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingMethods, setLoadingMethods] = useState(true);

  const fr = locale === 'fr';

  useEffect(() => {
    api.get('/api/content/payment-methods')
      .then((res) => {
        const active = (Array.isArray(res.data) ? res.data : []).filter((m) => m.isActive !== false);
        setMethods(active);
        if (active.length > 0) setSelectedId(active[0]._id);
      })
      .catch(() => toast.error('Failed to load payment methods'))
      .finally(() => setLoadingMethods(false));
  }, []);

  const selectedMethod = methods.find((m) => m._id === selectedId);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setFilePreview(reader.result);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!txId.trim()) return toast.error(fr ? 'ID de transaction requis' : 'Transaction ID required');
    if (!selectedId) return toast.error(fr ? 'Choisissez une methode' : 'Select a payment method');

    const fd = new FormData();
    fd.append('orderId', order._id);
    fd.append('amount', order.total);
    fd.append('txId', txId.trim());
    fd.append('paymentMethodId', selectedId);
    fd.append('paymentMethodName', selectedMethod?.name || '');
    if (file) fd.append('proof', file);

    setSubmitting(true);
    try {
      await api.post('/api/payments/manual', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(fr ? 'Paiement soumis pour validation' : 'Payment submitted for review');
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.message || (fr ? 'Echec de soumission' : 'Submission failed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingMethods) {
    return (
      <div className="flex items-center justify-center h-24">
        <div className="animate-spin w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (methods.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700">
        {fr
          ? "Aucune methode de paiement disponible. Contactez l'administrateur."
          : 'No payment methods available. Please contact the administrator.'}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Method tabs */}
      <div>
        <p className="text-sm font-medium text-neutral-700 mb-2">
          {fr ? 'Choisir la methode' : 'Choose payment method'}
        </p>
        <div className="flex flex-wrap gap-2">
          {methods.map((m) => (
            <button
              key={m._id}
              type="button"
              onClick={() => setSelectedId(m._id)}
              className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                selectedId === m._id
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Selected method details */}
      {selectedMethod && (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 space-y-3">
          {/* QR code */}
          {selectedMethod.qrImage && (
            <div className="flex justify-center">
              <img
                src={selectedMethod.qrImage}
                alt={`${selectedMethod.name} QR`}
                className="w-40 h-40 object-contain rounded-xl border border-neutral-200 bg-white p-2"
              />
            </div>
          )}
          {/* Instructions */}
          {selectedMethod.description && (
            <p className="text-sm text-neutral-600 leading-relaxed text-center">
              {selectedMethod.description}
            </p>
          )}
          {/* Amount reminder */}
          <div className="text-center">
            <span className="inline-block px-4 py-1.5 rounded-xl bg-neutral-900 text-white text-sm font-bold">
              {fr ? 'Montant' : 'Amount'}: {Number(order.total).toFixed(2)} CHF
            </span>
          </div>
        </div>
      )}

      {/* Transaction ID */}
      <div>
        <label className="text-sm font-medium text-neutral-700 mb-1 block">
          {fr ? 'ID de transaction' : 'Transaction ID'} <span className="text-red-500">*</span>
        </label>
        <input
          value={txId}
          onChange={(e) => setTxId(e.target.value)}
          placeholder={fr ? 'Entrez votre ID de transaction' : 'Enter your transaction ID'}
          required
          className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
      </div>

      {/* Screenshot upload */}
      <div>
        <label className="text-sm font-medium text-neutral-700 mb-1 block">
          {fr ? 'Capture d\'ecran de paiement' : 'Payment screenshot'}
          <span className="text-neutral-400 font-normal ml-1">({fr ? 'optionnel' : 'optional'})</span>
        </label>

        {filePreview ? (
          <div className="relative inline-block">
            <img src={filePreview} alt="proof" className="w-32 h-32 object-cover rounded-xl border border-neutral-200" />
            <button
              type="button"
              onClick={() => { setFile(null); setFilePreview(''); }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-neutral-200 rounded-xl cursor-pointer hover:border-neutral-400 hover:bg-neutral-50 transition-colors">
            <Upload className="w-5 h-5 text-neutral-400" />
            <span className="text-sm text-neutral-500">
              {fr ? 'Cliquez pour uploader une image' : 'Click to upload an image'}
            </span>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 py-3 bg-neutral-900 text-white font-medium rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            {fr ? 'Envoi...' : 'Submitting...'}
          </span>
        ) : (
          <>
            <CheckCircle className="w-4 h-4" />
            {fr ? 'Soumettre le paiement' : 'Submit payment'}
          </>
        )}
      </button>
    </form>
  );
}
