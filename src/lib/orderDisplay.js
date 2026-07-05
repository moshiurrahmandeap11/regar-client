export const getOrderState = (order, locale = 'en') => {
  const paymentStatus = order?.paymentStatus || 'pending';
  const status = order?.status || 'awaiting_payment';

  if (paymentStatus === 'failed' || status === 'cancelled') {
    return {
      label: locale === 'fr' ? 'Annulee' : 'Cancelled',
      tone: 'bg-red-100 text-red-700',
    };
  }

  if (paymentStatus !== 'completed') {
    return {
      label: locale === 'fr' ? 'Paiement en attente' : 'Awaiting payment',
      tone: 'bg-amber-100 text-amber-700',
    };
  }

  const labels = {
    paid: locale === 'fr' ? 'Payee' : 'Paid',
    processing: locale === 'fr' ? 'En traitement' : 'Processing',
    shipped: locale === 'fr' ? 'Expediee' : 'Shipped',
    delivered: locale === 'fr' ? 'Livree' : 'Delivered',
    pending: locale === 'fr' ? 'Payee' : 'Paid',
    awaiting_payment: locale === 'fr' ? 'Payee' : 'Paid',
  };

  const tones = {
    paid: 'bg-emerald-100 text-emerald-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    pending: 'bg-emerald-100 text-emerald-700',
    awaiting_payment: 'bg-emerald-100 text-emerald-700',
  };

  return {
    label: labels[status] || status,
    tone: tones[status] || 'bg-neutral-100 text-neutral-700',
  };
};
