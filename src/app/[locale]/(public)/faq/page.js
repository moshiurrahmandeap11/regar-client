'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import api from '@/lib/api';
import FaqAccordion from '@/components/FaqAccordion';
import SectionTitle from '@/components/SectionTitle';

export default function FaqPage() {
  const locale = useLocale();
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    api.get('/api/content/faq').then(res => setFaqs(res.data));
  }, []);

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle title="FAQ" subtitle={locale === 'fr' ? 'Questions frequemment posees' : 'Frequently asked questions'} />
        <FaqAccordion faqs={faqs} locale={locale} />
      </div>
    </div>
  );
}
