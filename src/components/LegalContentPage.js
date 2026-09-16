'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import api from '@/lib/api';
import {
  FileText,
  Shield,
  RotateCcw,
  Calendar,
  Mail,
  ArrowRight,
  ChevronRight,
  Scale,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export default function LegalContentPage({ contentKey, defaultContent }) {
  const locale = useLocale();
  const [content, setContent] = useState(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const parseSide = (rawValue, fallbackValue) => {
      if (!rawValue) return fallbackValue;
      try {
        const parsed = JSON.parse(rawValue);
        return {
          ...fallbackValue,
          ...parsed,
          sections: Array.isArray(parsed.sections) && parsed.sections.length > 0
            ? parsed.sections
            : fallbackValue.sections || [],
        };
      } catch {
        return {
          ...fallbackValue,
          summary: String(rawValue),
          description: String(rawValue),
        };
      }
    };

    const fetchContent = async () => {
      try {
        const res = await api.get(`/api/content/${contentKey}`, { timeout: 12000 });
        const data = res.data;

        if (!isMounted || !data) return;

        setContent({
          fr: parseSide(data.valueFr, defaultContent.fr),
          en: parseSide(data.valueEn, defaultContent.en),
        });
      } catch {
        if (isMounted) {
          setContent(defaultContent);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchContent();
    return () => {
      isMounted = false;
    };
  }, [contentKey, defaultContent]);

  const page = useMemo(() => {
    return locale === 'fr' ? content.fr : content.en;
  }, [content, locale]);

  const sections = useMemo(() => {
    if (Array.isArray(page.sections) && page.sections.length > 0) {
      return page.sections;
    }
    // Fallback: If description exists without structured sections
    if (page.description) {
      return [
        {
          title: locale === 'fr' ? 'Détails de la politique' : 'Policy Details',
          content: page.description,
        },
      ];
    }
    return [];
  }, [page, locale]);

  const policyLinks = [
    {
      key: 'legal_terms',
      href: '/terms',
      labelEn: 'Terms & Conditions',
      labelFr: 'Conditions Générales',
      icon: Scale,
    },
    {
      key: 'legal_privacy',
      href: '/privacy',
      labelEn: 'Privacy Policy',
      labelFr: 'Politique de Confidentialité',
      icon: Shield,
    },
    {
      key: 'legal_refund',
      href: '/refund',
      labelEn: 'Returns & Refunds',
      labelFr: 'Retours & Remboursements',
      icon: RotateCcw,
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50/60 py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6 sm:mb-8">
          <Link href="/" className="hover:text-neutral-900 transition-colors">
            {locale === 'fr' ? 'Accueil' : 'Home'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-neutral-900 font-medium">{page.title}</span>
        </nav>

        {/* Hero Header */}
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-8 sm:p-12 mb-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-gradient-to-br from-[#e9c58c]/15 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#d8a868]" />
              <span>{locale === 'fr' ? 'Documentation Légale' : 'Legal Documentation'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight leading-[1.1]">
              {page.title}
            </h1>

            {page.lastUpdated ? (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500 font-medium">
                <Calendar className="w-4 h-4 text-[#d8a868]" />
                <span>
                  {locale === 'fr' ? 'Dernière mise à jour :' : 'Last updated:'}{' '}
                  <strong className="text-neutral-700 font-semibold">{page.lastUpdated}</strong>
                </span>
              </div>
            ) : null}

            {(page.summary || page.description) ? (
              <p className="text-neutral-600 text-sm sm:text-base leading-relaxed pt-1">
                {page.summary || page.description}
              </p>
            ) : null}

            {loading ? (
              <p className="text-xs text-neutral-400 animate-pulse">
                {locale === 'fr' ? 'Mise à jour du contenu...' : 'Updating content...'}
              </p>
            ) : null}
          </div>
        </div>

        {/* Main Grid Layout: Sidebar Navigation + Content Document */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Quick Navigation & Legal Switcher (4 cols on lg) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Quick Sections Navigation */}
            {sections.length > 0 && (
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-sm sticky top-24">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4 px-2">
                  {locale === 'fr' ? 'Sommaire' : 'Table of Contents'}
                </h3>
                <nav className="space-y-1">
                  {sections.map((section, idx) => (
                    <a
                      key={idx}
                      href={`#sec-${idx}`}
                      className="group flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-all font-medium"
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded-md bg-neutral-100 group-hover:bg-[#e9c58c]/30 text-neutral-700 text-[11px] font-bold flex items-center justify-center transition-colors">
                        {idx + 1}
                      </span>
                      <span className="line-clamp-1">{section.title}</span>
                    </a>
                  ))}
                </nav>

                {/* Policies Switcher */}
                <div className="mt-6 pt-5 border-t border-neutral-100 space-y-2">
                  <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-2">
                    {locale === 'fr' ? 'Autres Documents' : 'Other Policies'}
                  </h4>
                  {policyLinks.map((item) => {
                    const isActive = item.key === contentKey;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-neutral-900 text-white shadow-sm'
                            : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-[#e9c58c]' : 'text-neutral-400'}`} />
                          <span>{locale === 'fr' ? item.labelFr : item.labelEn}</span>
                        </div>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#e9c58c]" />}
                      </Link>
                    );
                  })}
                </div>

                {/* Support Box */}
                <div className="mt-6 p-4 rounded-xl bg-[#fdf9f2] border border-[#e9c58c]/40 text-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#8a6122] uppercase tracking-wide">
                    <HelpCircle className="w-4 h-4 text-[#d8a868]" />
                    <span>{locale === 'fr' ? 'Besoin d’aide ?' : 'Have Questions?'}</span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {locale === 'fr'
                      ? 'Notre équipe support est disponible pour répondre à vos questions sur nos conditions et retours.'
                      : 'Our support team is available to assist you regarding our competition rules and returns.'}
                  </p>
                  <div className="pt-1">
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-900 hover:text-[#8a6122] transition-colors"
                    >
                      <span>{locale === 'fr' ? 'Contacter le support' : 'Contact Support'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* Right Column: Structured Sections Document (8 cols on lg) */}
          <main className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-10 shadow-sm space-y-8">
              {sections.length > 0 ? (
                sections.map((section, idx) => (
                  <article
                    key={idx}
                    id={`sec-${idx}`}
                    className="scroll-mt-24 space-y-3 pb-8 border-b border-neutral-100 last:border-none last:pb-0"
                  >
                    <div className="flex items-start gap-3.5">
                      <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-[#e9c58c]/20 text-[#8a6122] text-xs font-black flex items-center justify-center border border-[#e9c58c]/40">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="space-y-2 flex-1">
                        <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
                          {section.title}
                        </h2>
                        <div className="text-neutral-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                          {section.content}
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="text-center py-12 text-neutral-500">
                  <FileText className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                  <p>{locale === 'fr' ? 'Aucun contenu disponible.' : 'No content available.'}</p>
                </div>
              )}

              {/* Action Buttons */}
              {(page.primaryHref && page.primaryLabel) || (page.secondaryHref && page.secondaryLabel) ? (
                <div className="pt-6 border-t border-neutral-100 flex flex-wrap gap-3">
                  {page.primaryHref && page.primaryLabel ? (
                    <Link
                      href={page.primaryHref}
                      className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition-colors inline-flex items-center gap-2 shadow-sm"
                    >
                      <span>{page.primaryLabel}</span>
                      <ArrowRight className="w-4 h-4 text-[#e9c58c]" />
                    </Link>
                  ) : null}
                  {page.secondaryHref && page.secondaryLabel ? (
                    <Link
                      href={page.secondaryHref}
                      className="px-5 py-2.5 rounded-xl border border-neutral-200 text-neutral-800 text-xs sm:text-sm font-semibold hover:bg-neutral-50 transition-colors"
                    >
                      {page.secondaryLabel}
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
