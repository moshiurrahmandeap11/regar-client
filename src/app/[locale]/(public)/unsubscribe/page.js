import StaticInfoPage from '@/components/StaticInfoPage';

export default function UnsubscribePage() {
  return (
    <StaticInfoPage
      title="Desabonnement confirme"
      description="Vous ne recevrez plus les notifications marketing Regar."
      primaryLabel="Retour accueil"
      primaryHref="/"
      secondaryLabel="Re-s'abonner"
      secondaryHref="/"
    />
  );
}
