import LegalContentPage from '@/components/LegalContentPage';

export default function PrivacyPage() {
  const defaultContent = {
    fr: {
      title: 'Politique de confidentialite',
      description: 'Cette page couvre le traitement des donnees personnelles, cookies et droits RGPD.',
      primaryLabel: 'Conditions',
      primaryHref: '/terms',
      secondaryLabel: 'Contact',
      secondaryHref: '/contact',
    },
    en: {
      title: 'Privacy policy',
      description: 'This page covers personal data processing, cookies and privacy rights.',
      primaryLabel: 'Terms',
      primaryHref: '/terms',
      secondaryLabel: 'Contact',
      secondaryHref: '/contact',
    },
  };

  return (
    <LegalContentPage contentKey="legal_privacy" defaultContent={defaultContent} />
  );
}
