"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import StaticInfoPage from '@/components/StaticInfoPage';
import { useCart } from '@/contexts/CartContext';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      clearCart();
    }
  }, [sessionId, clearCart]);

  return (
    <StaticInfoPage
      title="Commande confirmee"
      description="Votre commande a ete validee et vos tickets de tirage ont ete generes."
      primaryLabel="Mes commandes"
      primaryHref="/orders"
      secondaryLabel="Voir ticket"
      secondaryHref="/ticket"
    />
  );
}
