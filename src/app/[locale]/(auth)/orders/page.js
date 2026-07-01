'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FadeIn } from '@/components/animations';

export default function OrdersPage() {
  const locale = useLocale();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/login`);
    }
  }, [user, loading, router, locale]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full" /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h1 className="text-2xl font-bold text-neutral-900 mb-8">
            {locale === 'fr' ? 'Mes commandes' : 'My orders'}
          </h1>
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
            <p className="text-neutral-500">{locale === 'fr' ? 'Aucune commande pour le moment' : 'No orders yet'}</p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
