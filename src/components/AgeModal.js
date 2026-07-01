'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

export default function AgeModal({ onConfirm, locale }) {
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (confirmed) onConfirm();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900">
              {locale === 'fr' ? 'Verification de l\'age' : 'Age verification'}
            </h2>
          </div>
          <p className="text-neutral-600 mb-6">
            {locale === 'fr'
              ? 'Ce site est reserve aux personnes agees de 18 ans et plus. En continuant, vous confirmez avoir l\'age legal requis.'
              : 'This site is for individuals aged 18 and over. By continuing, you confirm you are of legal age.'}
          </p>
          <label className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer mb-6 transition-colors">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-5 h-5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
            />
            <span className="text-sm font-medium text-neutral-700">
              {locale === 'fr' ? 'Je confirme avoir au moins 18 ans' : 'I confirm I am at least 18 years old'}
            </span>
          </label>
          <button
            onClick={handleConfirm}
            disabled={!confirmed}
            className="w-full py-3 bg-neutral-900 text-white font-medium rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {locale === 'fr' ? 'Continuer' : 'Continue'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
