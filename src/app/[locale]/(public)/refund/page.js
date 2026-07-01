import StaticInfoPage from '@/components/StaticInfoPage';

export default function RefundPage() {
  return (
    <StaticInfoPage
      title="Retours et remboursements"
      description="Retour possible sous 14 jours pour produit non porte. Remboursement apres validation du retour."
      primaryLabel="Suivre ma commande"
      primaryHref="/track-order"
      secondaryLabel="FAQ"
      secondaryHref="/faq"
    />
  );
}
