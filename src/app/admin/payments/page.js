'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import PaymentsContent from '@/components/admin/PaymentsContent';
import PaymentMethodsContent from '@/components/admin/PaymentMethodsContent';

export default function AdminPaymentsPage() {
  const [tab, setTab] = useState('transactions');

  return (
    <AdminLayout>
      {/* Tab bar */}
      <div className="flex gap-2 mb-6 border-b border-neutral-200 pb-0">
        {[
          { id: 'transactions', label: 'Transactions' },
          { id: 'methods', label: 'Payment Methods' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.id
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'transactions' ? <PaymentsContent /> : <PaymentMethodsContent />}
    </AdminLayout>
  );
}
