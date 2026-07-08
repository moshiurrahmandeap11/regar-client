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

export default function HomePage() {
  const locale = useLocale();
  const [products, setProducts] = useState([]);
  const [raffles, setRaffles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [winners, setWinners] = useState([]);
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
        const [productRes, raffleRes, reviewRes, winnerRes] = await Promise.all([
          api.get('/api/products?featured=true&active=true'),
          api.get('/api/raffles?status=active'),
          api.get('/api/reviews?limit=4'),
          api.get(`/api/tickets/winners?limit=4&t=${Date.now()}`),
        ]);
        setProducts(Array.isArray(productRes.data) ? productRes.data : []);
        setRaffles(Array.isArray(raffleRes.data) ? raffleRes.data : []);
        setReviews(Array.isArray(reviewRes.data) ? reviewRes.data : []);
        setWinners(Array.isArray(winnerRes.data) ? winnerRes.data : []);
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

  const headline = isFr ? ['Achetez une casquette.', 'Gagnez gros.'] : ['Buy a cap.', 'Win big.'];
  const heroName = heroRaffle ? (isFr ? heroRaffle.name : heroRaffle.nameEn || heroRaffle.name) : '';
  const participantCount = Math.max(0, ...raffles.map((raffle) => Number(raffle.ticketCount || raffle.product?.soldTickets || 0)));
  const displayParticipantCount = Math.max(participantCount, 10000);

  // Running raffle image for the countdown section (first prize image or product image)
  const runningRaffleImage = heroRaffle?.prizes?.[0]?.image || heroImage || '';

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
    { icon: ShieldCheck, title: isFr ? '100% securise' : '100% Secure', text: isFr ? 'Vos donnees restent protegees.' : 'Your data is always safe with us.' },
    { icon: Award, title: isFr ? 'Equitable' : 'Fair and Transparent', text: isFr ? 'Tirage aleatoire verifie.' : 'Random and verified winner selection.' },
    { icon: Trophy, title: isFr ? 'Gagnants verifies' : 'Verified Winners', text: isFr ? 'Vrais participants, vrais prix.' : 'Real people, real prizes.' },
    { icon: Globe2, title: isFr ? 'Livraison mondiale' : 'Worldwide Shipping', text: isFr ? 'Livraison rapide et fiable.' : 'Fast and reliable delivery.' },
  ];

  const steps = [
    { icon: ShoppingCart, title: isFr ? 'Acheter' : 'Buy a Cap', text: isFr ? 'Choisissez votre casquette et finalisez la commande.' : 'Choose your favorite cap and complete your purchase.' },
    { icon: Ticket, title: isFr ? 'Recevoir les tickets' : 'Get Entries', text: isFr ? 'Chaque casquette payee ajoute vos tickets au raffle.' : 'Every paid cap adds your entries to the current raffle.' },
    { icon: Trophy, title: isFr ? 'Gagner' : 'Win Big', text: isFr ? 'Attendez le tirage et devenez le gagnant.' : 'Wait for the draw and be the lucky winner.' },
  ];

  const shopBenefits = [
    { icon: Gem, title: isFr ? 'Premium Quality' : 'Premium Quality', text: isFr ? 'High quality materials, built to last.' : 'High quality materials, built to last.' },
    { icon: Ticket, title: isFr ? 'One Cap, Multiple Entries' : 'One Cap, Multiple Entries', text: isFr ? 'Every purchase gives you raffle entries.' : 'Every purchase gives you raffle entries.' },
    { icon: Truck, title: isFr ? 'Worldwide Shipping' : 'Worldwide Shipping', text: isFr ? 'Fast & reliable delivery to your door.' : 'Fast & reliable delivery to your door.' },
  ];

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
              src={HERO_BANNER_IMAGE}
              alt="Regar cap raffle campaign"
              className="absolute left-0 top-[56%] h-full w-full -translate-y-1/2 object-cover object-[42%_center] opacity-100 lg:top-[58%] lg:h-auto lg:w-full lg:max-w-none 2xl:top-[57%]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.80)_0%,rgba(0,0,0,0.54)_22%,rgba(0,0,0,0.20)_43%,rgba(0,0,0,0)_70%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0)_60%,rgba(0,0,0,0.18)_100%)]" />
          </div>

          <div className="relative min-h-[inherit] px-6 py-12 sm:px-8 sm:py-12 lg:px-12 lg:py-14 xl:px-14">
            <div className="max-w-[320px] sm:max-w-[460px] lg:max-w-[500px]">
            <div className="inline-flex items-center gap-2 rounded-md border border-[#e2bd87]/45 bg-black/20 px-2.5 py-1 text-[10px] sm:text-xs font-black uppercase tracking-[0.06em] text-white shadow-[0_8px_28px_rgba(0,0,0,0.22)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#e2bd87]" />
              {heroRaffle ? (isFr ? 'Raffle en direct' : 'Live raffle') : (isFr ? 'Raffle bientot' : 'Raffle coming soon')}
            </div>

            <h1 className="mt-3 text-[42px] sm:text-[56px] lg:text-[68px] font-black uppercase leading-[0.92] tracking-normal drop-shadow-[0_2px_18px_rgba(0,0,0,0.42)]">
              {headline[0]}
              <span className="block text-[#e9c58c]">{headline[1]}</span>
            </h1>

            <p className="mt-3 max-w-[290px] sm:max-w-[360px] text-sm sm:text-[15px] text-white/88 leading-relaxed">
              {isFr ? 'Achetez une casquette et obtenez une entree automatique pour gagner des prix de grande valeur.' : 'Purchase a cap and get automatic entry to win high-value prizes.'}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link href="/products" className="inline-flex items-center gap-3 rounded-md bg-[#e9c58c] px-5 py-3 text-[11px] sm:text-xs font-black uppercase text-black shadow-[0_12px_30px_rgba(226,189,135,0.24)] hover:bg-[#f1d09b] transition-colors">
                {isFr ? 'Acheter et entrer' : 'Buy cap & enter'} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/#how-it-works" className="inline-flex items-center gap-2 rounded-md px-1 py-2 text-[11px] sm:text-xs font-black uppercase text-white">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e9c58c]/65 bg-black/18">
                  <PlayCircle className="h-4 w-4 text-[#e9c58c]" />
                </span>
                {isFr ? 'Comment ca marche' : 'How it works'}
              </Link>
            </div>

            {/* Countdown Timer */}
            <div className="mt-8 w-full max-w-[330px] rounded-lg border border-white/10 bg-black/28 px-4 py-4 shadow-[0_18px_45px_rgba(0,0,0,0.24)] sm:max-w-[470px] sm:px-6 sm:py-5">
              <p className="text-center text-[9px] sm:text-[10px] font-black uppercase tracking-[0.16em] text-[#e9c58c]">
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

            <div className="mt-5 hidden sm:flex flex-wrap items-center gap-4 text-[11px] font-bold text-white/82">
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
                  <p className="text-sm sm:text-lg font-black text-[#d29a4c] leading-none">{displayParticipantCount.toLocaleString()}+</p>
                  <p className="mt-1 text-[10px] sm:text-xs font-bold text-neutral-700">{isFr ? 'Participants' : 'Participants'}</p>
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
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b88238]">{isFr ? 'Shop caps' : 'Shop caps'}</p>
          <h2 className="mt-1 text-2xl font-black">{isFr ? 'Choisissez votre casquette' : 'Choose Your Cap'}</h2>

          <div className="mt-6 grid gap-6 lg:grid-cols-[200px_1fr] lg:items-start">
            {/* Left: Benefits */}
            <div className="flex flex-col gap-4">
              {shopBenefits.map((benefit) => (
                <div key={benefit.title} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f3eadb] flex items-center justify-center shrink-0">
                    <benefit.icon className="w-5 h-5 text-[#b88238]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900">{benefit.title}</p>
                    <p className="text-xs text-neutral-500 leading-relaxed">{benefit.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Product Cards */}
            <div>
              {shopProducts.length ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {shopProducts.map((product) => (
                    <Link key={product._id} href={productPath(product)} className="group rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-shadow flex flex-col">
                      <div className="h-28 sm:h-32 lg:h-[132px] rounded-lg bg-[#f5f0e8] p-2 flex items-center justify-center">
                        {pickImage(product) ? (
                          <img src={pickImage(product)} alt={product.name} className="h-full w-full object-contain group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-neutral-300"><ShoppingCart className="h-10 w-10" /></div>
                        )}
                      </div>
                      <h3 className="mt-2 text-sm font-bold text-neutral-900 leading-tight">{product.name}</h3>
                      <p className="mt-1 text-sm font-bold text-neutral-900 leading-tight">${Number(product.price || 0).toFixed(2)}</p>
                      <div className="mt-1.5 flex min-h-4 items-center gap-2">
                        {(product.colors || []).slice(0, 3).map((color, index) => (
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c28a3d]">{isFr ? 'Comment ca marche' : 'How it works'}</p>
          <h2 className="mt-1 text-[24px] sm:text-[28px] font-black leading-tight text-[#15120f]">{isFr ? 'Etapes simples pour gagner' : 'Simple steps to win'}</h2>

          <div className="mt-8 hidden md:flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.title} className="flex items-center">
                <div className="flex w-[188px] items-center gap-5 text-left">
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

          <div className="mt-7 md:hidden max-w-[260px] mx-auto text-left">
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
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-black p-4 sm:grid-cols-4">
            {trustItems.map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center gap-2">
                <item.icon className="h-6 w-6 text-[#e2bd87]" />
                <div>
                  <p className="text-xs font-black text-white">{item.title}</p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-white/50">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Winners */}
      {winners.length > 0 && (
        <section className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b88238]">
                  {isFr ? 'Gagnants recents' : 'Recent winners'}
                </p>
                <h2 className="mt-1 text-2xl font-black">
                  {isFr ? 'Les derniers gagnants Regar' : 'Latest Regar winners'}
                </h2>
              </div>
              <Link href="/winners" className="inline-flex w-fit items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-xs font-black uppercase text-neutral-900">
                {isFr ? 'Voir tous' : 'View all'} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {winners.slice(0, 3).map((winner) => {
                const avatar = winner.user?.avatar;
                return (
                  <div key={winner._id} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-full bg-[#f3eadb] flex items-center justify-center text-[#b88238]">
                        {avatar ? (
                          <img src={avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Trophy className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-black text-sm">
                          {winner.user?.firstName} {winner.user?.lastName?.charAt(0)}.
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {winner.raffle ? (isFr ? winner.raffle.name : winner.raffle.nameEn || winner.raffle.name) : ''}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 rounded-lg bg-neutral-50 p-4">
                      <p className="text-sm font-bold text-neutral-800">
                        {isFr ? winner.prize : winner.prizeEn || winner.prize}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {winner.ticket?.ticketNumber}
                        {winner.prizeValue ? ` • ${winner.prizeValue} CHF` : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Participant Reviews */}
      {reviews.length > 0 && (
        <section className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b88238]">
                  {isFr ? 'Avis participants' : 'What participants say'}
                </p>
                <h2 className="mt-1 text-2xl font-black">
                  {isFr ? 'Des acheteurs qui participent' : 'Cap owners joining the raffle'}
                </h2>
              </div>
              <p className="max-w-sm text-sm text-neutral-500">
                {isFr ? 'Les avis approuves par admin apparaissent ici.' : 'Admin-approved owner stories appear here.'}
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {reviews.slice(0, 3).map((review) => {
                const avatar = review.avatar || review.user?.avatar;
                return (
                  <div key={review._id} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-full bg-[#f3eadb] flex items-center justify-center text-sm font-black text-[#b88238]">
                          {avatar ? (
                            <img src={avatar} alt="" className="h-full w-full object-cover" />
                          ) : (
                            review.name?.charAt(0) || 'R'
                          )}
                        </div>
                        <div>
                          <p className="font-black text-sm">{review.name}</p>
                          <div className="mt-1 flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star
                                key={index}
                                className={`h-3.5 w-3.5 ${index < Number(review.rating || 0) ? 'fill-[#e2bd87] text-[#e2bd87]' : 'text-neutral-200'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <Quote className="h-6 w-6 text-[#e2bd87]" />
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-neutral-600">
                      {isFr ? review.comment : review.commentEn || review.comment}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl bg-[#e8d3b6] p-5 flex flex-col sm:flex-row items-center gap-6">
            {/* Left: Running Raffle Image */}
            {runningRaffleImage && (
              <div className="w-full sm:w-40 shrink-0">
                <div className="aspect-square rounded-xl overflow-hidden bg-white/50 border border-black/10">
                  <img 
                    src={runningRaffleImage} 
                    alt={heroName || 'Raffle'} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            
            {/* Right: Content */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-black">{isFr ? 'Ne manquez rien !' : "Don't miss out!"}</h2>
              <p className="mt-1 text-xs text-black/65">{isFr ? 'Recevez les nouveaux raffles et offres exclusives.' : 'Get exclusive updates on new raffles and special offers.'}</p>
              <form onSubmit={handleNewsletter} className="mt-4 flex gap-2 max-w-md">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isFr ? 'Votre email' : 'Enter your email'}
                  className="min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none"
                />
                <button type="submit" className="rounded-lg bg-black px-4 py-2.5 text-xs font-black uppercase text-white">
                  {isFr ? 'Subscribe' : 'Subscribe'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
