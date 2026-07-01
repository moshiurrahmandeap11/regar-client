import StaticInfoPage from '@/components/StaticInfoPage';

export default function ComingSoonPage() {
  return (
    <StaticInfoPage
      title="Bientot disponible"
      description="Le prochain raffle sera publie tres prochainement."
      primaryLabel="Voir les produits"
      primaryHref="/products"
      secondaryLabel="Retour a l'accueil"
      secondaryHref="/"
    />
  );
}
