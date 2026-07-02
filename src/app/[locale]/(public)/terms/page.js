import LegalContentPage from '@/components/LegalContentPage';

export default function TermsPage() {
  const defaultContent = {
    fr: {
      title: 'Conditions generales',
      description: 'Les CGV, reglement du tirage et politique de confidentialite seront publies ici selon le modele Regar-site.',
      primaryLabel: 'Politique retours',
      primaryHref: '/refund',
      secondaryLabel: 'Contact',
      secondaryHref: '/contact',
    },
    en: {
      title: 'Terms and conditions',
      description: 'Terms of sale, raffle rules and legal information are published here.',
      primaryLabel: 'Refund policy',
      primaryHref: '/refund',
      secondaryLabel: 'Contact',
      secondaryHref: '/contact',
    },
  };

  return (
    <LegalContentPage contentKey="legal_terms" defaultContent={defaultContent} />
  );
}
