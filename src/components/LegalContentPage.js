'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import api from '@/lib/api';

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
        return { ...fallbackValue, ...parsed };
      } catch {
        return { ...fallbackValue, description: String(rawValue) };
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

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 sm:p-10 text-center">
          <h1 className="text-3xl font-bold text-neutral-900">{page.title}</h1>
          <p className="text-neutral-600 mt-4 whitespace-pre-line">{page.description}</p>

          {loading ? (
            <p className="text-sm text-neutral-400 mt-6">{locale === 'fr' ? 'Chargement...' : 'Loading...'}</p>
          ) : null}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {page.primaryHref && page.primaryLabel ? (
              <Link href={page.primaryHref} className="px-5 py-3 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors">
                {page.primaryLabel}
              </Link>
            ) : null}
            {page.secondaryHref && page.secondaryLabel ? (
              <Link href={page.secondaryHref} className="px-5 py-3 rounded-xl border border-neutral-200 text-sm font-medium hover:bg-neutral-50 transition-colors">
                {page.secondaryLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
