'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, HelpCircle, Search, X, ChevronLeft, ChevronRight, FileText,
  Image as ImageIcon, Upload, RotateCcw, ArrowRight, Sparkles, Globe,
  Shield, Scale, Calendar, Trash2, ArrowUp, ArrowDown
} from 'lucide-react';
import { FadeIn } from '@/components/animations';
import toast from 'react-hot-toast';

export default function ContentContent() {
  const [faqs, setFaqs] = useState([]);
  const defaultHeroConfig = {
    fr: {
      eyebrow: '',
      titleLine1: 'Achetez la casquette.',
      titleLine2: 'Gagnez le tirage.',
      subtitle: 'Chaque casquette achetee vaut un ticket de tirage.',
      capSectionTitle: 'La casquette du tirage',
      prizeSectionTitle: 'Prix a gagner',
      noActiveRaffleText: 'Aucun raffle actif',
      noProductsText: 'Aucun produit de raffle a afficher.',
      noPrizesText: 'Aucun prix configure pour ce raffle.',
      soldLabel: 'tickets vendus',
      remainingLabel: 'tickets restants',
      maxLabel: 'tickets max',
      enterDrawLabel: 'Participer'
    },
    en: {
      eyebrow: '',
      titleLine1: 'Buy the cap.',
      titleLine2: 'Win the draw.',
      subtitle: 'Each cap purchased is worth one raffle ticket.',
      capSectionTitle: 'The cap of the draw',
      prizeSectionTitle: 'Prizes to be won',
      noActiveRaffleText: 'No active raffle',
      noProductsText: 'No raffle products to display.',
      noPrizesText: 'No prizes configured for this raffle.',
      soldLabel: 'tickets sold',
      remainingLabel: 'tickets remaining',
      maxLabel: 'max tickets',
      enterDrawLabel: 'Enter the draw'
    }
  };
  const defaultBannerConfig = {
    image: '',
    buttonLink: '/products',
    en: {
      titleLine1: 'BUY A CAP.',
      titleLine2: 'WIN BIG.',
      subtitle: 'Purchase a cap and get automatic entry to win high-value prizes.',
      buttonText: 'BUY CAP & ENTER',
    },
    fr: {
      titleLine1: 'ACHETEZ UNE CASQUETTE.',
      titleLine2: 'GAGNEZ GROS.',
      subtitle: 'Achetez une casquette et obtenez une entree automatique pour gagner des prix de grande valeur.',
      buttonText: 'ACHETER ET ENTRER',
    },
  };
  const [bannerConfig, setBannerConfig] = useState(defaultBannerConfig);
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [bannerImagePreview, setBannerImagePreview] = useState('');
  const [isBannerDragging, setIsBannerDragging] = useState(false);
  const [bannerLang, setBannerLang] = useState('en');
  const [previewLang, setPreviewLang] = useState('en');
  const [savingBanner, setSavingBanner] = useState(false);
  const [heroContent, setHeroContent] = useState(defaultHeroConfig);
  const defaultLegalContent = {
    terms: {
      fr: {
        title: 'Conditions Générales de Vente et d’Utilisation',
        lastUpdated: 'Mars 2025',
        summary: 'Veuillez lire attentivement nos conditions. En achetant une casquette Regar ou en participant à nos tirages au sort, vous acceptez l’ensemble de ces dispositions.',
        description: 'Les CGV, reglement du tirage et politique de confidentialite seront publies ici selon le modele Regar-site.',
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
        description: 'Terms of sale, raffle rules and legal information are published here.',
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
    },
    privacy: {
      fr: {
        title: 'Politique de Confidentialité',
        lastUpdated: 'Mars 2025',
        summary: 'Votre confiance est primordiale. Cette politique détaille la collecte, la protection et l’utilisation de vos données personnelles conformément au RGPD.',
        description: 'Cette page couvre le traitement des donnees personnelles, cookies et droits RGPD.',
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
        description: 'This page covers personal data processing, cookies and privacy rights.',
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
    },
    refund: {
      fr: {
        title: 'Politique de Retours et Remboursements',
        lastUpdated: 'Mars 2025',
        summary: 'Nous nous engageons sur l’excellence et la qualité de chaque casquette Regar. Découvrez ci-dessous nos modalités complètes de retour sous 14 jours.',
        description: 'Retour possible sous 14 jours pour produit non porte. Remboursement apres validation du retour.',
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
        description: 'Returns are possible within 14 days for unworn products. Refund is processed after validation.',
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
    },
  };
  const [legalContent, setLegalContent] = useState(defaultLegalContent);
  const [legalSection, setLegalSection] = useState('terms');
  const [legalLang, setLegalLang] = useState('en');
  const [savingLegal, setSavingLegal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('faq');
  const [showForm, setShowForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [faqForm, setFaqForm] = useState({
    question: '', questionEn: '', answer: '', answerEn: '', category: 'general', order: 0
  });

  const API = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    fetchFaqs();
    fetchHeroBanner();
    fetchHeroContent();
    fetchLegalContent();
  }, []);

  const fetchHeroBanner = async () => {
    try {
      const res = await fetch(`${API}/api/content/hero-banner`);
      const data = await res.json();
      if (data) {
        setBannerConfig({
          image: data.image || '',
          buttonLink: data.buttonLink || '/products',
          en: { ...defaultBannerConfig.en, ...(data.en || {}) },
          fr: { ...defaultBannerConfig.fr, ...(data.fr || {}) },
        });
        if (data.image) {
          setBannerImagePreview(data.image);
        }
      }
    } catch (error) {
      console.error('Failed to load hero banner:', error);
    }
  };

  const handleBannerImageChange = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WEBP)');
      return;
    }
    setBannerImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleResetBannerImage = () => {
    setBannerImageFile(null);
    setBannerImagePreview('');
    setBannerConfig((prev) => ({ ...prev, image: '' }));
    toast.success('Reset to default banner image');
  };

  const saveHeroBanner = async () => {
    setSavingBanner(true);
    try {
      const formData = new FormData();
      if (bannerImageFile) {
        formData.append('bannerImage', bannerImageFile);
      } else if (!bannerConfig.image && !bannerImagePreview) {
        formData.append('resetImage', 'true');
      } else if (bannerConfig.image) {
        formData.append('image', bannerConfig.image);
      }
      formData.append('buttonLink', bannerConfig.buttonLink || '/products');
      formData.append('en', JSON.stringify(bannerConfig.en));
      formData.append('fr', JSON.stringify(bannerConfig.fr));

      const res = await fetch(`${API}/api/content/hero-banner`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to save hero banner');
      const updated = await res.json();
      toast.success('Hero banner updated successfully');
      setBannerConfig({
        image: updated.image || '',
        buttonLink: updated.buttonLink || '/products',
        en: { ...defaultBannerConfig.en, ...(updated.en || {}) },
        fr: { ...defaultBannerConfig.fr, ...(updated.fr || {}) },
      });
      setBannerImageFile(null);
      if (updated.image) {
        setBannerImagePreview(updated.image);
      } else {
        setBannerImagePreview('');
      }
    } catch (error) {
      toast.error(error.message || 'Error saving hero banner');
    } finally {
      setSavingBanner(false);
    }
  };

  const fetchFaqs = async () => {
    try {
      const res = await fetch(`${API}/api/content/faq`);
      const data = await res.json();
      setFaqs(data);
    } catch (error) {
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const fetchHeroContent = async () => {
    try {
      const res = await fetch(`${API}/api/content/heroConfig`);
      const data = await res.json();
      if (!data) return;

      let fr = defaultHeroConfig.fr;
      let en = defaultHeroConfig.en;

      if (data.valueFr) {
        try {
          fr = { ...fr, ...JSON.parse(data.valueFr) };
        } catch {
          fr = { ...fr, titleLine1: data.valueFr };
        }
      }

      if (data.valueEn) {
        try {
          en = { ...en, ...JSON.parse(data.valueEn) };
        } catch {
          en = { ...en, titleLine1: data.valueEn };
        }
      }

      setHeroContent({ fr, en });
    } catch (error) {
      console.error('Failed to load hero content');
    }
  };

  const saveHeroContent = async () => {
    try {
      const res = await fetch(`${API}/api/content/heroConfig`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          valueFr: JSON.stringify(heroContent.fr),
          valueEn: JSON.stringify(heroContent.en),
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Hero content saved');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchLegalContent = async () => {
    const keyBySection = {
      terms: 'legal_terms',
      privacy: 'legal_privacy',
      refund: 'legal_refund',
    };

    try {
      const entries = await Promise.all(
        Object.entries(keyBySection).map(async ([section, key]) => {
          const res = await fetch(`${API}/api/content/${key}`);
          const data = await res.json();

          if (!data) {
            return [section, defaultLegalContent[section]];
          }

          let fr = defaultLegalContent[section].fr;
          let en = defaultLegalContent[section].en;

          if (data.valueFr) {
            try {
              const parsedFr = JSON.parse(data.valueFr);
              fr = {
                ...fr,
                ...parsedFr,
                sections: Array.isArray(parsedFr.sections) && parsedFr.sections.length > 0
                  ? parsedFr.sections
                  : fr.sections,
              };
            } catch {
              fr = { ...fr, description: data.valueFr, summary: data.valueFr };
            }
          }

          if (data.valueEn) {
            try {
              const parsedEn = JSON.parse(data.valueEn);
              en = {
                ...en,
                ...parsedEn,
                sections: Array.isArray(parsedEn.sections) && parsedEn.sections.length > 0
                  ? parsedEn.sections
                  : en.sections,
              };
            } catch {
              en = { ...en, description: data.valueEn, summary: data.valueEn };
            }
          }

          return [section, { fr, en }];
        })
      );

      setLegalContent(Object.fromEntries(entries));
    } catch {
      // Keep defaults if legal content cannot be loaded.
    }
  };

  const saveLegalContent = async (section) => {
    const keyBySection = {
      terms: 'legal_terms',
      privacy: 'legal_privacy',
      refund: 'legal_refund',
    };

    const key = keyBySection[section];
    if (!key) return;

    try {
      setSavingLegal(true);
      const payload = legalContent[section];
      const res = await fetch(`${API}/api/content/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          valueFr: JSON.stringify(payload.fr),
          valueEn: JSON.stringify(payload.en),
        }),
      });

      if (!res.ok) throw new Error('Failed to save legal content');
      const label = section === 'terms' ? 'Terms & Conditions' : section === 'privacy' ? 'Privacy Policy' : 'Refund Policy';
      toast.success(`${label} saved successfully`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSavingLegal(false);
    }
  };

  const handleAddLegalSection = () => {
    setLegalContent((prev) => {
      const currentList = prev[legalSection]?.[legalLang]?.sections || [];
      const newSection = {
        title: `${currentList.length + 1}. Clause Title`,
        content: '',
      };
      return {
        ...prev,
        [legalSection]: {
          ...prev[legalSection],
          [legalLang]: {
            ...prev[legalSection][legalLang],
            sections: [...currentList, newSection],
          },
        },
      };
    });
  };

  const handleUpdateLegalSection = (index, field, value) => {
    setLegalContent((prev) => {
      const currentList = [...(prev[legalSection]?.[legalLang]?.sections || [])];
      currentList[index] = { ...currentList[index], [field]: value };
      return {
        ...prev,
        [legalSection]: {
          ...prev[legalSection],
          [legalLang]: {
            ...prev[legalSection][legalLang],
            sections: currentList,
          },
        },
      };
    });
  };

  const handleRemoveLegalSection = (index) => {
    setLegalContent((prev) => {
      const currentList = [...(prev[legalSection]?.[legalLang]?.sections || [])];
      currentList.splice(index, 1);
      return {
        ...prev,
        [legalSection]: {
          ...prev[legalSection],
          [legalLang]: {
            ...prev[legalSection][legalLang],
            sections: currentList,
          },
        },
      };
    });
  };

  const handleMoveLegalSection = (index, direction) => {
    setLegalContent((prev) => {
      const currentList = [...(prev[legalSection]?.[legalLang]?.sections || [])];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= currentList.length) return prev;
      const temp = currentList[index];
      currentList[index] = currentList[targetIndex];
      currentList[targetIndex] = temp;
      return {
        ...prev,
        [legalSection]: {
          ...prev[legalSection],
          [legalLang]: {
            ...prev[legalSection][legalLang],
            sections: currentList,
          },
        },
      };
    });
  };

  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingFaq ? `${API}/api/content/faq/${editingFaq}` : `${API}/api/content/faq`;
      const method = editingFaq ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(faqForm),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success(editingFaq ? 'FAQ updated' : 'FAQ created');
      resetFaqForm();
      fetchFaqs();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteFaq = async (id) => {
    const confirmed = await new Promise((resolve) => {
      toast((t) => (
        <div className="space-y-2">
          <p className="text-sm">Are you sure you want to delete this FAQ?</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded bg-neutral-900 text-white text-xs" onClick={() => { toast.dismiss(t.id); resolve(true); }}>Delete</button>
            <button className="px-3 py-1 rounded border text-xs" onClick={() => { toast.dismiss(t.id); resolve(false); }}>Cancel</button>
          </div>
        </div>
      ), { duration: 10000 });
    });
    if (!confirmed) return;
    try {
      const res = await fetch(`${API}/api/content/faq/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('FAQ deleted');
      fetchFaqs();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEditFaq = (faq) => {
    setEditingFaq(faq._id);
    setFaqForm({
      question: faq.question, questionEn: faq.questionEn || '',
      answer: faq.answer, answerEn: faq.answerEn || '',
      category: faq.category || 'general', order: faq.order || 0
    });
    setShowForm(true);
  };

  const resetFaqForm = () => {
    setShowForm(false);
    setEditingFaq(null);
    setFaqForm({ question: '', questionEn: '', answer: '', answerEn: '', category: 'general', order: 0 });
  };

  const filtered = faqs.filter(f =>
    f.question?.toLowerCase().includes(search.toLowerCase()) ||
    f.answer?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('faq')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'faq' ? 'bg-neutral-900 text-white' : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
        >
          FAQ
        </button>
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'hero' ? 'bg-neutral-900 text-white' : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
        >
          Hero Banner
        </button>
        <button
          onClick={() => setActiveTab('legal')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'legal' ? 'bg-neutral-900 text-white' : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
        >
          Legal Content
        </button>
      </div>

      {activeTab === 'faq' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowForm(!showForm)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-medium"
            >
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? 'Cancel' : 'Add FAQ'}
            </motion.button>
          </div>

          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                  <h2 className="text-lg font-semibold mb-4">{editingFaq ? 'Edit FAQ' : 'Add FAQ'}</h2>
                  <form onSubmit={handleFaqSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-neutral-700 mb-1 block">Question (FR)</label>
                        <input value={faqForm.question} onChange={e => setFaqForm({...faqForm, question: e.target.value})} required className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-700 mb-1 block">Question (EN)</label>
                        <input value={faqForm.questionEn} onChange={e => setFaqForm({...faqForm, questionEn: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-neutral-700 mb-1 block">Answer (FR)</label>
                        <textarea value={faqForm.answer} onChange={e => setFaqForm({...faqForm, answer: e.target.value})} required rows={3} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-700 mb-1 block">Answer (EN)</label>
                        <textarea value={faqForm.answerEn} onChange={e => setFaqForm({...faqForm, answerEn: e.target.value})} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-neutral-700 mb-1 block">Category</label>
                        <select value={faqForm.category} onChange={e => setFaqForm({...faqForm, category: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900">
                          <option value="general">General</option>
                          <option value="shipping">Shipping</option>
                          <option value="payment">Payment</option>
                          <option value="raffles">Raffles</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-700 mb-1 block">Order</label>
                        <input type="number" value={faqForm.order} onChange={e => setFaqForm({...faqForm, order: parseInt(e.target.value)})} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-medium">
                        {editingFaq ? 'Update FAQ' : 'Create FAQ'}
                      </motion.button>
                      <button type="button" onClick={resetFaqForm} className="px-6 py-2.5 border border-neutral-200 rounded-xl text-sm hover:bg-neutral-50">Cancel</button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full mx-auto" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50">
                        <th className="text-left py-3 px-4 font-medium text-neutral-600">Question</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-600">Category</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-600">Order</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((faq) => (
                        <motion.tr key={faq._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-medium text-sm">{faq.question}</p>
                            <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{faq.answer}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-neutral-100 rounded-lg text-xs capitalize">{faq.category}</span>
                          </td>
                          <td className="py-3 px-4">{faq.order}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleEditFaq(faq)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><FileText className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteFaq(faq._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><X className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filtered.length === 0 && (
                  <div className="text-center py-12">
                    <HelpCircle className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-500 text-sm">No FAQs found</p>
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200">
                    <p className="text-sm text-neutral-500">{filtered.length} FAQs</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 rounded-lg hover:bg-neutral-100 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                      <span className="text-sm font-medium">{currentPage} / {totalPages}</span>
                      <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1 rounded-lg hover:bg-neutral-100 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'hero' && (
        <FadeIn>
          <div className="space-y-6">
            {/* Header / Intro */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#e9c58c]" />
                  Hero Banner Customization
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Change the homepage banner background image, headline, subtitle, and primary call-to-action button.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetBannerImage}
                  className="px-3.5 py-2 text-xs font-medium border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Image
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveHeroBanner}
                  disabled={savingBanner}
                  className="px-5 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow"
                >
                  {savingBanner ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-[#e9c58c]" />
                  )}
                  {savingBanner ? 'Saving...' : 'Save Banner'}
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Left Column: Image Uploader & Text Form (7 cols) */}
              <div className="xl:col-span-7 space-y-6">
                {/* 1. Background Image Card */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-neutral-500" />
                        Banner Background Image
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        High-resolution photo shown in the homepage hero background.
                      </p>
                    </div>
                    {(bannerImagePreview || bannerConfig.image) && (
                      <button
                        type="button"
                        onClick={handleResetBannerImage}
                        className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Revert to default
                      </button>
                    )}
                  </div>

                  <input
                    id="hero-banner-file-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleBannerImageChange(e.target.files[0]);
                      }
                      e.target.value = '';
                    }}
                    className="hidden"
                  />

                  {/* Dropzone & Preview Box */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsBannerDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsBannerDragging(false); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsBannerDragging(false);
                      if (e.dataTransfer?.files?.[0]) {
                        handleBannerImageChange(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`relative rounded-xl overflow-hidden border-2 border-dashed transition-all group ${
                      isBannerDragging
                        ? 'border-neutral-900 bg-neutral-100/60 scale-[0.99]'
                        : 'border-neutral-200 hover:border-neutral-400 bg-neutral-50'
                    }`}
                  >
                    <div className="relative h-48 w-full bg-neutral-900 overflow-hidden flex items-center justify-center">
                      <img
                        src={bannerImagePreview || '/images/regar-hero-banner.jpeg'}
                        alt="Banner Preview"
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 p-4 text-center">
                        <button
                          type="button"
                          onClick={() => document.getElementById('hero-banner-file-input')?.click()}
                          className="px-4 py-2 bg-white/95 hover:bg-white text-neutral-900 rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 transition-transform hover:scale-105"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          {bannerImagePreview ? 'Change Banner Photo' : 'Upload Banner Photo'}
                        </button>
                        <p className="text-[11px] text-white/80 font-medium">
                          or drag and drop a new image here
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1">
                    <span>Formats: JPG, PNG, WEBP</span>
                    <span>Recommended: 1920x1080 or wider (Full HD / 2K)</span>
                  </div>
                </div>

                {/* 2. Banner Texts Card */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-neutral-500" />
                        Banner Headline & Content
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Customize titles and buttons for English and French users.
                      </p>
                    </div>

                    {/* Language Switcher Tabs */}
                    <div className="flex items-center bg-neutral-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setBannerLang('en')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          bannerLang === 'en'
                            ? 'bg-white text-neutral-900 shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-800'
                        }`}
                      >
                        🇬🇧 English
                      </button>
                      <button
                        type="button"
                        onClick={() => setBannerLang('fr')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          bannerLang === 'fr'
                            ? 'bg-white text-neutral-900 shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-800'
                        }`}
                      >
                        🇫🇷 Français
                      </button>
                    </div>
                  </div>

                  {/* Text inputs for active language */}
                  <div className="space-y-4">
                    {/* Title Line 1 */}
                    <div>
                      <label className="text-xs font-medium text-neutral-700 mb-1.5 block">
                        Headline Line 1 <span className="text-neutral-400 font-normal">(Primary White text)</span>
                      </label>
                      <input
                        type="text"
                        value={bannerConfig[bannerLang].titleLine1}
                        onChange={(e) => setBannerConfig((prev) => ({
                          ...prev,
                          [bannerLang]: { ...prev[bannerLang], titleLine1: e.target.value }
                        }))}
                        placeholder={bannerLang === 'en' ? 'BUY A CAP.' : 'ACHETEZ UNE CASQUETTE.'}
                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>

                    {/* Title Line 2 */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-medium text-neutral-700 block">
                          Headline Line 2
                        </label>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#e9c58c]/30 text-amber-800">
                          Gold Accent Text
                        </span>
                      </div>
                      <input
                        type="text"
                        value={bannerConfig[bannerLang].titleLine2}
                        onChange={(e) => setBannerConfig((prev) => ({
                          ...prev,
                          [bannerLang]: { ...prev[bannerLang], titleLine2: e.target.value }
                        }))}
                        placeholder={bannerLang === 'en' ? 'WIN BIG.' : 'GAGNEZ GROS.'}
                        className="w-full px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50/20 text-sm font-black uppercase text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Subtitle / Description */}
                    <div>
                      <label className="text-xs font-medium text-neutral-700 mb-1.5 block">
                        Subtitle / Description Text
                      </label>
                      <textarea
                        rows={2}
                        value={bannerConfig[bannerLang].subtitle}
                        onChange={(e) => setBannerConfig((prev) => ({
                          ...prev,
                          [bannerLang]: { ...prev[bannerLang], subtitle: e.target.value }
                        }))}
                        placeholder={bannerLang === 'en' ? 'Purchase a cap and get automatic entry to win high-value prizes.' : 'Achetez une casquette et obtenez une entree automatique pour gagner des prix de grande valeur.'}
                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                      />
                    </div>

                    {/* Primary Button Text */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="text-xs font-medium text-neutral-700 mb-1.5 block">
                          Primary Button Text <span className="text-neutral-400 font-normal">({bannerLang.toUpperCase()})</span>
                        </label>
                        <input
                          type="text"
                          value={bannerConfig[bannerLang].buttonText}
                          onChange={(e) => setBannerConfig((prev) => ({
                            ...prev,
                            [bannerLang]: { ...prev[bannerLang], buttonText: e.target.value }
                          }))}
                          placeholder={bannerLang === 'en' ? 'BUY CAP & ENTER' : 'ACHETER ET ENTRER'}
                          className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700 mb-1.5 block">
                          Button Destination Link
                        </label>
                        <input
                          type="text"
                          value={bannerConfig.buttonLink}
                          onChange={(e) => setBannerConfig((prev) => ({
                            ...prev,
                            buttonLink: e.target.value
                          }))}
                          placeholder="/products"
                          className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-end">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={saveHeroBanner}
                      disabled={savingBanner}
                      className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow"
                    >
                      {savingBanner ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-[#e9c58c]" />
                      )}
                      {savingBanner ? 'Saving...' : 'Save Banner Changes'}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Interactive Preview (5 cols) */}
              <div className="xl:col-span-5">
                <div className="sticky top-6 space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">Live Homepage Preview</span>
                    </div>

                    <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg text-[11px]">
                      <button
                        type="button"
                        onClick={() => setPreviewLang('en')}
                        className={`px-2 py-1 rounded-md font-medium transition-all ${
                          previewLang === 'en' ? 'bg-white shadow text-neutral-900' : 'text-neutral-500'
                        }`}
                      >
                        EN
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewLang('fr')}
                        className={`px-2 py-1 rounded-md font-medium transition-all ${
                          previewLang === 'fr' ? 'bg-white shadow text-neutral-900' : 'text-neutral-500'
                        }`}
                      >
                        FR
                      </button>
                    </div>
                  </div>

                  {/* Simulated Hero Banner Box */}
                  <div className="relative min-h-[460px] w-full rounded-2xl overflow-hidden bg-[#100d09] shadow-xl border border-neutral-800 flex flex-col justify-between p-6 text-white select-none">
                    {/* Background photo */}
                    <img
                      src={bannerImagePreview || '/images/regar-hero-banner.jpeg'}
                      alt="Hero Live Preview"
                      className="absolute inset-0 w-full h-full object-cover object-center opacity-85"
                    />
                    {/* Shadow / Gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                    {/* Top Content */}
                    <div className="relative z-10 space-y-3 max-w-[320px]">
                      <div className="inline-flex items-center gap-1.5 rounded-md border border-[#e2bd87]/50 bg-black/40 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#e2bd87]" />
                        {previewLang === 'fr' ? 'Raffle en direct' : 'Live raffle'}
                      </div>

                      <h1 className="text-2xl sm:text-3xl font-black uppercase leading-[0.95] drop-shadow-md">
                        {bannerConfig[previewLang].titleLine1 || (previewLang === 'fr' ? 'ACHETEZ UNE CASQUETTE.' : 'BUY A CAP.')}
                        <span className="block text-[#e9c58c] mt-1">
                          {bannerConfig[previewLang].titleLine2 || (previewLang === 'fr' ? 'GAGNEZ GROS.' : 'WIN BIG.')}
                        </span>
                      </h1>

                      <p className="text-xs text-white/85 leading-relaxed">
                        {bannerConfig[previewLang].subtitle || (previewLang === 'fr' ? 'Achetez une casquette et obtenez une entree automatique pour gagner des prix de grande valeur.' : 'Purchase a cap and get automatic entry to win high-value prizes.')}
                      </p>

                      <div className="pt-2">
                        <div className="inline-flex items-center gap-2 rounded-md bg-[#e9c58c] px-4 py-2 text-[10px] font-black uppercase text-black shadow hover:bg-[#f1d09b] transition-colors">
                          {bannerConfig[previewLang].buttonText || (previewLang === 'fr' ? 'Acheter et entrer' : 'Buy cap & enter')}
                          <ArrowRight className="h-3 w-3" />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Simulated Countdown Widget */}
                    <div className="relative z-10 mt-6 max-w-[260px] rounded-lg border border-white/10 bg-black/50 backdrop-blur-sm p-3 shadow-lg">
                      <p className="text-[9px] font-black uppercase tracking-wider text-[#e9c58c] text-center">
                        {previewLang === 'fr' ? 'Fin du raffle dans' : 'Raffle ends in'}
                      </p>
                      <div className="mt-1 flex justify-center gap-2 text-center text-xs font-bold text-white">
                        <div><span className="text-sm font-black">14</span><span className="block text-[8px] text-white/50 font-normal">DAYS</span></div>
                        <span>:</span>
                        <div><span className="text-sm font-black">00</span><span className="block text-[8px] text-white/50 font-normal">HOURS</span></div>
                        <span>:</span>
                        <div><span className="text-sm font-black">10</span><span className="block text-[8px] text-white/50 font-normal">MIN</span></div>
                        <span>:</span>
                        <div><span className="text-sm font-black">05</span><span className="block text-[8px] text-white/50 font-normal">SEC</span></div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-400 text-center">
                    Interactive Preview: Switch between EN and FR to see changes live.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      )}

      {activeTab === 'legal' && (
        <FadeIn>
          <div className="space-y-6">
            {/* Top Bar: Policy sub-tabs + Lang Switcher + Save button */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              {/* Policy selector tabs */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'terms', label: 'Terms & Conditions', icon: Scale },
                  { id: 'privacy', label: 'Privacy Policy', icon: Shield },
                  { id: 'refund', label: 'Refund Policy', icon: RotateCcw },
                ].map((item) => {
                  const Icon = item.icon;
                  const isCurrent = legalSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLegalSection(item.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                        isCurrent
                          ? 'bg-neutral-900 text-white shadow'
                          : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 border border-neutral-200/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isCurrent ? 'text-[#e9c58c]' : 'text-neutral-500'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Language Switcher & Save Button */}
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-neutral-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setLegalLang('en')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      legalLang === 'en' ? 'bg-white shadow text-neutral-900' : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 text-[#d8a868]" />
                    <span>English (EN)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLegalLang('fr')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      legalLang === 'fr' ? 'bg-white shadow text-neutral-900' : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 text-[#d8a868]" />
                    <span>French (FR)</span>
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => saveLegalContent(legalSection)}
                  disabled={savingLegal}
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow transition-colors"
                >
                  {savingLegal ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-[#e9c58c]" />
                  )}
                  {savingLegal ? 'Saving...' : `Save ${legalSection === 'terms' ? 'Terms' : legalSection === 'privacy' ? 'Privacy' : 'Refund'}`}
                </motion.button>
              </div>
            </div>

            {/* Main Editor & Live Preview Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Left Column: Form Controls (7 cols on xl) */}
              <div className="xl:col-span-7 space-y-6">
                {/* Document Metadata Card */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#d8a868]" />
                      <span>Document Header & Overview ({legalLang.toUpperCase()})</span>
                    </h3>
                    <span className="text-[11px] font-semibold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-md uppercase">
                      {legalSection}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 mb-1.5 block">
                        Page Title
                      </label>
                      <input
                        type="text"
                        value={legalContent[legalSection]?.[legalLang]?.title || ''}
                        onChange={(e) =>
                          setLegalContent((prev) => ({
                            ...prev,
                            [legalSection]: {
                              ...prev[legalSection],
                              [legalLang]: { ...prev[legalSection][legalLang], title: e.target.value },
                            },
                          }))
                        }
                        placeholder="e.g. Terms & Conditions"
                        className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-700 mb-1.5 block">
                        Last Updated Timestamp
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={legalContent[legalSection]?.[legalLang]?.lastUpdated || ''}
                          onChange={(e) =>
                            setLegalContent((prev) => ({
                              ...prev,
                              [legalSection]: {
                                ...prev[legalSection],
                                [legalLang]: { ...prev[legalSection][legalLang], lastUpdated: e.target.value },
                              },
                            }))
                          }
                          placeholder="e.g. March 2025"
                          className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 mb-1.5 block">
                      Summary / Introduction Overview
                    </label>
                    <textarea
                      value={
                        legalContent[legalSection]?.[legalLang]?.summary ||
                        legalContent[legalSection]?.[legalLang]?.description ||
                        ''
                      }
                      onChange={(e) =>
                        setLegalContent((prev) => ({
                          ...prev,
                          [legalSection]: {
                            ...prev[legalSection],
                            [legalLang]: {
                              ...prev[legalSection][legalLang],
                              summary: e.target.value,
                              description: e.target.value,
                            },
                          },
                        }))
                      }
                      rows={3}
                      placeholder="Brief introductory paragraph explaining this legal document..."
                      className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                    />
                  </div>
                </div>

                {/* Clauses & Sections Manager Card */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-5 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
                        Clauses & Sections
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-[#e9c58c]/20 text-[#8a6122] text-xs font-bold">
                        {(legalContent[legalSection]?.[legalLang]?.sections || []).length}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddLegalSection}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#e9c58c]" />
                      <span>Add Clause</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(legalContent[legalSection]?.[legalLang]?.sections || []).map((sec, sIdx) => (
                      <div
                        key={sIdx}
                        className="rounded-2xl border border-neutral-200 p-4 sm:p-5 bg-neutral-50/40 space-y-3 hover:border-neutral-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-200/70 text-neutral-700 text-xs font-bold">
                            Clause #{sIdx + 1}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveLegalSection(sIdx, -1)}
                              disabled={sIdx === 0}
                              title="Move Up"
                              className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveLegalSection(sIdx, 1)}
                              disabled={
                                sIdx ===
                                (legalContent[legalSection]?.[legalLang]?.sections || []).length - 1
                              }
                              title="Move Down"
                              className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveLegalSection(sIdx)}
                              title="Delete Clause"
                              className="p-1.5 rounded-lg border border-red-200 bg-white text-red-500 hover:bg-red-50 transition-colors ml-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-neutral-600 mb-1 block">
                            Clause Title
                          </label>
                          <input
                            type="text"
                            value={sec.title || ''}
                            onChange={(e) => handleUpdateLegalSection(sIdx, 'title', e.target.value)}
                            placeholder="e.g. 1. Eligibility & Registration"
                            className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-neutral-600 mb-1 block">
                            Clause Content / Paragraphs
                          </label>
                          <textarea
                            value={sec.content || ''}
                            onChange={(e) => handleUpdateLegalSection(sIdx, 'content', e.target.value)}
                            rows={4}
                            placeholder="Detailed text, terms, or conditions of this clause..."
                            className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-y bg-white leading-relaxed"
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddLegalSection}
                      className="w-full py-3 rounded-2xl border-2 border-dashed border-neutral-200 hover:border-neutral-400 text-neutral-500 hover:text-neutral-800 text-xs font-bold transition-all flex items-center justify-center gap-2 bg-neutral-50/50 hover:bg-neutral-50"
                    >
                      <Plus className="w-4 h-4 text-[#d8a868]" />
                      <span>Add New Clause</span>
                    </button>
                  </div>
                </div>

                {/* Footer Action Buttons Card */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide pb-3 border-b border-neutral-100">
                    Bottom Action Buttons (Optional)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                      <span className="text-xs font-bold text-neutral-700 block">Primary Action Button</span>
                      <div>
                        <label className="text-[11px] text-neutral-500 block mb-1">Button Label</label>
                        <input
                          type="text"
                          value={legalContent[legalSection]?.[legalLang]?.primaryLabel || ''}
                          onChange={(e) =>
                            setLegalContent((prev) => ({
                              ...prev,
                              [legalSection]: {
                                ...prev[legalSection],
                                [legalLang]: { ...prev[legalSection][legalLang], primaryLabel: e.target.value },
                              },
                            }))
                          }
                          placeholder="e.g. Refund Policy"
                          className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-neutral-500 block mb-1">Button URL</label>
                        <input
                          type="text"
                          value={legalContent[legalSection]?.[legalLang]?.primaryHref || ''}
                          onChange={(e) =>
                            setLegalContent((prev) => ({
                              ...prev,
                              [legalSection]: {
                                ...prev[legalSection],
                                [legalLang]: { ...prev[legalSection][legalLang], primaryHref: e.target.value },
                              },
                            }))
                          }
                          placeholder="e.g. /refund"
                          className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                      <span className="text-xs font-bold text-neutral-700 block">Secondary Action Button</span>
                      <div>
                        <label className="text-[11px] text-neutral-500 block mb-1">Button Label</label>
                        <input
                          type="text"
                          value={legalContent[legalSection]?.[legalLang]?.secondaryLabel || ''}
                          onChange={(e) =>
                            setLegalContent((prev) => ({
                              ...prev,
                              [legalSection]: {
                                ...prev[legalSection],
                                [legalLang]: { ...prev[legalSection][legalLang], secondaryLabel: e.target.value },
                              },
                            }))
                          }
                          placeholder="e.g. Contact Support"
                          className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-neutral-500 block mb-1">Button URL</label>
                        <input
                          type="text"
                          value={legalContent[legalSection]?.[legalLang]?.secondaryHref || ''}
                          onChange={(e) =>
                            setLegalContent((prev) => ({
                              ...prev,
                              [legalSection]: {
                                ...prev[legalSection],
                                [legalLang]: { ...prev[legalSection][legalLang], secondaryHref: e.target.value },
                              },
                            }))
                          }
                          placeholder="e.g. /contact"
                          className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Sticky Live Document Preview (5 cols on xl) */}
              <div className="xl:col-span-5">
                <div className="sticky top-6 space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                        Live Document Preview
                      </span>
                    </div>

                    <span className="text-[11px] font-bold text-neutral-500 bg-neutral-100 px-2.5 py-0.5 rounded-md uppercase">
                      {legalLang} · {legalSection}
                    </span>
                  </div>

                  {/* Simulated Document Reader Box */}
                  <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-5 max-h-[750px] overflow-y-auto">
                    {/* Header preview */}
                    <div className="space-y-2 pb-4 border-b border-neutral-100">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-[10px] font-bold uppercase tracking-wider">
                        <Sparkles className="w-3 h-3 text-[#d8a868]" />
                        <span>Legal Documentation</span>
                      </div>
                      <h4 className="text-xl font-black text-neutral-900 tracking-tight">
                        {legalContent[legalSection]?.[legalLang]?.title || 'Untitled Policy'}
                      </h4>
                      {legalContent[legalSection]?.[legalLang]?.lastUpdated && (
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                          <Calendar className="w-3.5 h-3.5 text-[#d8a868]" />
                          <span>Last updated: {legalContent[legalSection]?.[legalLang]?.lastUpdated}</span>
                        </div>
                      )}
                      {(legalContent[legalSection]?.[legalLang]?.summary ||
                        legalContent[legalSection]?.[legalLang]?.description) && (
                        <p className="text-xs text-neutral-600 leading-relaxed pt-1">
                          {legalContent[legalSection]?.[legalLang]?.summary ||
                            legalContent[legalSection]?.[legalLang]?.description}
                        </p>
                      )}
                    </div>

                    {/* Clauses preview */}
                    <div className="space-y-4">
                      {(legalContent[legalSection]?.[legalLang]?.sections || []).length > 0 ? (
                        (legalContent[legalSection]?.[legalLang]?.sections || []).map((sec, idx) => (
                          <div key={idx} className="space-y-1.5 pb-3 border-b border-neutral-100 last:border-none">
                            <div className="flex items-start gap-2">
                              <span className="flex-shrink-0 w-5 h-5 rounded-md bg-[#e9c58c]/20 text-[#8a6122] text-[10px] font-black flex items-center justify-center border border-[#e9c58c]/40">
                                {idx + 1}
                              </span>
                              <div className="space-y-1 flex-1">
                                <h5 className="text-xs font-bold text-neutral-900">
                                  {sec.title || `Clause ${idx + 1}`}
                                </h5>
                                <p className="text-[11px] text-neutral-600 leading-relaxed whitespace-pre-line">
                                  {sec.content || 'Clause content preview...'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-neutral-400 text-center py-4">
                          No clauses added yet. Click &quot;Add Clause&quot; to add one.
                        </p>
                      )}
                    </div>

                    {/* Buttons preview */}
                    {(legalContent[legalSection]?.[legalLang]?.primaryLabel ||
                      legalContent[legalSection]?.[legalLang]?.secondaryLabel) && (
                      <div className="pt-3 border-t border-neutral-100 flex gap-2">
                        {legalContent[legalSection]?.[legalLang]?.primaryLabel && (
                          <span className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-[11px] font-bold">
                            {legalContent[legalSection]?.[legalLang]?.primaryLabel}
                          </span>
                        )}
                        {legalContent[legalSection]?.[legalLang]?.secondaryLabel && (
                          <span className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-700 text-[11px] font-bold">
                            {legalContent[legalSection]?.[legalLang]?.secondaryLabel}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-neutral-400 text-center">
                    Real-time document preview updates as you type.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
