'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, HelpCircle, Search, X, ChevronLeft, ChevronRight, FileText, Image as ImageIcon, Upload, RotateCcw, ArrowRight, Sparkles, Globe } from 'lucide-react';
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
    },
    privacy: {
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
    },
    refund: {
      fr: {
        title: 'Retours et remboursements',
        description: 'Retour possible sous 14 jours pour produit non porte. Remboursement apres validation du retour.',
        primaryLabel: 'Suivre ma commande',
        primaryHref: '/track-order',
        secondaryLabel: 'FAQ',
        secondaryHref: '/faq',
      },
      en: {
        title: 'Returns and refunds',
        description: 'Returns are possible within 14 days for unworn products. Refund is processed after validation.',
        primaryLabel: 'Track my order',
        primaryHref: '/track-order',
        secondaryLabel: 'FAQ',
        secondaryHref: '/faq',
      },
    },
  };
  const [legalContent, setLegalContent] = useState(defaultLegalContent);
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
              fr = { ...fr, ...JSON.parse(data.valueFr) };
            } catch {
              fr = { ...fr, description: data.valueFr };
            }
          }

          if (data.valueEn) {
            try {
              en = { ...en, ...JSON.parse(data.valueEn) };
            } catch {
              en = { ...en, description: data.valueEn };
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
      toast.success(`${section} content saved`);
    } catch (error) {
      toast.error(error.message);
    }
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
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold">Legal Pages Content</h2>

            {[
              ['terms', 'Terms'],
              ['privacy', 'Privacy'],
              ['refund', 'Refund'],
            ].map(([section, sectionLabel]) => (
              <div key={section} className="rounded-xl border border-neutral-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm uppercase tracking-wide">{sectionLabel}</h3>
                  <button
                    onClick={() => saveLegalContent(section)}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800 transition-colors"
                  >
                    Save {sectionLabel}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {['fr', 'en'].map((lang) => (
                    <div key={`${section}-${lang}`} className="space-y-2 p-3 rounded-lg border border-neutral-100 bg-neutral-50/50">
                      <h4 className="text-xs uppercase font-semibold text-neutral-500">{lang === 'fr' ? 'French' : 'English'}</h4>

                      {[['title', 'Title'], ['description', 'Description'], ['primaryLabel', 'Primary label'], ['primaryHref', 'Primary href'], ['secondaryLabel', 'Secondary label'], ['secondaryHref', 'Secondary href']].map(([field, label]) => (
                        <div key={`${section}-${lang}-${field}`}>
                          <label className="text-xs font-medium text-neutral-600 mb-1 block">{label}</label>
                          {field === 'description' ? (
                            <textarea
                              value={legalContent[section][lang][field] || ''}
                              onChange={(e) => setLegalContent((prev) => ({
                                ...prev,
                                [section]: {
                                  ...prev[section],
                                  [lang]: { ...prev[section][lang], [field]: e.target.value },
                                },
                              }))}
                              rows={4}
                              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                            />
                          ) : (
                            <input
                              value={legalContent[section][lang][field] || ''}
                              onChange={(e) => setLegalContent((prev) => ({
                                ...prev,
                                [section]: {
                                  ...prev[section],
                                  [lang]: { ...prev[section][lang], [field]: e.target.value },
                                },
                              }))}
                              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      )}
    </div>
  );
}
