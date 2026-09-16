'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Gift, ArrowRight, CheckCircle2, Ticket } from 'lucide-react';
import CountdownTimer from '@/components/CountdownTimer';

export default function RaffleAlertModal({
  isOpen,
  onClose,
  onEnterRaffle,
  raffle,
  locale = 'en',
}) {
  if (!isOpen || !raffle) return null;

  const isFr = locale === 'fr';
  const prize = raffle.prizes && raffle.prizes.length > 0 ? raffle.prizes[0] : null;
  const prizeName = prize ? (isFr ? prize.name : prize.nameEn || prize.name) : (isFr ? raffle.name : raffle.nameEn || raffle.name);
  const prizeValue = prize?.value;
  const prizeImage = prize?.image;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', duration: 0.5, bounce: 0.15 }}
          className="relative w-full max-w-lg rounded-3xl bg-[#110e0b] border border-[#e2bd87]/40 shadow-[0_25px_60px_-15px_rgba(226,189,135,0.3)] p-6 sm:p-8 text-white overflow-hidden z-10 select-none"
        >
          {/* Ambient Gold Glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-gradient-to-br from-[#e9c58c]/25 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-gradient-to-tr from-[#e9c58c]/15 to-transparent rounded-full blur-2xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative z-10 space-y-5 text-center">
            {/* Pulsing Gold Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#e9c58c]/15 border border-[#e9c58c]/40 text-[#e9c58c] text-xs font-black uppercase tracking-wider shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-[#e9c58c] animate-pulse" />
              <span>{isFr ? '🎉 GIVEAWAY EN COURS' : '🎉 ACTIVE GIVEAWAY DROP'}</span>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-tight">
                {isFr ? 'Ce produit est en tirage !' : 'This Cap Includes A Raffle!'}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
                {isFr
                  ? 'Achetez cette casquette et obtenez automatiquement une entrée gratuite pour remporter ce lot d’exception.'
                  : 'Purchasing this cap automatically grants you a verified entry ticket to win this high-value prize.'}
              </p>
            </div>

            {/* Prize Card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 flex items-center gap-4 text-left backdrop-blur-md">
              {prizeImage ? (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-[#e2bd87]/40 bg-black/40 shrink-0">
                  <img
                    src={prizeImage}
                    alt={prizeName}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-[#e9c58c]/15 border border-[#e9c58c]/30 flex items-center justify-center shrink-0">
                  <Gift className="w-8 h-8 text-[#e9c58c]" />
                </div>
              )}

              <div className="space-y-1 flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#e9c58c] block">
                  {isFr ? 'Lot à gagner' : 'Grand Prize to Win'}
                </span>
                <h4 className="text-base sm:text-lg font-black text-white truncate">
                  {prizeName}
                </h4>
                {prizeValue ? (
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-200">
                    <span className="text-neutral-400">{isFr ? 'Valeur estimée :' : 'Estimated Value:'}</span>
                    <span className="text-[#e9c58c] font-black">{prizeValue} CHF</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Countdown widget preview (if raffle has endDate) */}
            {raffle.endDate && (
              <div className="pt-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#e9c58c] mb-1">
                  {isFr ? 'Fin du tirage dans' : 'Giveaway ends in'}
                </p>
                <div className="flex justify-center">
                  <CountdownTimer targetDate={raffle.endDate} size="sm" />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onEnterRaffle}
                className="flex-1 py-3 px-4 rounded-xl bg-[#e9c58c] hover:bg-[#f1d09b] text-neutral-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Ticket className="w-4 h-4" />
                <span>{isFr ? 'Participer au tirage' : 'Enter Giveaway & Buy'}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <button
                type="button"
                onClick={onClose}
                className="py-3 px-5 rounded-xl border border-white/20 hover:bg-white/10 text-white/80 hover:text-white font-bold text-xs sm:text-sm transition-colors"
              >
                {isFr ? 'D’accord, continuer' : 'Okay, Continue'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

