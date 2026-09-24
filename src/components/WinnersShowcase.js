'use client';

import { useMemo } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ShieldCheck, Gem, Users, ArrowRight, Trophy, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const DEFAULT_WINNERS_SHOWCASE = {
  header: {
    fr: {
      taglineLeft: "PLUS QU'UN PRODUIT — DES OPPORTUNITÉS",
      taglineRight: "DES CLIENTS RÉELS · DES RÊVES RÉALISÉS · CHAQUE MOIS",
      titlePrefix: "Nos derniers",
      titleHighlight: "gagnants",
      subtitle: "ILS ONT TENTÉ LEUR CHANCE, ILS ONT GAGNÉ",
    },
    en: {
      taglineLeft: "MORE THAN A PRODUCT — OPPORTUNITIES",
      taglineRight: "REAL CUSTOMERS · DREAMS REALIZED · EVERY MONTH",
      titlePrefix: "Our latest",
      titleHighlight: "winners",
      subtitle: "THEY TOOK THEIR CHANCE, THEY WON",
    },
  },
  winners: [
    {
      id: "w1",
      name: "Mathieu D.",
      image: "/images/winners/winner-1.jpg",
      quoteFr: "“Incroyable ! Je n'y croyais pas en achetant mon produit du mois et me voilà aujourd'hui au volant d'une Classe G ! Merci REGAR 🙏!”",
      quoteEn: "“Incredible! I didn't believe it when purchasing my product of the month, and here I am today at the wheel of a G-Class! Thank you REGAR 🙏!”",
      prizeFr: "Gagnant Mercedes Classe G",
      prizeEn: "Mercedes G-Class Winner",
      dateFr: "Janvier 2025",
      dateEn: "January 2025",
    },
    {
      id: "w2",
      name: "Chloé M.",
      image: "/images/winners/winner-2.jpg",
      quoteFr: "“Un rêve devenu réalité... Merci REGAR pour cette opportunité de dingue !”",
      quoteEn: "“A dream come true... Thank you REGAR for this insane opportunity!”",
      prizeFr: "Gagnante Lamborghini Urus",
      prizeEn: "Lamborghini Urus Winner",
      dateFr: "Février 2025",
      dateEn: "February 2025",
    },
    {
      id: "w3",
      name: "Thomas L.",
      image: "/images/winners/winner-3.jpg",
      quoteFr: "“Reçu ma Rolex aujourd'hui ! Qualité au rendez-vous, expérience au top. Merci à toute l'équipe REGAR !”",
      quoteEn: "“Received my Rolex today! Top quality, experience on point. Thanks to the whole REGAR team!”",
      prizeFr: "Gagnant Rolex Submariner",
      prizeEn: "Rolex Submariner Winner",
      dateFr: "Mars 2025",
      dateEn: "March 2025",
    },
    {
      id: "w4",
      name: "Laura P.",
      image: "/images/winners/winner-4.jpg",
      quoteFr: "“Je suis tellement heureuse ! Merci REGAR, je n'aurais jamais imaginé gagner une Rolex !”",
      quoteEn: "“I am so happy! Thank you REGAR, I never thought I would win a Rolex!”",
      prizeFr: "Gagnante Rolex Daytona",
      prizeEn: "Rolex Daytona Winner",
      dateFr: "Avril 2025",
      dateEn: "April 2025",
    },
    {
      id: "w5",
      name: "Yassine K.",
      image: "/images/winners/winner-5.jpg",
      quoteFr: "“EXPÉRIENCE INCROYABLE ! L'Urus est juste exceptionnelle. Merci REGAR !”",
      quoteEn: "“INCREDIBLE EXPERIENCE! The Urus is just exceptional. Thank you REGAR!”",
      prizeFr: "Gagnant Lamborghini Urus",
      prizeEn: "Lamborghini Urus Winner",
      dateFr: "Mai 2025",
      dateEn: "May 2025",
    },
    {
      id: "w6",
      name: "Enzo R.",
      image: "/images/winners/winner-6.jpg",
      quoteFr: "“Merci REGAR ! Ma Classe G est là. Tout est sérieux et transparent. Je recommande !”",
      quoteEn: "“Thank you REGAR! My G-Class is here. Everything is serious and transparent. Highly recommend!”",
      prizeFr: "Gagnant Mercedes Classe G",
      prizeEn: "Mercedes G-Class Winner",
      dateFr: "Juin 2025",
      dateEn: "June 2025",
    },
  ],
  badges: [
    {
      id: "b1",
      icon: "ShieldCheck",
      titleFr: "PARTENAIRES OFFICIELS",
      subtitleFr: "GRANDES MARQUES",
      titleEn: "OFFICIAL PARTNERS",
      subtitleEn: "TOP BRANDS",
    },
    {
      id: "b2",
      icon: "Gem",
      titleFr: "SÉCURISÉ ET FIABLE",
      subtitleFr: "GARANTIE 100%",
      titleEn: "SECURE & RELIABLE",
      subtitleEn: "100% GUARANTEED",
    },
    {
      id: "b3",
      icon: "Users",
      titleFr: "UNE COMMUNAUTÉ",
      subtitleFr: "DE PASSIONNÉS",
      titleEn: "A PASSIONATE",
      subtitleEn: "COMMUNITY",
    },
  ],
  cta: {
    link: "/products",
    fr: {
      buttonText: "TENTEZ VOTRE CHANCE",
      subtext: "AUJOURD'HUI UN PRODUIT, DEMAIN PEUT-ÊTRE VOUS",
    },
    en: {
      buttonText: "TRY YOUR LUCK",
      subtext: "TODAY A PRODUCT, TOMORROW MAYBE YOU",
    },
  },
};

const resolveBadgeIcon = (name) => {
  switch (name) {
    case 'Gem':
      return Gem;
    case 'Users':
      return Users;
    case 'ShieldCheck':
    case 'Shield':
    default:
      return ShieldCheck;
  }
};

export default function WinnersShowcase({ showcaseData = null, showTopBrand = true }) {
  const locale = useLocale();
  const isFr = locale === 'fr';

  const data = useMemo(() => {
    if (!showcaseData) return DEFAULT_WINNERS_SHOWCASE;
    return {
      ...DEFAULT_WINNERS_SHOWCASE,
      ...showcaseData,
      header: {
        fr: { ...DEFAULT_WINNERS_SHOWCASE.header.fr, ...(showcaseData?.header?.fr || {}) },
        en: { ...DEFAULT_WINNERS_SHOWCASE.header.en, ...(showcaseData?.header?.en || {}) },
      },
      winners: Array.isArray(showcaseData?.winners) && showcaseData.winners.length ? showcaseData.winners : DEFAULT_WINNERS_SHOWCASE.winners,
      badges: Array.isArray(showcaseData?.badges) && showcaseData.badges.length ? showcaseData.badges : DEFAULT_WINNERS_SHOWCASE.badges,
      cta: {
        link: showcaseData?.cta?.link || DEFAULT_WINNERS_SHOWCASE.cta.link,
        fr: { ...DEFAULT_WINNERS_SHOWCASE.cta.fr, ...(showcaseData?.cta?.fr || {}) },
        en: { ...DEFAULT_WINNERS_SHOWCASE.cta.en, ...(showcaseData?.cta?.en || {}) },
      },
    };
  }, [showcaseData]);

  const header = isFr ? data.header.fr : data.header.en;
  const cta = isFr ? data.cta.fr : data.cta.en;

  return (
    <section className="py-12 sm:py-20 bg-[#faf8f5] text-neutral-900 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Section matching client reference design */}
        <div className="mb-12 sm:mb-16">
          {/* Top Brand Sub-lines */}
          {showTopBrand && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-black/10 text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-neutral-500 uppercase text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="w-6 h-[1px] bg-[#c49856] hidden sm:inline-block" />
                <span>{header.taglineLeft}</span>
                <span className="w-6 h-[1px] bg-[#c49856] hidden sm:inline-block" />
              </div>
              <div className="text-[#a07436] tracking-[0.2em]">
                {header.taglineRight}
              </div>
            </div>
          )}

          {/* Main Titles */}
          <div className="text-center mt-8 space-y-3">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-neutral-900 font-serif">
              <span>{header.titlePrefix} </span>
              <span className="italic bg-gradient-to-r from-[#9b6e2d] via-[#d4a86a] to-[#8a5d20] bg-clip-text text-transparent drop-shadow-sm font-serif">
                {header.titleHighlight}
              </span>
            </h2>

            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.28em] text-neutral-700">
              {header.subtitle}
            </p>
          </div>
        </div>

        {/* 2 Rows x 3 Cols Winners Photo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {data.winners.map((winner, idx) => {
            const quote = isFr ? (winner.quoteFr || winner.quote) : (winner.quoteEn || winner.quote || winner.quoteFr);
            const prize = isFr ? (winner.prizeFr || winner.prize) : (winner.prizeEn || winner.prize || winner.prizeFr);
            const date = isFr ? (winner.dateFr || winner.date) : (winner.dateEn || winner.date || winner.dateFr);

            return (
              <motion.div
                key={winner.id || `winner-card-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="group relative rounded-3xl overflow-hidden shadow-lg border border-neutral-200/80 bg-neutral-900 aspect-[3/4] flex flex-col justify-end p-4 sm:p-5"
              >
                {/* Full-bleed photo background */}
                <img
                  src={winner.image || `/images/winners/winner-${(idx % 6) + 1}.jpg`}
                  alt={winner.name}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Ambient vignette gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Floating Testimonial Card at the bottom */}
                <div className="relative z-10 w-full rounded-2xl bg-[#faf8f5]/95 backdrop-blur-md p-4 sm:p-5 border border-white/80 shadow-xl space-y-2.5 text-neutral-900 transition-all duration-300">
                  {/* Quote */}
                  <p className="text-xs sm:text-[13px] leading-relaxed text-neutral-800 font-medium italic">
                    {quote}
                  </p>

                  {/* Winner Info */}
                  <div className="pt-2 border-t border-black/5 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-black text-neutral-900">
                        — {winner.name}
                      </h4>
                      <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                        {date}
                      </span>
                    </div>

                    <p className="text-[11px] sm:text-xs font-bold text-[#9e7030]">
                      {prize}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Trust Badges and Gold Action CTA Footer */}
        <div className="mt-14 sm:mt-20 pt-8 border-t border-black/10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left: Trust Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 flex-1">
            {data.badges.map((badge, bIdx) => {
              const BadgeIcon = resolveBadgeIcon(badge.icon);
              const title = isFr ? badge.titleFr : badge.titleEn;
              const subtitle = isFr ? badge.subtitleFr : badge.subtitleEn;

              return (
                <div key={badge.id || `badge-${bIdx}`} className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#f3eadb] border border-[#e5cdac] flex items-center justify-center shrink-0 shadow-sm text-[#9b6e2d]">
                    <BadgeIcon className="w-5 h-5" />
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-neutral-800 leading-tight">
                    <div>{title}</div>
                    {subtitle && <div className="text-neutral-500 font-bold">{subtitle}</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Golden Call to Action Button */}
          <div className="flex flex-col items-center lg:items-end gap-2 shrink-0">
            <Link
              href={data.cta?.link || '/products'}
              className="inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#9b6e2d] via-[#c99b58] to-[#8a5d20] hover:from-[#aa7b36] hover:via-[#d4a86a] hover:to-[#996a26] text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-300 transform active:scale-98"
            >
              <span>{cta.buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase text-center lg:text-right">
              {cta.subtext}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
