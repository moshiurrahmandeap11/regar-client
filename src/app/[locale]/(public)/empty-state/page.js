import StaticInfoPage from '@/components/StaticInfoPage';

export default function EmptyStatePage() {
  return (
    <StaticInfoPage
      title="Aucune entree active"
      description="Vous n'avez pas encore de ticket actif. Achetez une casquette pour participer au prochain tirage."
      primaryLabel="Voir produits"
      primaryHref="/products"
      secondaryLabel="Voir raffles"
      secondaryHref="/raffles"
    />
  );
}
