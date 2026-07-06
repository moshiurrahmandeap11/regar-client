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
  const participantCount = Math.max(
    0,
    ...raffles.map((raffle) => Number(raffle.ticketCount || raffle.product?.soldTickets || 0))
  );

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
    <main className="bg-[#f8f5ef] text-[#171410]">
      <section className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0">
          {heroImage ? (
            <img src={heroImage} alt={heroProduct?.name || 'Regar raffle'} className="h-full w-full object-cover opacity-55" />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_70%_25%,#4b392b_0,#171410_45%,#050505_100%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/72 to-black/20" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-24">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {heroRaffle ? (isFr ? 'Raffle en direct' : 'Live raffle') : (isFr ? 'Raffle bientot' : 'Raffle coming soon')}
            </div>

            <h1 className="mt-5 text-4xl sm:text-6xl lg:text-7xl font-black uppercase leading-[0.92] tracking-normal">
              {headline[0]}
              <span className="block text-[#e2bd87]">{headline[1]}</span>
            </h1>

            <p className="mt-5 max-w-md text-sm sm:text-base text-white/80 leading-relaxed">
              {isFr
                ? 'Achetez une casquette active et obtenez automatiquement une entree pour gagner des prix premium.'
                : 'Purchase a cap and get automatic entry to win high-value prizes.'}
            </p>

            {heroName ? (
              <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[#e2bd87]">{heroName}</p>
            ) : null}

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/products" className="inline-flex items-center gap-2 rounded-lg bg-[#e2bd87] px-5 py-3 text-sm font-black uppercase text-black hover:bg-[#efcf9e]">
                {isFr ? 'Acheter et participer' : 'Buy cap and enter'}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/#how-it-works" className="inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-bold uppercase text-white hover:bg-white/10">
                <PlayCircle className="h-5 w-5" />
                {isFr ? 'Comment ca marche' : 'How it works'}
              </Link>
            </div>

            <div className="mt-8 max-w-md rounded-xl border border-white/10 bg-black/35 p-4 backdrop-blur">
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
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 max-w-lg text-xs text-white/80 sm:flex sm:items-center sm:gap-7">
            {trustItems.slice(0, 3).map((item) => (
              <div key={item.title} className="flex items-center gap-2">
                <item.icon className="h-4 w-4 text-[#e2bd87]" />
                <span>{item.title}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 ml-auto max-w-xs rounded-xl bg-white p-4 text-black shadow-2xl sm:absolute sm:right-8 sm:bottom-8">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {shopProducts.slice(0, 3).map((product) => (
                  <span key={product._id} className="h-9 w-9 overflow-hidden rounded-full border-2 border-white bg-[#e8ded0]">
                    {pickImage(product) ? <img src={pickImage(product)} alt="" className="h-full w-full object-cover" /> : null}
                  </span>
                ))}
              </div>
              <div>
                <p className="text-lg font-black text-[#b88238]">{participantCount.toLocaleString()}+</p>
                <p className="text-xs text-neutral-500">{isFr ? 'Participants actifs' : 'Participants'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="shop-caps" className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b88238]">{isFr ? 'Shop caps' : 'Shop caps'}</p>
              <h2 className="mt-2 text-3xl font-black">{isFr ? 'Choisissez votre casquette' : 'Choose your cap'}</h2>
              <div className="mt-8 space-y-5">
                {[
                  [Award, isFr ? 'Qualite premium' : 'Premium Quality', isFr ? 'Matiere durable et finition propre.' : 'High quality materials, built to last.'],
                  [Ticket, isFr ? 'Entrees multiples' : 'One Cap, Multiple Entries', isFr ? 'Chaque achat vous ajoute au raffle.' : 'Every purchase gives raffle entries.'],
                  [Globe2, isFr ? 'Livraison mondiale' : 'Worldwide Shipping', isFr ? 'Livraison rapide a votre porte.' : 'Fast and reliable delivery to your door.'],
                ].map(([Icon, title, text]) => (
                  <div key={title} className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e2bd87]/25 text-[#9c6b2c]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black">{title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-neutral-500">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {shopProducts.length ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {shopProducts.map((product) => (
                  <Link key={product._id} href={productPath(product)} className="group rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl">
                    <div className="aspect-[1.25] rounded-lg bg-[#f0ebe3] p-3">
                      {pickImage(product) ? (
                        <img src={pickImage(product)} alt={product.name} className="h-full w-full object-contain transition duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-neutral-300"><ShoppingCart className="h-10 w-10" /></div>
                      )}
                    </div>
                    <h3 className="mt-4 text-base font-black">{product.name}</h3>
                    <p className="mt-1 text-sm font-bold">{Number(product.price || 0).toFixed(2)} CHF</p>
                    <div className="mt-2 flex gap-1.5">
                      {(product.colors || []).slice(0, 4).map((color, index) => (
                        <span key={`${color.name}-${index}`} className="h-4 w-4 rounded-full border border-neutral-200" style={{ backgroundColor: color.hex || '#ddd' }} />
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-xs font-black uppercase text-white">
                      <ShoppingCart className="h-4 w-4" />
                      {isFr ? 'Acheter et entrer' : 'Buy and enter'}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-sm text-neutral-500">
                {isFr ? 'Aucun produit actif pour le moment.' : 'No active products yet.'}
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="prizes" className="border-t border-black/5 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b88238]">{isFr ? 'Prix premium' : 'Amazing prizes'}</p>
              <h2 className="mt-2 text-3xl font-black">{isFr ? 'Des prix qui changent la vie' : 'Win life-changing prizes'}</h2>
            </div>
            <Link href="/raffles" className="hidden rounded-lg border border-[#d2b68a] px-4 py-2 text-xs font-black uppercase sm:inline-flex">
              {isFr ? 'Voir les prix' : 'View all prizes'} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {prizeItems.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {prizeItems.map((prize, index) => (
                <div key={`${prize.raffle?._id}-${index}`} className="relative rounded-xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5">
                  <div className="absolute left-4 top-0 rounded-b bg-[#b88238] px-3 py-3 text-xs font-black uppercase text-white">
                    {index + 1}{index === 0 ? 'st' : index === 1 ? 'nd' : 'rd'}<br />Prize
                  </div>
                  {prize.image ? (
                    <img src={prize.image} alt={prize.name} className="mx-auto h-40 w-full object-contain" />
                  ) : (
                    <div className="mx-auto flex h-40 items-center justify-center text-[#b88238]"><Trophy className="h-16 w-16" /></div>
                  )}
                  <h3 className="mt-4 font-black">{isFr ? prize.name : prize.nameEn || prize.name}</h3>
                  {prize.value ? <p className="mt-1 text-sm font-bold text-[#b88238]">Value: {Number(prize.value).toLocaleString()} CHF</p> : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-dashed border-neutral-300 p-8 text-sm text-neutral-500">
              {isFr ? 'Ajoutez des prix depuis le panel admin pour les afficher ici.' : 'Add raffle prizes from the admin panel to show them here.'}
            </div>
          )}
        </div>
      </section>

      <section id="how-it-works" className="py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b88238]">{isFr ? 'Comment ca marche' : 'How it works'}</p>
          <h2 className="mt-2 text-3xl font-black">{isFr ? 'Etapes simples pour gagner' : 'Simple steps to win'}</h2>
          <div className="mt-9 grid gap-5 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-xl bg-white p-6 text-left shadow-sm ring-1 ring-black/5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f3eadb] text-[#b88238]">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-black text-[#b88238]">0{index + 1}</span>
                </div>
                <h3 className="mt-5 font-black">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">{step.text}</p>
              </div>
            ))}
          </div>
          <Link href="/products" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#e2bd87] px-6 py-3 text-sm font-black uppercase text-black">
            {isFr ? 'Acheter et participer' : 'Buy cap and enter'} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 rounded-xl bg-black p-6 text-white sm:grid-cols-2 lg:grid-cols-4">
            {trustItems.map((item) => (
              <div key={item.title} className="flex gap-3">
                <item.icon className="h-7 w-7 shrink-0 text-[#e2bd87]" />
                <div>
                  <p className="text-sm font-black">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/60">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b88238]">{isFr ? 'Gagnant recent' : 'Recent winner'}</p>
              {winners[0] ? (
                <div className="mt-5 flex gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f3eadb] text-[#b88238]"><Trophy className="h-7 w-7" /></div>
                  <div>
                    <p className="font-black">{winners[0].user?.firstName} {winners[0].user?.lastName}</p>
                    <p className="mt-1 text-xs text-neutral-500">{winners[0].prizeEn || winners[0].prize || '-'}</p>
                    <span className="mt-2 inline-flex rounded-full bg-[#e2bd87] px-2 py-0.5 text-[10px] font-black uppercase text-black">Won</span>
                  </div>
                </div>
              ) : (
                <p className="mt-5 text-sm text-neutral-500">{isFr ? 'Aucun gagnant pour le moment.' : 'No winners yet.'}</p>
              )}
              <Link href="/winners" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 px-4 py-3 text-xs font-black uppercase">
                {isFr ? 'Voir les gagnants' : 'See all winners'} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b88238]">{isFr ? 'Avis participants' : 'What our participants say'}</p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {(reviews.length ? reviews.slice(0, 2) : []).map((review) => (
                  <div key={review._id}>
                    <Quote className="h-8 w-8 text-[#e2bd87]" />
                    <p className="mt-3 text-sm leading-relaxed text-neutral-600">{isFr ? review.comment : review.commentEn || review.comment}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm font-black">{review.name || review.user?.firstName || 'Customer'}</p>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < Number(review.rating || 5) ? 'fill-[#e2bd87] text-[#e2bd87]' : 'text-neutral-300'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {!reviews.length ? <p className="text-sm text-neutral-500">{isFr ? 'Aucun avis pour le moment.' : 'No reviews yet.'}</p> : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 overflow-hidden rounded-xl bg-[#e8d3b6] p-6 sm:grid-cols-[220px_1fr] sm:items-center">
            <div className="hidden sm:block">
              {shopProducts[0] && pickImage(shopProducts[0]) ? (
                <img src={pickImage(shopProducts[0])} alt={shopProducts[0].name} className="h-28 w-full object-contain" />
              ) : null}
            </div>
            <div className="grid gap-4 lg:grid-cols-[1fr_420px] lg:items-center">
              <div>
                <h2 className="text-2xl font-black">{isFr ? 'Ne manquez rien !' : "Don't miss out!"}</h2>
                <p className="mt-1 text-sm text-black/65">{isFr ? 'Recevez les nouveaux raffles et offres exclusives.' : 'Join our community and get exclusive updates on new raffles and special offers.'}</p>
              </div>
              <form onSubmit={handleNewsletter} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={isFr ? 'Votre email' : 'Enter your email'}
                  className="min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                />
                <button type="submit" className="rounded-lg bg-black px-5 py-3 text-xs font-black uppercase text-white">
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
