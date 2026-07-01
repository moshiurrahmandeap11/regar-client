'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Instagram, Facebook, Twitter } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('Footer');
  const locale = useLocale();

  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-neutral-900 font-bold text-sm">R</span>
              </div>
              <span className="font-bold text-xl text-white">Regar</span>
            </div>
            <p className="text-sm text-neutral-400 mb-4">
              {locale === 'fr' ? 'Rafflites de sneakers, casquettes et accessoires de luxe.' : 'Raffles for sneakers, caps and luxury accessories.'}
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"><Twitter className="w-4 h-4" /></a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">{t('links')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-white transition-colors">{locale === 'fr' ? 'Produits' : 'Products'}</Link></li>
              <li><Link href="/raffles" className="hover:text-white transition-colors">{locale === 'fr' ? 'Tombolas' : 'Raffles'}</Link></li>
              <li><Link href="/winners" className="hover:text-white transition-colors">{t('winners')}</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">{t('contact')}</h3>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>contact@regar.ch</li>
              <li>+41 79 123 45 67</li>
              <li>Lausanne, Suisse</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="hover:text-white transition-colors">{t('terms')}</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">{t('privacy')}</Link></li>
              <li><Link href="/refund" className="hover:text-white transition-colors">{t('refund')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-800 text-center text-sm text-neutral-500">
          <p>2024 Regar. {t('rights')}</p>
        </div>
      </div>
    </footer>
  );
}
