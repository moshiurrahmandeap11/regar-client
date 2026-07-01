import StaticInfoPage from '@/components/StaticInfoPage';

export default function TermsPage() {
  return (
    <StaticInfoPage
      title="Conditions generales"
      description="Les CGV, reglement du tirage et politique de confidentialite seront publies ici selon le modele Regar-site."
      primaryLabel="Politique retours"
      primaryHref="/refund"
      secondaryLabel="Contact"
      secondaryHref="/contact"
    />
  );
}
