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
} from 'lucide-react';
import api from '@/lib/api';
import { productPath } from '@/lib/productPath';
import CountdownTimer from '@/components/CountdownTimer';
import toast from 'react-hot-toast';

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
  const prizeItems = useMemo(() => {
    const activePrizes = raffles.flatMap((raffle) => (raffle.prizes || []).map((prize) => ({ ...prize, raffle })));
    return activePrizes.slice(0, 3);
  }, [raffles]);

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

      {/* Shop Caps Section */}
      <section id="shop-caps" className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b88238]">{isFr ? 'Shop caps' : 'Shop caps'}</p>
          <h2 className="mt-1 text-2xl font-black">{isFr ? 'Choisissez votre casquette' : 'Choose your cap'}</h2>

          {shopProducts.length ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shopProducts.map((product) => (
                <Link key={product._id} href={productPath(product)} className="group rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
                  <div className="aspect-[1.25] rounded-lg bg-[#f0ebe3] p-3">
                    {pickImage(product) ? (
                      <img src={pickImage(product)} alt={product.name} className="h-full w-full object-contain" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-neutral-300"><ShoppingCart className="h-10 w-10" /></div>
                    )}
                  </div>
                  <h3 className="mt-3 text-sm font-black">{product.name}</h3>
                  <p className="mt-1 text-sm font-bold">{Number(product.price || 0).toFixed(2)} CHF</p>
                  <div className="mt-2 flex gap-1.5">
                    {(product.colors || []).slice(0, 4).map((color, index) => (
                      <span key={`${color.name}-${index}`} className="h-4 w-4 rounded-full border border-neutral-200" style={{ backgroundColor: color.hex || '#ddd' }} />
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-xs font-black uppercase text-white">
                    <ShoppingCart className="h-4 w-4" />
                    {isFr ? 'Acheter et entrer' : 'Buy & enter'}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-neutral-300 p-8 text-sm text-neutral-500">{isFr ? 'Aucun produit actif.' : 'No active products yet.'}</div>
          )}
        </div>
      </section>

      {/* Prizes Section */}
      <section id="prizes" className="border-t border-black/5 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b88238]">{isFr ? 'Prix premium' : 'Amazing prizes'}</p>
              <h2 className="mt-1 text-2xl font-black">{isFr ? 'Des prix qui changent la vie' : 'Win life-changing prizes'}</h2>
            </div>
          </div>

          {prizeItems.length ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {prizeItems.map((prize, index) => (
                <div key={`${prize.raffle?._id}-${index}`} className="relative rounded-xl bg-white p-5 text-center shadow-sm ring-1 ring-black/5">
                  <div className="absolute left-4 top-0 rounded-b bg-[#b88238] px-3 py-2 text-[10px] font-black uppercase text-white">
                    {index + 1}{index === 0 ? 'st' : index === 1 ? 'nd' : 'rd'} Prize
                  </div>
                  {prize.image ? (
                    <img src={prize.image} alt={prize.name} className="mx-auto h-32 w-full object-contain" />
                  ) : (
                    <div className="mx-auto flex h-32 items-center justify-center text-[#b88238]"><Trophy className="h-12 w-12" /></div>
                  )}
                  <h3 className="mt-3 text-sm font-black">{isFr ? prize.name : prize.nameEn || prize.name}</h3>
                  {prize.value ? <p className="mt-1 text-xs font-bold text-[#b88238]">Value: {Number(prize.value).toLocaleString()} CHF</p> : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-neutral-300 p-8 text-sm text-neutral-500">{isFr ? 'Ajoutez des prix.' : 'Add raffle prizes from admin.'}</div>
          )}
        </div>
      </section>

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
          <div className="rounded-xl bg-[#e8d3b6] p-5">
            <h2 className="text-xl font-black">{isFr ? 'Ne manquez rien !' : "Don't miss out!"}</h2>
            <p className="mt-1 text-xs text-black/65">{isFr ? 'Recevez les nouveaux raffles et offres exclusives.' : 'Get exclusive updates on new raffles and special offers.'}</p>
            <form onSubmit={handleNewsletter} className="mt-4 flex gap-2">
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
      </section>
    </main>
  );
}
