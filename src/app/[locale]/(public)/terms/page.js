import LegalContentPage from '@/components/LegalContentPage';

export default function TermsPage() {
  const defaultContent = {
    fr: {
      title: 'Conditions Générales de Vente et d’Utilisation',
      lastUpdated: 'Mars 2025',
      summary: 'Veuillez lire attentivement nos conditions. En achetant une casquette Regar ou en participant à nos tirages au sort, vous acceptez l’ensemble de ces dispositions.',
      sections: [
        {
          title: '1. Éligibilité et Inscription',
          content: 'Pour acheter nos casquettes et participer aux tirages au sort associés, vous devez être âgé d’au moins 18 ans ou avoir la majorité légale dans votre pays. Vous devez vous assurer que les informations de livraison et de contact fournies lors de votre commande sont exactes et complètes.',
        },
        {
          title: '2. Achat de Casquettes et Entrée au Tirage',
          content: 'Tout achat d’une casquette de la collection Regar donne droit à une participation gratuite et automatique au tirage au sort lié à cette édition. Aucun frais supplémentaire n’est requis pour participer au concours. Tous les prix sont indiqués en Euros (EUR) toutes taxes comprises.',
        },
        {
          title: '3. Déroulement et Transparence du Tirage',
          content: 'Les tirages au sort sont réalisés en toute impartialité grâce à un système certifié de génération de nombres aléatoires à la fin du compte à rebours de l’édition ou dès l’allocation complète des stocks. Les résultats sont vérifiés et sans appel.',
        },
        {
          title: '4. Notification et Attribution des Lots',
          content: 'Les gagnants sont avertis par e-mail et téléphone dans les 48 heures suivant la clôture du tirage. En cas de non-réponse sous 14 jours calendaires, Regar se réserve le droit de procéder à un nouveau tirage pour désigner un bénéficiaire alternatif.',
        },
        {
          title: '5. Limitation de Responsabilité',
          content: 'Regar ne saurait être tenu responsable des retards d’acheminement postal, des perturbations techniques du réseau ou de tout événement de force majeure indépendant de sa volonté.',
        },
      ],
      primaryLabel: 'Politique de retours',
      primaryHref: '/refund',
      secondaryLabel: 'Nous contacter',
      secondaryHref: '/contact',
    },
    en: {
      title: 'Terms & Conditions',
      lastUpdated: 'March 2025',
      summary: 'Please review these terms carefully. By purchasing premium Regar caps or entering our raffle competitions, you acknowledge and agree to these terms.',
      sections: [
        {
          title: '1. Eligibility & Account',
          content: 'To purchase products and participate in associated raffles on Regar, you must be at least 18 years of age or the age of legal majority in your country of residence. You are responsible for ensuring that all registration and shipping details provided during checkout are accurate and complete.',
        },
        {
          title: '2. Cap Purchases & Automatic Raffle Entry',
          content: 'Each eligible purchase of a Regar branded cap automatically includes a complimentary entry into the promotional raffle draw linked to that product collection. No separate fee is charged for raffle entries. All sales are processed in Euros (EUR) or specified local currency.',
        },
        {
          title: '3. Fair Play & Draw Mechanism',
          content: 'Raffle competitions are conducted with complete transparency. Winners are drawn randomly via a cryptographically secure random number generator once the countdown timer expires or the drop allocation is completed. Results are final and audited.',
        },
        {
          title: '4. Winner Notification & Prize Claim',
          content: 'Winners will be contacted via the email address and phone number provided at checkout within 48 hours of draw completion. If a winner fails to respond within 14 calendar days, Regar reserves the right to conduct a redraw to select an alternate winner.',
        },
        {
          title: '5. Limitation of Liability',
          content: 'Regar shall not be liable for any indirect, incidental, or consequential damages resulting from website downtime, carrier delays, or technical issues beyond our reasonable control.',
        },
      ],
      primaryLabel: 'Refund Policy',
      primaryHref: '/refund',
      secondaryLabel: 'Contact Support',
      secondaryHref: '/contact',
    },
  };

  return (
    <LegalContentPage contentKey="legal_terms" defaultContent={defaultContent} />
  );
}
