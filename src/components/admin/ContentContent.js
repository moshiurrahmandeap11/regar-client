'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, HelpCircle, Search, X, ChevronLeft, ChevronRight, FileText, Image as ImageIcon } from 'lucide-react';
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
    fetchHeroContent();
    fetchLegalContent();
  }, []);

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
          Hero Content
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
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Hero Section Content</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {['fr', 'en'].map((lang) => (
                <div key={lang} className="space-y-3 p-4 rounded-xl border border-neutral-200">
                  <h3 className="font-semibold uppercase text-sm">{lang === 'fr' ? 'French' : 'English'}</h3>

                  {[
                    ['eyebrow', 'Eyebrow'],
                    ['titleLine1', 'Title line 1'],
                    ['titleLine2', 'Title line 2'],
                    ['subtitle', 'Subtitle'],
                    ['capSectionTitle', 'Cap section title'],
                    ['prizeSectionTitle', 'Prize section title'],
                    ['soldLabel', 'Sold label'],
                    ['remainingLabel', 'Remaining label'],
                    ['maxLabel', 'Max label'],
                    ['enterDrawLabel', 'Enter draw button'],
                    ['noActiveRaffleText', 'No active raffle text'],
                    ['noProductsText', 'No products text'],
                    ['noPrizesText', 'No prizes text'],
                  ].map(([field, label]) => (
                    <div key={field}>
                      <label className="text-xs font-medium text-neutral-600 mb-1 block">{label}</label>
                      <input
                        value={heroContent[lang][field]}
                        onChange={(e) => setHeroContent((prev) => ({
                          ...prev,
                          [lang]: { ...prev[lang], [field]: e.target.value }
                        }))}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveHeroContent}
                className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors"
              >
                Save Hero Content
              </motion.button>
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
