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
      <section className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0">
          {heroImage ? (
            <img src={heroImage} alt={heroProduct?.name || 'Regar raffle'} className="h-full w-full object-cover opacity-40" />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_70%_25%,#4b392b_0,#171410_45%,#050505_100%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 lg:py-24">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {heroRaffle ? (isFr ? 'Raffle en direct' : 'Live raffle') : (isFr ? 'Raffle bientot' : 'Raffle coming soon')}
            </div>

            <h1 className="mt-4 text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-[0.95] tracking-normal">
              {headline[0]}
              <span className="block text-[#e2bd87]">{headline[1]}</span>
            </h1>

            <p className="mt-4 max-w-md text-sm text-white/70 leading-relaxed">
              {isFr ? 'Achetez une casquette active et obtenez automatiquement une entree pour gagner des prix premium.' : 'Purchase a cap and get automatic entry to win high-value prizes.'}
            </p>

            {heroName ? <p className="mt-2 text-xs uppercase tracking-[0.22em] text-[#e2bd87]">{heroName}</p> : null}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link href="/products" className="inline-flex items-center gap-2 rounded-lg bg-[#e2bd87] px-5 py-3 text-sm font-black uppercase text-black">
                {isFr ? 'Acheter et participer' : 'Buy cap & enter'}
              </Link>
              <Link href="/#how-it-works" className="inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-bold uppercase text-white border border-white/20">
                <PlayCircle className="h-5 w-5" />
                {isFr ? 'Comment ca marche' : 'How it works'}
              </Link>
            </div>

            {/* Countdown Timer */}
            <div className="mt-6 max-w-md rounded-xl border border-white/10 bg-black/50 p-4 backdrop-blur">
              <p className="text-center text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">
                {isFr ? 'Fin du raffle dans' : 'Raffle ends in'}
              </p>
              {heroRaffle?.endDate ? (
                <div className="mt-3 flex justify-center">
                  <CountdownTimer targetDate={heroRaffle.endDate} locale={locale} variant="banner" />
                </div>
              ) : (
                <p className="mt-3 text-center text-sm text-white/60">{isFr ? 'Date a confirmer' : 'Date to be confirmed'}</p>
              )}
              {/* Running Raffle Image */}
              {runningRaffleImage && (
                <div className="mt-4 flex justify-center">
                  <div className="w-24 h-24 rounded-xl overflow-hidden border border-white/20 bg-white/10">
                    <img src={runningRaffleImage} alt={heroName || 'Raffle'} className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Participants */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex -space-x-2">
              {shopProducts.slice(0, 3).map((product) => (
                <span key={product._id} className="h-8 w-8 overflow-hidden rounded-full border-2 border-white bg-[#e8ded0]">
                  {pickImage(product) ? <img src={pickImage(product)} alt="" className="h-full w-full object-cover" /> : null}
                </span>
              ))}
            </div>
            <div>
              <p className="text-sm font-black text-[#e2bd87]">{participantCount.toLocaleString()}+</p>
              <p className="text-[10px] text-white/60">{isFr ? 'Participants actifs' : 'Active Participants'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Shop Caps Section - New Design */}
      <section id="shop-caps" className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b88238]">{isFr ? 'Shop caps' : 'Shop caps'}</p>
          <h2 className="mt-1 text-2xl font-black">{isFr ? 'Choisissez votre casquette' : 'Choose Your Cap'}</h2>

          <div className="mt-6 flex flex-col lg:flex-row gap-6">
            {/* Left: Benefits */}
            <div className="lg:w-48 flex flex-col gap-4">
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
            <div className="flex-1">
              {shopProducts.length ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {shopProducts.map((product) => (
                    <Link key={product._id} href={productPath(product)} className="group rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-shadow">
                      <div className="aspect-square rounded-lg bg-[#f5f0e8] p-4 flex items-center justify-center">
                        {pickImage(product) ? (
                          <img src={pickImage(product)} alt={product.name} className="h-full w-full object-contain group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-neutral-300"><ShoppingCart className="h-10 w-10" /></div>
                        )}
                      </div>
                      <h3 className="mt-3 text-sm font-bold text-neutral-900">{product.name}</h3>
                      <p className="mt-1 text-sm font-bold text-neutral-900">${Number(product.price || 0).toFixed(2)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        {(product.colors || []).slice(0, 3).map((color, index) => (
                          <span key={`${color.name}-${index}`} className="h-4 w-4 rounded-full border border-neutral-200" style={{ backgroundColor: color.hex || '#ddd' }} />
                        ))}
                      </div>
                      <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-xs font-bold uppercase text-white hover:bg-neutral-800 transition-colors">
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
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {prizeItems.map((prize, index) => (
                <div key={`${prize.raffle?._id || index}-${index}`} className="relative rounded-xl bg-white p-5 text-center shadow-sm ring-1 ring-black/5">
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
              ))}
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
          {prizeItems.length > 0 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              {[0, 1, 2].map((dot) => (
                <span key={dot} className={`h-2 w-2 rounded-full ${dot === 0 ? 'bg-[#b88238]' : 'bg-neutral-300'}`} />
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
      <section id="how-it-works" className="py-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b88238]">{isFr ? 'Comment ca marche' : 'How it works'}</p>
          <h2 className="mt-1 text-2xl font-black">{isFr ? 'Etapes simples pour gagner' : 'Simple steps to win'}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-xl bg-white p-5 text-left shadow-sm ring-1 ring-black/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f3eadb] text-[#b88238]">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-black text-[#b88238]">0{index + 1}</span>
                </div>
                <h3 className="mt-4 font-black text-sm">{step.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-neutral-500">{step.text}</p>
              </div>
            ))}
          </div>
          <Link href="/products" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#e2bd87] px-5 py-2.5 text-sm font-black uppercase text-black">
            {isFr ? 'Acheter et participer' : 'Buy cap & enter'} <ArrowRight className="h-4 w-4" />
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
