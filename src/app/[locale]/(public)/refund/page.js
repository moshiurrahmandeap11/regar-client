import LegalContentPage from '@/components/LegalContentPage';

export default function RefundPage() {
  const defaultContent = {
    fr: {
      title: 'Retours et remboursements',
      description: 'Retour possible sous 14 jours pour produit non porte. Remboursement apres validation du retour.',
      primaryLabel: 'Suivre ma commande',
      primaryHref: '/track-order',
      secondaryLabel: 'FAQ',
      secondaryHref: '/faq',
    },
    en: {
      title: 'Returns and refunds',
      description: 'Returns are possible within 14 days for unworn products. Refund is processed after validation.',
      primaryLabel: 'Track my order',
      primaryHref: '/track-order',
      secondaryLabel: 'FAQ',
      secondaryHref: '/faq',
    },
  };

  return (
    <LegalContentPage contentKey="legal_refund" defaultContent={defaultContent} />
  );
}
