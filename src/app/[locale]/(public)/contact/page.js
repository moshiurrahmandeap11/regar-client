'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import api from '@/lib/api';
import { FadeIn } from '@/components/animations';
import toast from 'react-hot-toast';
import useSiteSettings from '@/hooks/useSiteSettings';

export default function ContactPage() {
  const locale = useLocale();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const settings = useSiteSettings();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/api/content/contact', form);
      toast.success(locale === 'fr' ? 'Message envoye !' : 'Message sent!');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <FadeIn>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-4">
                {locale === 'fr' ? 'Contactez-nous' : 'Contact us'}
              </h1>
              <p className="text-neutral-500 mb-8">
                {locale === 'fr' ? 'Une question ? N\'hesitez pas a nous contacter.' : 'Have a question? Feel free to reach out.'}
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-neutral-200">
                  <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-neutral-500">{settings.contactEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-neutral-200">
                  <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{locale === 'fr' ? 'Telephone' : 'Phone'}</p>
                    <p className="text-sm text-neutral-500">{settings.contactPhone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-neutral-200">
                  <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{locale === 'fr' ? 'Adresse' : 'Address'}</p>
                    <p className="text-sm text-neutral-500">{settings.contactLocation}</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1 block">{locale === 'fr' ? 'Nom' : 'Name'}</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1 block">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1 block">{locale === 'fr' ? 'Sujet' : 'Subject'}</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1 block">{locale === 'fr' ? 'Message' : 'Message'}</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm resize-none"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={sending}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-neutral-900 text-white font-medium rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {sending ? (locale === 'fr' ? 'Envoi...' : 'Sending...') : (locale === 'fr' ? 'Envoyer' : 'Send')}
                </motion.button>
              </div>
            </form>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
