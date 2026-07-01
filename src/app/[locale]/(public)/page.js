'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, ShoppingBag, Ticket, Trophy } from 'lucide-react';
import api from '@/lib/api';
import CountdownTimer from '@/components/CountdownTimer';
import ReviewCard from '@/components/ReviewCard';
import SectionTitle from '@/components/SectionTitle';
import { FadeIn, StaggerContainer, StaggerItem, HoverScale } from '@/components/animations';

export default function HomePage() {
  const t = useTranslations('Home');
  const locale = useLocale();
  const [products, setProducts] = useState([]);
  const [raffles, setRaffles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [winners, setWinners] = useState([]);
  const [heroContent, setHeroContent] = useState(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, raffleRes, reviewRes, winnerRes] = await Promise.all([
          api.get('/api/products?featured=true&active=true'),
          api.get('/api/raffles?status=active'),
          api.get('/api/reviews'),
          api.get('/api/tickets/winners'),
        ]);
        setProducts(prodRes.data.slice(0, 4));
        setRaffles(raffleRes.data.slice(0, 3));
        setReviews(reviewRes.data.slice(0, 4));
        setWinners(winnerRes.data.slice(0, 5));

        try {
          const heroRes = await api.get('/api/content/heroConfig');
          setHeroContent(heroRes.data || null);
        } catch {
          setHeroContent(null);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleNewsletter = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/content/newsletter', { email });
      setEmail('');
      alert(locale === 'fr' ? 'Inscription reussie !' : 'Subscribed successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error');
    }
  };

  const steps = [
    { icon: ShoppingBag, title: t('howItWorks.step1'), desc: t('howItWorks.step1Desc') },
    { icon: Ticket, title: t('howItWorks.step2'), desc: t('howItWorks.step2Desc') },
    { icon: Trophy, title: t('howItWorks.step3'), desc: t('howItWorks.step3Desc') },
  ];

  const defaultHeroText = {
    eyebrow: '',
    titleLine1: locale === 'fr' ? 'Achetez la casquette.' : 'Buy the cap.',
    titleLine2: locale === 'fr' ? 'Gagnez le tirage.' : 'Win the draw.',
    subtitle: locale === 'fr' ? 'Chaque casquette achetee vaut un ticket de tirage.' : 'Each cap purchased is worth one raffle ticket.',
    capSectionTitle: locale === 'fr' ? 'La casquette du tirage' : 'The cap of the draw',
    prizeSectionTitle: locale === 'fr' ? 'Prix a gagner' : 'Prizes to be won',
    noActiveRaffleText: locale === 'fr' ? 'Aucun raffle actif' : 'No active raffle',
    noProductsText: locale === 'fr' ? 'Aucun produit de raffle a afficher.' : 'No raffle products to display.',
    noPrizesText: locale === 'fr' ? 'Aucun prix configure pour ce raffle.' : 'No prizes configured for this raffle.',
    soldLabel: locale === 'fr' ? 'tickets vendus' : 'tickets sold',
    remainingLabel: locale === 'fr' ? 'tickets restants' : 'tickets remaining',
    maxLabel: locale === 'fr' ? 'tickets max' : 'max tickets',
    enterDrawLabel: locale === 'fr' ? 'Participer' : 'Enter the draw'
  };

  const parseHeroLocaleConfig = () => {
    const raw = locale === 'fr' ? heroContent?.valueFr : heroContent?.valueEn;
    if (!raw) return defaultHeroText;

    try {
      const parsed = JSON.parse(raw);
      return { ...defaultHeroText, ...parsed };
    } catch {
      return { ...defaultHeroText, titleLine1: raw };
    }
  };

  const heroText = parseHeroLocaleConfig();

  const heroRaffle = raffles[0];
  const raffleProducts = raffles
    .map((raffle) => raffle.product)
    .filter((product, index, arr) => product?._id && arr.findIndex((p) => p?._id === product._id) === index);

  const heroProducts = raffleProducts.slice(0, 2);
  const heroProduct = heroRaffle?.product || heroProducts[0];
  const soldTickets = heroProduct?.soldTickets;
  const maxTickets = heroProduct?.maxTickets;
  const remainingTickets = typeof soldTickets === 'number' && typeof maxTickets === 'number'
    ? Math.max(maxTickets - soldTickets, 0)
    : null;
  const heroTargetDate = heroRaffle?.endDate || heroProduct?.raffleEndDate;
  const heroPrizes = (heroRaffle?.prizes || []).slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-[#ece9df] text-[#14253a] pt-12 sm:pt-16 pb-10 sm:pb-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto w-36 h-24 sm:w-44 sm:h-28 rounded-full flex items-center justify-center bg-[#d7d2c4] overflow-hidden">
            {heroProduct?.images?.[0] ? (
              <img src={heroProduct.images[0]} alt={heroProduct.name} className="w-full h-full object-contain" />
            ) : (
              <ShoppingBag className="w-10 h-10 text-[#1b2f48]" />
            )}
          </div>

          <p className="mt-8 text-[11px] tracking-[0.25em] uppercase text-[#c8442d] font-semibold">
            {heroText.eyebrow || (heroRaffle ? (locale === 'fr' ? heroRaffle.name : (heroRaffle.nameEn || heroRaffle.name)) : heroText.noActiveRaffleText)}
          </p>

          <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-black leading-tight uppercase">
            {heroText.titleLine1}
            <br />
            {heroText.titleLine2}
          </h1>

          <p className="mt-4 text-neutral-600 text-base sm:text-lg">
            {heroText.subtitle}
          </p>

          <div className="mt-7 inline-flex flex-col items-center">
            <div className="bg-[#1b2f48] rounded-2xl px-6 py-4">
              {heroTargetDate ? (
                <CountdownTimer targetDate={heroTargetDate} locale={locale} variant="banner" />
              ) : (
                <p className="text-[#7eb6de] text-sm">{locale === 'fr' ? 'Date du tirage non definie' : 'Draw date not set'}</p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-6 sm:gap-10 mt-5">
              <div>
                <p className="text-3xl font-extrabold">{typeof soldTickets === 'number' ? soldTickets : '-'}</p>
                <p className="text-xs text-neutral-500 mt-1">{heroText.soldLabel}</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold">{remainingTickets ?? '-'}</p>
                <p className="text-xs text-neutral-500 mt-1">{heroText.remainingLabel}</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold">{typeof maxTickets === 'number' ? maxTickets : '-'}</p>
                <p className="text-xs text-neutral-500 mt-1">{heroText.maxLabel}</p>
              </div>
            </div>
          </div>

          <div className="mt-14 text-left">
            <h2 className="text-sm tracking-[0.18em] uppercase font-semibold mb-5">
              {heroText.capSectionTitle}
            </h2>
            {heroProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {heroProducts.map((product) => (
                  <div key={product._id} className="bg-[#f7f7f7] border border-[#cfc8b7] rounded-2xl p-4">
                    <div className="h-36 bg-[#d7d2c4] rounded-xl overflow-hidden flex items-center justify-center">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain" />
                      ) : (
                        <ShoppingBag className="w-9 h-9 text-[#1b2f48]" />
                      )}
                    </div>
                    <h3 className="text-2xl font-bold mt-4">{product.name}</h3>
                    <p className="text-lg text-neutral-500 mt-1">€{product.price}</p>
                    <Link
                      href={`/products/${product._id}`}
                      className="mt-4 block text-center py-3 rounded-xl bg-[#cd442e] text-white font-semibold hover:bg-[#b73a27] transition-colors"
                    >
                      {heroText.enterDrawLabel}
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#f7f7f7] border border-[#cfc8b7] rounded-2xl p-6 text-sm text-neutral-600">
                {heroText.noProductsText}
              </div>
            )}
          </div>

          <div className="mt-10 bg-[#d7d2c4] rounded-2xl p-5 sm:p-7 text-left">
            <h2 className="text-sm tracking-[0.18em] uppercase font-semibold mb-5">
              {heroText.prizeSectionTitle}
            </h2>
            {heroPrizes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {heroPrizes.map((prize, index) => (
                  <div key={`${prize.name}-${index}`} className="bg-[#f7f7f7] rounded-xl border border-[#cfc8b7] px-4 py-5 text-center">
                    <Trophy className="w-5 h-5 mx-auto text-[#b8862f]" />
                    <p className="mt-3 text-base">{locale === 'fr' ? prize.name : (prize.nameEn || prize.name)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#f7f7f7] rounded-xl border border-[#cfc8b7] px-4 py-5 text-sm text-neutral-600">
                {heroText.noPrizesText}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#14253a] text-white font-medium rounded-xl hover:bg-[#1b2f48] transition-colors"
            >
              {t('hero.cta')} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#1b2f48]/30 text-[#14253a] font-medium rounded-xl hover:bg-white/40 transition-colors"
            >
              {t('hero.secondaryCta')}
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle title={t('howItWorks.title')} />
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((step, i) => (
              <StaggerItem key={i}>
                <HoverScale>
                  <div className="text-center p-6 rounded-2xl bg-neutral-50 hover:bg-neutral-100 transition-colors">
                    <div className="w-14 h-14 mx-auto bg-neutral-900 rounded-2xl flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="w-8 h-8 mx-auto -mt-10 mb-2 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm border-4 border-white">
                      {i + 1}
                    </div>
                    <h3 className="font-semibold text-lg text-neutral-900">{step.title}</h3>
                    <p className="mt-2 text-neutral-500 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </HoverScale>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Winners */}
      <section className="py-16 sm:py-20 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle title={t('winners')} subtitle={locale === 'fr' ? 'Decouvrez nos derniers gagnants' : 'Discover our latest winners'} />
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {winners.map((winner, i) => (
              <StaggerItem key={winner._id || i}>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
                  <div className="w-12 h-12 mx-auto bg-amber-500 rounded-full flex items-center justify-center mb-3">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-medium text-sm">{winner.user?.firstName} {winner.user?.lastName?.charAt(0)}.</p>
                  <p className="text-xs text-neutral-400 mt-1">{winner.prize}</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {new Date(winner.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-CH' : 'en-US')}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 sm:py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle title={t('reviews')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((review) => (
              <ReviewCard key={review._id} review={review} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="bg-neutral-900 rounded-3xl p-8 sm:p-12 text-center text-white">
              <h2 className="text-2xl sm:text-3xl font-bold">{t('newsletter.title')}</h2>
              <p className="mt-3 text-neutral-300 max-w-md mx-auto">{t('newsletter.subtitle')}</p>
              <form onSubmit={handleNewsletter} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('newsletter.placeholder')}
                  required
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-amber-500 text-neutral-900 font-medium rounded-xl hover:bg-amber-400 transition-colors"
                >
                  {t('newsletter.button')}
                </button>
              </form>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
