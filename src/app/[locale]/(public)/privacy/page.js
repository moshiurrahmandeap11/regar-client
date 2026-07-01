import StaticInfoPage from '@/components/StaticInfoPage';

export default function PrivacyPage() {
  return (
    <StaticInfoPage
      title="Politique de confidentialite"
      description="Cette page couvre le traitement des donnees personnelles, cookies et droits RGPD."
      primaryLabel="Conditions"
      primaryHref="/terms"
      secondaryLabel="Contact"
      secondaryHref="/contact"
    />
  );
}
