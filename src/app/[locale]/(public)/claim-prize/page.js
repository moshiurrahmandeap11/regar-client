import StaticInfoPage from '@/components/StaticInfoPage';

export default function ClaimPrizePage() {
  return (
    <StaticInfoPage
      title="Reclamer votre prix"
      description="Depuis votre ticket gagnant, confirmez la reclamation puis suivez la livraison de votre lot."
      primaryLabel="Voir ticket"
      primaryHref="/ticket"
      secondaryLabel="Mes commandes"
      secondaryHref="/orders"
    />
  );
}
