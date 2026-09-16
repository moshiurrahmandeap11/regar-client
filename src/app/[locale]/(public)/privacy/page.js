import LegalContentPage from '@/components/LegalContentPage';

export default function PrivacyPage() {
  const defaultContent = {
    fr: {
      title: 'Politique de Confidentialité',
      lastUpdated: 'Mars 2025',
      summary: 'Votre confiance est primordiale. Cette politique détaille la collecte, la protection et l’utilisation de vos données personnelles conformément au RGPD.',
      sections: [
        {
          title: '1. Données Personnelles Collectées',
          content: 'Nous recueillons uniquement les informations nécessaires au traitement de vos commandes et au bon déroulement des tirages au sort : nom, prénom, adresse postale, adresse e-mail, numéro de téléphone et historique des transactions.',
        },
        {
          title: '2. Finalités et Utilisation',
          content: 'Vos données sont strictement traitées afin de : (a) expédier vos casquettes commandées ; (b) valider et comptabiliser vos entrées aux tirages au sort ; (c) contacter les gagnants des tirages ; (d) vous transmettre les notifications de suivi de commande ; et (e) lutter contre les tentatives de fraude.',
        },
        {
          title: '3. Sécurité des Paiements Bancaires',
          content: 'Toutes les transactions bancaires sont chiffrées via des protocoles SSL et traitées par des prestataires de paiement certifiés PCI-DSS (ex: Stripe, Apple Pay). Regar ne conserve à aucun moment vos coordonnées bancaires complètes sur ses serveurs.',
        },
        {
          title: '4. Cookies et Traceurs',
          content: 'Nous utilisons des cookies strictement nécessaires au fonctionnement de votre panier et de votre session. Des traceurs d’audience anonymes nous permettent d’améliorer l’ergonomie du site. Vous pouvez à tout moment configurer vos préférences via votre navigateur.',
        },
        {
          title: '5. Vos Droits (RGPD)',
          content: 'Conformément au Règlement Général sur la Protection des Données (RGPD), vous bénéficiez d’un droit d’accès, de rectification, de portabilité et de suppression de vos données personnelles. Vous pouvez faire valoir ces droits en écrivant à privacy@regar.com.',
        },
      ],
      primaryLabel: 'Conditions Générales',
      primaryHref: '/terms',
      secondaryLabel: 'Support Client',
      secondaryHref: '/contact',
    },
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'March 2025',
      summary: 'We value your trust. This Privacy Policy outlines how Regar collects, safeguards, and processes your personal data in strict adherence to GDPR guidelines.',
      sections: [
        {
          title: '1. Information We Collect',
          content: 'We collect information you provide directly to us when creating an account, ordering a cap, or subscribing to our updates. This includes your name, shipping address, email address, phone number, and order history.',
        },
        {
          title: '2. Purpose of Data Processing',
          content: 'Your personal data is used solely to: (a) fulfill and deliver your cap orders; (b) record and verify your raffle entries; (c) communicate winner announcements; (d) send shipment tracking notifications and customer support responses; and (e) prevent fraudulent transactions.',
        },
        {
          title: '3. Payment Data & Security',
          content: 'All online transactions are encrypted and processed by industry-leading, PCI-DSS compliant payment gateways (e.g. Stripe, Apple Pay). Regar never stores your complete credit card numbers or sensitive payment credentials on our servers.',
        },
        {
          title: '4. Cookies & Preferences',
          content: 'We employ essential cookies necessary for checkout functionality and shopping cart persistence. Optional analytics cookies assist us in diagnosing speed and performance. You can manage cookie permissions at any time in your browser settings.',
        },
        {
          title: '5. Your Rights Under GDPR',
          content: 'Under the General Data Protection Regulation, you hold the right to access, rectify, export, or request full deletion of your personal records at any time. To exercise these rights, please contact our Data Protection team at privacy@regar.com.',
        },
      ],
      primaryLabel: 'Terms of Service',
      primaryHref: '/terms',
      secondaryLabel: 'Contact Support',
      secondaryHref: '/contact',
    },
  };

  return (
    <LegalContentPage contentKey="legal_privacy" defaultContent={defaultContent} />
  );
}
