import LegalContentPage from '@/components/LegalContentPage';

export default function RefundPage() {
  const defaultContent = {
    fr: {
      title: 'Politique de Retours et Remboursements',
      lastUpdated: 'Mars 2025',
      summary: 'Nous nous engageons sur l’excellence et la qualité de chaque casquette Regar. Découvrez ci-dessous nos modalités complètes de retour sous 14 jours.',
      sections: [
        {
          title: '1. Droit de Rétractation sous 14 Jours',
          content: 'Conformément aux lois sur la protection des consommateurs, vous bénéficiez d’un délai de 14 jours calendaires à compter de la réception de votre colis pour demander un retour ou un échange sans avoir à justifier de motif.',
        },
        {
          title: '2. Conditions d’Acceptation du Retour',
          content: 'Pour être éligible à un remboursement intégral, la casquette doit être retournée dans son état neuf d’origine : non portée, non lavée, sans trace d’usage, dans son emballage d’origine avec toutes ses étiquettes et housses de protection.',
        },
        {
          title: '3. Précision sur les Tirages au Sort',
          content: 'L’achat d’une casquette vous donne accès au tirage au sort lié à l’édition. Si vous effectuez un retour produit avant la réalisation du tirage, votre demande est traitée normalement. Toutefois, une fois le tirage officiel clôturé et les gagnants désignés, la participation au concours est réputée consommée et ne peut faire l’objet d’une annulation rétroactive, bien que le retour physique de l’article soit honoré selon les conditions en vigueur.',
        },
        {
          title: '4. Procédure pour Effectuer un Retour',
          content: 'Pour entamer une démarche de retour, connectez-vous à la page « Suivre ma commande » ou contactez notre support par e-mail à support@regar.com en mentionnant votre numéro de commande. Notre équipe vous fournira l’adresse de retour et votre bon de réexpédition sous 24h.',
        },
        {
          title: '5. Traitement et Délais de Remboursement',
          content: 'À réception du colis dans notre centre logistique et après validation du contrôle qualité, le remboursement est automatiquement déclenché sous 5 à 10 jours ouvrés sur le mode de paiement utilisé lors de votre achat.',
        },
      ],
      primaryLabel: 'Suivre ma commande',
      primaryHref: '/track-order',
      secondaryLabel: 'Consulter la FAQ',
      secondaryHref: '/faq',
    },
    en: {
      title: 'Returns & Refunds Policy',
      lastUpdated: 'March 2025',
      summary: 'We are committed to the craftsmanship and quality of every Regar cap. Review our streamlined 14-day return and refund procedures below.',
      sections: [
        {
          title: '1. 14-Day Return Guarantee',
          content: 'Under applicable consumer protection regulations, you are entitled to return your purchase within 14 calendar days from the date of package delivery, without giving any specific reason.',
        },
        {
          title: '2. Return Eligibility Criteria',
          content: 'To qualify for a full reimbursement, the cap must be returned in its original, pristine condition: unworn, unwashed, odor-free, in the original custom box with all branded tags and dust covers fully attached.',
        },
        {
          title: '3. Raffle Participation Clarification',
          content: 'Each cap purchase grants an automatic entry to the drop’s promotional draw. If a physical return is requested prior to the draw execution, the return is processed normally. However, once a raffle draw has officially concluded and winners are announced, competition entries are deemed fully executed and cannot be retroactively cancelled, though the physical merchandise return remains subject to standard refund terms.',
        },
        {
          title: '4. How to Initiate a Return',
          content: 'To start a return, navigate to the “Track my order” page or email our customer care team at support@regar.com including your order reference. Our team will supply return authorization and packaging guidelines within 24 hours.',
        },
        {
          title: '5. Inspection & Refund Timeline',
          content: 'Upon arrival and inspection at our logistics hub, your refund will be processed. Approved refunds are credited directly to your original payment method (card or digital wallet) within 5 to 10 business days.',
        },
      ],
      primaryLabel: 'Track My Order',
      primaryHref: '/track-order',
      secondaryLabel: 'Visit FAQ',
      secondaryHref: '/faq',
    },
  };

  return (
    <LegalContentPage contentKey="legal_refund" defaultContent={defaultContent} />
  );
}
