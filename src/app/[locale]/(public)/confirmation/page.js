import StaticInfoPage from '@/components/StaticInfoPage';

export default function ConfirmationPage() {
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
