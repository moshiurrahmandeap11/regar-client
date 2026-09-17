'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  ArrowRight,
  Award,
  CheckCircle,
  Globe2,
  Mail,
  PlayCircle,
  Quote,
  ShieldCheck,
  ShoppingCart,
  Star,
  Ticket,
  Trophy,
  Users,
  X,
  Gem,
  Truck,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Shield,
  BadgeCheck,
  Handshake,
  Sparkles,
  Gift,
} from 'lucide-react';
import api from '@/lib/api';
import { productPath } from '@/lib/productPath';
import CountdownTimer from '@/components/CountdownTimer';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const uniqueById = (items = []) => {
  const seen = new Set();
  return items.filter((item) => {
    const id = item?._id;
    if (!id || seen.has(String(id))) return false;
    seen.add(String(id));
    return true;
  });
};

const pickImage = (item) => item?.images?.[0] || item?.colors?.find((color) => color.image)?.image || '';
const HERO_BANNER_IMAGE = '/images/regar-hero-banner.jpeg';

const DEFAULT_HERO_BANNER = {
  image: HERO_BANNER_IMAGE,
  buttonLink: '/products',
  en: {
    titleLine1: 'Buy a cap.',
    titleLine2: 'Win big.',
    subtitle: 'Purchase a cap and get automatic entry to win high-value prizes.',
    buttonText: 'Buy cap & enter',
  },
  fr: {
    titleLine1: 'Achetez une casquette.',
    titleLine2: 'Gagnez gros.',
    subtitle: 'Achetez une casquette et obtenez une entree automatique pour gagner des prix de grande valeur.',
    buttonText: 'Acheter et entrer',
  },
};

const DEFAULT_SHOP_CAPS = {
  en: {
    eyebrow: 'Shop caps',
    title: 'Choose Your Cap',
    benefits: [
      { icon: 'Gem', title: 'Premium Quality', text: 'High quality materials, built to last.' },
      { icon: 'Ticket', title: 'One Cap, Multiple Entries', text: 'Every purchase gives you raffle entries.' },
      { icon: 'Truck', title: 'Worldwide Shipping', text: 'Fast & reliable delivery to your door.' },
    ],
  },
  fr: {
    eyebrow: 'Collection casquettes',
    title: 'Choisissez votre casquette',
    benefits: [
      { icon: 'Gem', title: 'Qualité Supérieure', text: 'Matériaux haut de gamme conçus pour durer.' },
      { icon: 'Ticket', title: 'Une Casquette, Plusieurs Chances', text: 'Chaque achat vous donne des participations au tirage.' },
      { icon: 'Truck', title: 'Livraison Internationale', text: 'Expédition rapide et sécurisée à votre porte.' },
    ],
  },
};

const resolveBenefitIcon = (iconName) => {
  switch (iconName) {
    case 'Ticket': return Ticket;
    case 'Truck': return Truck;
    case 'Shield': return Shield;
    case 'Trophy': return Trophy;
    case 'Star': return Star;
    case 'BadgeCheck': return BadgeCheck;
    case 'Globe2': return Globe2;
    case 'Sparkles': return Sparkles;
    case 'Gift': return Gift;
    case 'RotateCcw': return RotateCcw;
    case 'Gem':
    default:
      return Gem;
  }
};

const FALLBACK_REVIEWS = [
  {
    _id: 'fb-1',
    name: 'Emma Wilson',
    avatar: 'https://i.pravatar.cc/100?img=32',
    rating: 5,
    comment: "J'ai rejoint pour la tombola, mais la qualité m'a vraiment surpris. Tout était simple et limpide.",
    commentEn: 'I joined for the raffle, but the quality really surprised me. Everything was simple and easy to follow.',
  },
  {
    _id: 'fb-2',
    name: 'Michael Brown',
    avatar: 'https://i.pravatar.cc/100?img=12',
    rating: 5,
    comment: 'Livraison rapide, emballage soigné et le processus des tickets était incroyablement simple à suivre.',
    commentEn: 'Fast delivery, clean packaging, and the ticket flow was incredibly easy to follow. Great experience.',
  },
  {
    _id: 'fb-3',
    name: 'Daniel Smith',
    avatar: 'https://i.pravatar.cc/100?img=44',
    rating: 5,
    comment: 'Le processus était très direct et limpide. J\'ai reçu mon prix exactement comme prévu. Fortement recommandé.',
    commentEn: 'The whole process was very straightforward. I received my prize exactly as expected. Highly recommended.',
  },
  {
    _id: 'fb-4',
    name: 'Sophia Miller',
    avatar: 'https://i.pravatar.cc/100?img=25',
    rating: 5,
    comment: 'Expérience très fluide, de la participation à la tombola jusqu\'à la réception du prix.',
    commentEn: 'Very smooth experience from entering the raffle to receiving the prize. Everything was clearly explained.',
  },
  {
    _id: 'fb-5',
    name: 'Olivia Taylor',
    avatar: 'https://i.pravatar.cc/100?img=48',
    rating: 5,
    comment: 'Impressionnée par la simplicité de tout. Le prix est arrivé en toute sécurité et la communication était excellente.',
    commentEn: 'I was impressed with how simple everything was. The prize arrived safely and the communication was excellent.',
  },
  {
    _id: 'fb-6',
    name: 'James Anderson',
    avatar: 'https://i.pravatar.cc/100?img=15',
    rating: 5,
    comment: 'J\'ai adoré participer. Le tirage était transparent, rapide et bien plus simple que ce à quoi je m\'attendais.',
    commentEn: 'Really enjoyed participating. The process was transparent, quick and much easier than I expected.',
  },
];

export default function HomePage() {
  const locale = useLocale();
  const [products, setProducts] = useState([]);
  const [raffles, setRaffles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [winners, setWinners] = useState([]);
  const [heroBanner, setHeroBanner] = useState(DEFAULT_HERO_BANNER);
  const [shopCapsContent, setShopCapsContent] = useState(DEFAULT_SHOP_CAPS);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prizeModalOpen, setPrizeModalOpen] = useState(false);
  const [prizePage, setPrizePage] = useState(0);
  const [prizeSlide, setPrizeSlide] = useState(0);

  const isFr = locale === 'fr';

  useEffect(() => {
    const load = async () => {
      try {
        const [productRes, raffleRes, reviewRes, winnerRes, heroRes, shopCapsRes] = await Promise.all([
          api.get('/api/products?featured=true&active=true'),
          api.get('/api/raffles?status=active'),
          api.get('/api/reviews?limit=20'),
          api.get(`/api/tickets/winners?limit=4&t=${Date.now()}`),
          api.get('/api/content/hero-banner').catch(() => ({ data: null })),
          api.get('/api/content/shop_caps_section').catch(() => ({ data: null })),
        ]);
        setProducts(Array.isArray(productRes.data) ? productRes.data : []);
        setRaffles(Array.isArray(raffleRes.data) ? raffleRes.data : []);
        setReviews(Array.isArray(reviewRes.data) ? reviewRes.data : []);
        setWinners(Array.isArray(winnerRes.data) ? winnerRes.data : []);
        if (heroRes?.data) {
          setHeroBanner({
            image: heroRes.data.image || DEFAULT_HERO_BANNER.image,
            buttonLink: heroRes.data.buttonLink || DEFAULT_HERO_BANNER.buttonLink,
            en: { ...DEFAULT_HERO_BANNER.en, ...(heroRes.data.en || {}) },
            fr: { ...DEFAULT_HERO_BANNER.fr, ...(heroRes.data.fr || {}) },
          });
        }
        if (shopCapsRes?.data) {
          let en = DEFAULT_SHOP_CAPS.en;
          let fr = DEFAULT_SHOP_CAPS.fr;
          if (shopCapsRes.data.valueEn) {
            try {
              const parsed = JSON.parse(shopCapsRes.data.valueEn);
              en = { ...en, ...parsed, benefits: Array.isArray(parsed.benefits) && parsed.benefits.length ? parsed.benefits : en.benefits };
            } catch (e) {}
          }
          if (shopCapsRes.data.valueFr) {
            try {
              const parsed = JSON.parse(shopCapsRes.data.valueFr);
              fr = { ...fr, ...parsed, benefits: Array.isArray(parsed.benefits) && parsed.benefits.length ? parsed.benefits : fr.benefits };
            } catch (e) {}
          }
          setShopCapsContent({ en, fr });
        }
      } catch (error) {
        console.error('Home load failed:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const heroRaffle = raffles[0] || null;
  const raffleProducts = useMemo(() => uniqueById(raffles.map((raffle) => raffle.product).filter(Boolean)), [raffles]);
  const shopProducts = useMemo(() => uniqueById([...raffleProducts, ...products]).slice(0, 3), [raffleProducts, products]);
  const heroProduct = heroRaffle?.product || shopProducts[0] || null;
  const heroImage = pickImage(heroProduct);
  
  // All prizes from all active raffles for the modal
  const allPrizes = useMemo(() => {
    const prizes = [];
    raffles.forEach((raffle) => {
      (raffle.prizes || []).forEach((prize, idx) => {
        prizes.push({ ...prize, raffleName: isFr ? raffle.name : raffle.nameEn || raffle.name, rank: idx + 1 });
      });
    });
    return prizes;
  }, [raffles, isFr]);

  // Prize carousel items (show first 3 for the main display)
  const prizeItems = useMemo(() => allPrizes.slice(0, 3), [allPrizes]);
  const prizePages = Math.ceil(allPrizes.length / 3);
  const modalPrizeItems = allPrizes.slice(prizePage * 3, prizePage * 3 + 3);

  const heroText = isFr ? heroBanner.fr : heroBanner.en;
  const currentHeroBannerImage = heroBanner.image || DEFAULT_HERO_BANNER.image;
  const currentButtonLink = heroBanner.buttonLink || DEFAULT_HERO_BANNER.buttonLink;
  const heroName = heroRaffle ? (isFr ? heroRaffle.name : heroRaffle.nameEn || heroRaffle.name) : '';
  const participantCount = Math.max(0, ...raffles.map((raffle) => Number(raffle.ticketCount || raffle.product?.soldTickets || 0)));
  const displayParticipantCount = Math.max(participantCount, 10000);

  // Running raffle image for the countdown section (first prize image or product image)
  const runningRaffleImage = heroRaffle?.prizes?.[0]?.image || heroImage || '';

  const marqueeReviews = useMemo(() => {
    const valid = Array.isArray(reviews) ? reviews.filter((r) => r && (r.comment || r.commentEn)) : [];
    const base = valid.length >= 6
      ? valid
      : [...valid, ...FALLBACK_REVIEWS.slice(valid.length)];
    return [...base, ...base];
  }, [reviews]);

  const handleNewsletter = async (event) => {
    event.preventDefault();
    try {
      await api.post('/api/newsletters', { email });
      setEmail('');
      toast.success(isFr ? 'Inscription reussie !' : 'Subscribed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error');
    }
  };

  const trustItems = [
    { icon: Shield, title: isFr ? '100% securise' : '100% Secure', text: isFr ? 'Vos donnees restent protegees.' : 'Your data is always safe with us.' },
    { icon: Handshake, title: isFr ? 'Equitable' : 'Fair & Transparent', text: isFr ? 'Tirage aleatoire verifie.' : 'Random & verified winner selection.' },
    { icon: BadgeCheck, title: isFr ? 'Gagnants verifies' : 'Verified Winners', text: isFr ? 'Vrais participants, vrais prix.' : 'Real people, real prizes.' },
    { icon: Globe2, title: isFr ? 'Livraison mondiale' : 'Worldwide Shipping', text: isFr ? 'Livraison rapide et fiable.' : 'Fast & reliable delivery.' },
  ];

  const steps = [
    { icon: ShoppingCart, title: isFr ? 'Acheter' : 'Buy a Cap', text: isFr ? 'Choisissez votre casquette et finalisez la commande.' : 'Choose your favorite cap and complete your purchase.' },
    { icon: Ticket, title: isFr ? 'Recevoir les tickets' : 'Get Entries', text: isFr ? 'Chaque casquette payee ajoute vos tickets au raffle.' : 'Every paid cap adds your entries to the current raffle.' },
    { icon: Trophy, title: isFr ? 'Gagner' : 'Win Big', text: isFr ? 'Attendez le tirage et devenez le gagnant.' : 'Wait for the draw and be the lucky winner.' },
  ];

  const currentShopCaps = isFr ? (shopCapsContent?.fr || DEFAULT_SHOP_CAPS.fr) : (shopCapsContent?.en || DEFAULT_SHOP_CAPS.en);
  const currentShopBenefits = Array.isArray(currentShopCaps?.benefits) && currentShopCaps.benefits.length > 0
    ? currentShopCaps.benefits
    : (isFr ? DEFAULT_SHOP_CAPS.fr.benefits : DEFAULT_SHOP_CAPS.en.benefits);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#f7f3ec]">
        <div className="h-10 w-10 rounded-full border-2 border-neutral-900 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <main className="bg-[#f8f5ef] text-[#171410] pb-20">
      {/* Hero Section */}
      <section className="bg-[#f8f5ef] text-white">
        <div className="relative min-h-[680px] w-full overflow-hidden bg-[#100d09] sm:min-h-[640px] lg:min-h-[720px] 2xl:min-h-[760px]">
          <div className="absolute inset-0">
            <img
              src={currentHeroBannerImage}
              alt="Regar cap raffle campaign"
              className="absolute left-0 top-[56%] h-full w-full -translate-y-1/2 object-cover object-[42%_center] opacity-100 lg:top-[58%] lg:h-auto lg:w-full lg:max-w-none 2xl:top-[57%]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.80)_0%,rgba(0,0,0,0.54)_22%,rgba(0,0,0,0.20)_43%,rgba(0,0,0,0)_70%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0)_60%,rgba(0,0,0,0.18)_100%)]" />
          </div>

          <div className="relative min-h-[inherit] px-6 py-12 sm:px-8 sm:py-12 lg:px-12 lg:py-14 xl:px-14">
            <div className="max-w-[320px] sm:max-w-[460px] lg:max-w-[500px]">
            <div className="inline-flex items-center gap-2 rounded-md border border-[#e2bd87]/45 bg-black/20 px-2.5 py-1 text-[10px] sm:text-xs tracking-[0.06em] text-white shadow-[0_8px_28px_rgba(0,0,0,0.22)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#e2bd87]" />
              {heroRaffle ? (isFr ? 'Raffle en direct' : 'Live raffle') : (isFr ? 'Raffle bientot' : 'Raffle coming soon')}
            </div>

            <h1 className="mt-3 text-[42px] sm:text-[56px] lg:text-[68px] font-semibold leading-[0.92] tracking-normal drop-shadow-[0_2px_18px_rgba(0,0,0,0.42)]">
              {heroText.titleLine1 || (isFr ? 'Achetez une casquette.' : 'Buy a cap.')}
              <span className="block text-[#e9c58c]">{heroText.titleLine2 || (isFr ? 'Gagnez gros.' : 'Win big.')}</span>
            </h1>

            <p className="mt-3 max-w-[290px] sm:max-w-[360px] text-sm sm:text-[15px] text-white/88 leading-relaxed">
              {heroText.subtitle || (isFr ? 'Achetez une casquette et obtenez une entree automatique pour gagner des prix de grande valeur.' : 'Purchase a cap and get automatic entry to win high-value prizes.')}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link href={currentButtonLink || "/products"} className="inline-flex items-center gap-3 rounded-md bg-[#e9c58c] px-5 py-3 text-[11px] sm:text-xs text-black shadow-[0_12px_30px_rgba(226,189,135,0.24)] hover:bg-[#f1d09b] transition-colors">
                {heroText.buttonText || (isFr ? 'Acheter et entrer' : 'Buy cap & enter')} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/#how-it-works" className="inline-flex items-center gap-2 rounded-md px-1 py-2 text-[11px] sm:text-xs text-white">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e9c58c]/65 bg-black/18">
                  <PlayCircle className="h-4 w-4 text-[#e9c58c]" />
                </span>
                {isFr ? 'Comment ca marche' : 'How it works'}
              </Link>
            </div>

            {/* Countdown Timer */}
            <div className="mt-8 w-full max-w-[330px] rounded-lg border border-white/10 bg-black/28 px-4 py-4 shadow-[0_18px_45px_rgba(0,0,0,0.24)] sm:max-w-[470px] sm:px-6 sm:py-5">
              <p className="text-center text-[9px] sm:text-[10px] tracking-[0.16em] text-[#e9c58c]">
                {isFr ? 'Fin du raffle dans' : 'Raffle ends in'}
              </p>
              {heroRaffle?.endDate ? (
                <div className="mt-3 flex justify-center">
                  <CountdownTimer targetDate={heroRaffle.endDate} locale={locale} variant="banner" />
                </div>
              ) : (
                <p className="mt-3 text-center text-sm text-white/60">{isFr ? 'Date a confirmer' : 'Date to be confirmed'}</p>
              )}
            </div>

            <div className="mt-5 hidden sm:flex flex-wrap items-center gap-4 text-[11px] text-white/82">
              {trustItems.slice(0, 3).map((item, index) => (
                <div key={item.title} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-white/70" />
                  <span>{item.title}</span>
                  {index < 2 ? <span className="ml-2 h-4 w-px bg-white/20" /> : null}
                </div>
              ))}
            </div>
          </div>

            {/* Participants */}
            <div className="absolute bottom-6 right-4 w-[172px] rounded-lg bg-white px-4 py-3 text-black shadow-[0_18px_45px_rgba(0,0,0,0.28)] sm:bottom-7 sm:right-8 sm:w-[250px] lg:right-8">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 shrink-0">
                  {shopProducts.slice(0, 3).map((product) => (
                    <span key={product._id} className="h-8 w-8 sm:h-9 sm:w-9 overflow-hidden rounded-full border-2 border-white bg-[#e8ded0]">
                      {pickImage(product) ? <img src={pickImage(product)} alt="" className="h-full w-full object-cover" /> : null}
                    </span>
                  ))}
                </div>
                <div className="min-w-0">
                  <p className="text-sm sm:text-lg text-[#d29a4c] leading-none">{displayParticipantCount.toLocaleString()}+</p>
                  <p className="mt-1 text-[10px] sm:text-xs text-neutral-700">{isFr ? 'Participants' : 'Participants'}</p>
                  <p className="hidden sm:block mt-0.5 text-[10px] leading-snug text-neutral-500">
                    {isFr ? 'Rejoignez des milliers de personnes qui gagnent gros.' : 'Join thousands of people winning big!'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop Caps Section - New Design */}
      <section id="shop-caps" className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b88238]">
            {currentShopCaps?.eyebrow || (isFr ? 'Collection casquettes' : 'Shop caps')}
          </p>
          <h2 className="mt-1 text-2xl font-black">
            {currentShopCaps?.title || (isFr ? 'Choisissez votre casquette' : 'Choose Your Cap')}
          </h2>

          <div className="mt-6 grid gap-6 lg:grid-cols-[200px_1fr] lg:items-start">
            {/* Left: Benefits */}
            <div className="flex flex-col gap-4">
              {currentShopBenefits.map((benefit, index) => {
                const IconComp = resolveBenefitIcon(benefit.icon);
                return (
                  <div key={`${benefit.title}-${index}`} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f3eadb] flex items-center justify-center shrink-0">
                      <IconComp className="w-5 h-5 text-[#b88238]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-900">{benefit.title}</p>
                      <p className="text-xs text-neutral-500 leading-relaxed">{benefit.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Product Cards */}
            <div>
              {shopProducts.length ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {shopProducts.map((product) => (
                    <Link key={product._id} href={productPath(product)} className="group rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-shadow flex flex-col">
                      <div className="h-28 sm:h-32 lg:h-[132px] rounded-lg bg-[#f5f0e8] p-2 flex items-center justify-center">
                        {pickImage(product) ? (
                          <img src={pickImage(product)} alt={isFr ? product.name : (product.nameEn || product.name)} className="h-full w-full object-contain group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-neutral-300"><ShoppingCart className="h-10 w-10" /></div>
                        )}
                      </div>
                      <h3 className="mt-2 text-sm font-bold text-neutral-900 leading-tight">{isFr ? product.name : (product.nameEn || product.name)}</h3>
                      <p className="mt-1 text-sm font-bold text-neutral-900 leading-tight">${Number(product.price || 0).toFixed(2)}</p>
                      <div className="mt-1.5 flex min-h-4 items-center gap-2">
                        {(product.colors || []).slice(0, 4).map((color, index) => (
                          <span key={`${color.name}-${index}`} className="h-4 w-4 rounded-full border border-neutral-200" style={{ backgroundColor: color.hex || '#ddd' }} />
                        ))}
                      </div>
                      <div className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-bold uppercase text-white hover:bg-neutral-800 transition-colors">
                        <ShoppingCart className="h-4 w-4" />
                        {isFr ? 'Acheter et entrer' : 'Buy & Enter'}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-sm text-neutral-500">{isFr ? 'Aucun produit actif.' : 'No active products yet.'}</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Prizes Section - New Design */}
      <section id="prizes" className="border-t border-black/5 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b88238]">{isFr ? 'Prix premium' : 'Amazing prizes'}</p>
              <h2 className="mt-1 text-2xl font-black">{isFr ? 'Des prix qui changent la vie' : 'Win Life-Changing Prizes'}</h2>
            </div>
            <button 
              onClick={() => setPrizeModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-xs font-bold uppercase text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              {isFr ? 'Voir tous les prix' : 'View All Prizes'} <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {prizeItems.length ? (
            <div className="mt-5 relative">
              {/* Slider Container */}
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-300 ease-out sm:grid sm:grid-cols-3 sm:gap-4"
                  style={{ transform: `translateX(-${prizeSlide * 100}%)` }}
                >
                  {prizeItems.map((prize, index) => (
                    <div key={`${prize.raffle?._id || index}-${index}`} className="w-full flex-shrink-0 px-1 sm:px-0">
                      <div className="relative rounded-xl bg-white p-5 text-center shadow-sm ring-1 ring-black/5 h-full">
                        {/* Prize Badge */}
                        <div className="absolute left-4 top-0 bg-[#b88238] px-3 py-2 text-[10px] font-black uppercase text-white" style={{ borderRadius: '0 0 4px 4px' }}>
                          {index === 0 ? '1st' : index === 1 ? '2nd' : '3rd'} Prize
                        </div>
                        {prize.image ? (
                          <img src={prize.image} alt={isFr ? prize.name : prize.nameEn || prize.name} className="mx-auto h-40 w-full object-contain mt-4" />
                        ) : (
                          <div className="mx-auto flex h-40 items-center justify-center text-[#b88238] mt-4"><Trophy className="h-12 w-12" /></div>
                        )}
                        <h3 className="mt-4 text-sm font-bold text-neutral-900">{isFr ? prize.name : prize.nameEn || prize.name}</h3>
                        {prize.value ? <p className="mt-1 text-xs font-bold text-[#b88238]">Value: ${Number(prize.value).toLocaleString()}</p> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Navigation Arrows */}
              <button 
                onClick={() => setPrizeSlide(prev => Math.max(0, prev - 1))}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:hidden w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-neutral-700 disabled:opacity-30"
                disabled={prizeSlide === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setPrizeSlide(prev => Math.min(prizeItems.length - 1, prev + 1))}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:hidden w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-neutral-700 disabled:opacity-30"
                disabled={prizeSlide >= prizeItems.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-neutral-300 p-8 text-sm text-neutral-500">{isFr ? 'Ajoutez des prix.' : 'Add raffle prizes from admin.'}</div>
          )}

          {/* Mobile View All Button */}
          <div className="mt-4 sm:hidden">
            <button 
              onClick={() => setPrizeModalOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 px-4 py-2.5 text-xs font-bold uppercase text-neutral-700"
            >
              {isFr ? 'Voir tous les prix' : 'View All Prizes'} <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Prize Dots Indicator */}
          {prizeItems.length > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2 sm:hidden">
              {prizeItems.map((_, dot) => (
                <button
                  key={dot}
                  onClick={() => setPrizeSlide(dot)}
                  className={`h-2 w-2 rounded-full transition-colors ${dot === prizeSlide ? 'bg-[#b88238]' : 'bg-neutral-300'}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Prize Modal */}
      <AnimatePresence>
        {prizeModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setPrizeModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[80vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b88238]">{isFr ? 'Prix premium' : 'Amazing prizes'}</p>
                  <h2 className="mt-1 text-xl font-black">{isFr ? 'Tous les prix' : 'All Prizes'}</h2>
                </div>
                <button onClick={() => setPrizeModalOpen(false)} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              {allPrizes.length > 0 ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {modalPrizeItems.map((prize, index) => (
                      <div key={`modal-${prize.raffleName || ''}-${index}`} className="relative rounded-xl bg-neutral-50 p-4 text-center border border-neutral-100">
                        <div className="absolute left-3 top-0 bg-[#b88238] px-2.5 py-1.5 text-[10px] font-black uppercase text-white" style={{ borderRadius: '0 0 4px 4px' }}>
                          {prize.rank}{prize.rank === 1 ? 'st' : prize.rank === 2 ? 'nd' : prize.rank === 3 ? 'rd' : 'th'} Prize
                        </div>
                        {prize.image ? (
                          <img src={prize.image} alt={isFr ? prize.name : prize.nameEn || prize.name} className="mx-auto h-32 w-full object-contain mt-6" />
                        ) : (
                          <div className="mx-auto flex h-32 items-center justify-center text-[#b88238] mt-6"><Trophy className="h-10 w-10" /></div>
                        )}
                        <h3 className="mt-3 text-sm font-bold text-neutral-900">{isFr ? prize.name : prize.nameEn || prize.name}</h3>
                        {prize.value ? <p className="mt-1 text-xs font-bold text-[#b88238]">Value: ${Number(prize.value).toLocaleString()}</p> : null}
                        <p className="mt-1 text-[10px] text-neutral-400">{prize.raffleName}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {prizePages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-6">
                      <button 
                        onClick={() => setPrizePage(p => Math.max(0, p - 1))}
                        disabled={prizePage === 0}
                        className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-sm text-neutral-600">{prizePage + 1} / {prizePages}</span>
                      <button 
                        onClick={() => setPrizePage(p => Math.min(prizePages - 1, p + 1))}
                        disabled={prizePage >= prizePages - 1}
                        className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-neutral-400">
                  <Trophy className="w-10 h-10 mx-auto mb-3" />
                  <p className="text-sm">{isFr ? 'Aucun prix disponible.' : 'No prizes available.'}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* How It Works */}
      <section id="how-it-works" className="py-10 sm:py-14 bg-[#fbfaf8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c28a3d]">{isFr ? 'Comment ca marche' : 'How it works'}</p>
          <h2 className="mt-1 text-[24px] sm:text-[28px] font-black leading-tight text-[#15120f]">{isFr ? 'Etapes simples pour gagner' : 'Simple steps to win'}</h2>

          <div className="mt-8 hidden md:flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.title} className="flex items-center">
                <div className="flex w-[260px] items-center gap-5 text-left">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white text-[#c28a3d] shadow-[0_12px_35px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.03]">
                    <step.icon className={`h-9 w-9 ${index === 0 ? 'text-[#15120f]' : 'text-[#d29a4c]'}`} strokeWidth={1.7} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black text-[#c28a3d] leading-none">0{index + 1}</p>
                    <h3 className="mt-2 text-sm font-black text-[#15120f] leading-tight">{step.title}</h3>
                    <p className="mt-1.5 text-[11px] leading-[1.55] text-neutral-600">{step.text}</p>
                  </div>
                </div>
                {index < steps.length - 1 ? (
                  <div className="mx-7 flex w-12 items-center text-neutral-400">
                    <span className="h-px flex-1 bg-neutral-300" />
                    <span className="-ml-1 text-lg leading-none">→</span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-7 md:hidden max-w-[320px] mx-auto text-left">
            {steps.map((step, index) => (
              <div key={step.title} className="relative flex gap-5 pb-7 last:pb-0">
                {index < steps.length - 1 ? <span className="absolute left-9 top-[72px] h-[34px] w-px bg-neutral-200" /> : null}
                <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-white text-[#c28a3d] shadow-[0_12px_35px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.03]">
                  <step.icon className={`h-8 w-8 ${index === 0 ? 'text-[#15120f]' : 'text-[#d29a4c]'}`} strokeWidth={1.7} />
                </div>
                <div className="pt-1">
                  <p className="text-[11px] font-black text-[#c28a3d] leading-none">0{index + 1}</p>
                  <h3 className="mt-2 text-sm font-black text-[#15120f] leading-tight">{step.title}</h3>
                  <p className="mt-1.5 text-[12px] leading-[1.55] text-neutral-600">{step.text}</p>
                </div>
              </div>
            ))}
          </div>

          <Link href="/products" className="mt-8 inline-flex h-12 min-w-[230px] items-center justify-center gap-3 rounded-md bg-[#dfb778] px-6 text-[12px] font-black uppercase text-black shadow-[0_10px_24px_rgba(194,138,61,0.2)] hover:bg-[#e7c48c] transition-colors">
            {isFr ? 'Acheter et entrer' : 'Buy cap & enter'} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl bg-black p-5 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
              {trustItems.map((item, index) => (
                <div key={item.title} className={`flex items-center gap-4 px-4 py-4 ${index === 0 ? 'lg:pl-0' : ''} ${index === 3 ? 'lg:pr-0' : ''}`}>
                  <div className="shrink-0">
                    <item.icon className="h-8 w-8 text-[#e2bd87]" strokeWidth={1.2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white leading-tight">{item.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-white/50">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Winner Featured Banner (if any) */}
      {winners.length > 0 && (
        <section className="py-8 sm:py-10 bg-white border-y border-neutral-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {(() => {
              const winner = winners[0];
              const avatar = winner.user?.avatar;
              return (
                <div className="rounded-2xl bg-[#faf9f6] border border-[#ebe7df] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
                  <div className="flex items-center gap-4 sm:gap-6 text-center sm:text-left flex-col sm:flex-row">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-full bg-[#f3eadb] flex items-center justify-center text-[#b88238] ring-4 ring-[#e8d3b6] shrink-0">
                      {avatar ? (
                        <img src={avatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Trophy className="h-8 w-8 text-[#b47b24]" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-center sm:justify-start gap-2.5">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b47b24]">
                          {isFr ? 'Gagnant récent' : 'Recent Winner'}
                        </span>
                        <span className="px-2.5 py-0.5 bg-[#e8d3b6] text-[#8b6914] text-[10px] font-bold uppercase rounded-full">
                          {isFr ? 'Gagné' : 'Won'}
                        </span>
                      </div>
                      <h3 className="mt-1 font-black text-lg sm:text-xl text-neutral-900">
                        {winner.user?.firstName} {winner.user?.lastName}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
                        {isFr ? 'A remporté :' : 'Won:'} <span className="font-bold text-neutral-900">{isFr ? winner.prize : winner.prizeEn || winner.prize}</span>
                      </p>
                      <p className="text-xs sm:text-sm text-neutral-500 italic mt-1">
                        &ldquo;{isFr ? (winner.quote || 'Je n\'arrive pas à y croire ! Merci Regar !') : (winner.quoteEn || winner.quote || 'Can\'t believe I won! Thank you Regar!')}&rdquo;
                      </p>
                    </div>
                  </div>
                  <Link 
                    href="/winners" 
                    className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#111] hover:bg-[#b47b24] text-white px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
                  >
                    {isFr ? 'Voir tous les gagnants' : 'See all winners'} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })()}
          </div>
        </section>
      )}

      {/* Reviews Section - preview 4.html style */}
      <section className="reviews-section">
        <div className="reviews-container">
          <div className="reviews-header">
            <span>{isFr ? 'VRAIS GAGNANTS. VRAIES EXPÉRIENCES.' : 'REAL WINNERS. REAL EXPERIENCES.'}</span>
            <h2>{isFr ? 'La confiance de nos participants' : 'Trusted by Our Participants'}</h2>
            <p>{isFr ? 'Découvrez ce que nos gagnants et participants disent de leur expérience.' : 'See what our winners and participants have to say about their experience.'}</p>
          </div>

          <div className="reviews-slider">
            <div className="reviews-track">
              {marqueeReviews.map((review, idx) => {
                const avatar = review.avatar || review.user?.avatar;
                return (
                  <div key={`${review._id || idx}-${idx}`} className="review-card">
                    <div className="review-top">
                      <span className="quote">&ldquo;</span>
                      <div className="stars">
                        {'★'.repeat(Math.max(1, Math.min(5, Number(review.rating || 5))))}
                      </div>
                    </div>

                    <p>
                      {isFr ? review.comment : review.commentEn || review.comment}
                    </p>

                    <div className="review-user">
                      {avatar ? (
                        <img src={avatar} alt={review.name || 'User'} />
                      ) : (
                        <div className="review-user-avatar bg-[#f3eadb] flex items-center justify-center text-sm font-bold text-[#b47b24] shrink-0">
                          {review.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div>
                        <strong>{review.name}</strong>
                        <small>✓ {isFr ? 'Participant vérifié' : 'Verified Participant'}</small>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>


      {/* Newsletter */}
      <section className="pb-8 sm:pb-0 bg-[#e8d3b6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
            {/* Left: Recent Raffle Image */}
            {runningRaffleImage && (
              <div className="w-full sm:w-48 shrink-0 flex items-center justify-center">
                <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                  <img
                    src={runningRaffleImage}
                    alt={heroName || 'Raffle'}
                    className="w-full h-full object-cover rounded-2xl drop-shadow-xl"
                  />
                </div>
              </div>
            )}
            
            {/* Middle: Content */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-900">{isFr ? 'Ne manquez rien !' : "Don't Miss Out!"}</h2>
              <p className="mt-2 text-sm text-neutral-700 max-w-md">{isFr ? 'Rejoignez notre communaute et recevez des mises a jour exclusives sur les nouvelles tombolas et offres speciales.' : 'Join our community and get exclusive updates on new raffles and special offers.'}</p>
            </div>

            {/* Right: Form */}
            <form onSubmit={handleNewsletter} className="w-full sm:w-auto shrink-0 flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isFr ? 'Votre email' : 'Enter your email'}
                className="min-w-0 sm:w-56 rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none"
              />
              <button type="submit" className="rounded-lg bg-black px-6 py-3 text-xs font-black uppercase text-white whitespace-nowrap">
                {isFr ? 'Subscribe' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
