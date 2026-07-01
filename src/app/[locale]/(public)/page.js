'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Ticket, Trophy, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
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

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-neutral-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(245,158,11,0.3),transparent_50%)]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 relative">
          <div className="max-w-2xl">
            <FadeIn>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                {t('hero.title')}
              </h1>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="mt-6 text-lg sm:text-xl text-neutral-300 leading-relaxed">
                {t('hero.subtitle')}
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-neutral-900 font-medium rounded-xl hover:bg-neutral-100 transition-colors"
                >
                  {t('hero.cta')} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/#how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/30 text-white font-medium rounded-xl hover:bg-white/10 transition-colors"
                >
                  {t('hero.secondaryCta')}
                </Link>
              </div>
            </FadeIn>
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

      {/* Featured Products */}
      <section className="py-16 sm:py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <SectionTitle title={t('featured')} centered={false} />
            <Link href="/products" className="hidden sm:flex items-center gap-1 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              {locale === 'fr' ? 'Voir tout' : 'View all'} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      {/* Active Raffles */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle title={t('activeRaffles')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {raffles.map((raffle) => (
              <FadeIn key={raffle._id}>
                <HoverScale>
                  <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={raffle.product?.images?.[0] || '/placeholder.jpg'}
                        alt={raffle.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-neutral-900">{raffle.name}</h3>
                        <p className="text-sm text-neutral-500">{raffle.product?.name}</p>
                      </div>
                    </div>
                    {raffle.endDate && (
                      <div className="mb-4">
                        <p className="text-xs text-neutral-500 mb-2">{locale === 'fr' ? 'Se termine dans' : 'Ends in'}</p>
                        <CountdownTimer targetDate={raffle.endDate} locale={locale} />
                      </div>
                    )}
                    <Link
                      href={`/products/${raffle.product?._id}`}
                      className="block w-full text-center py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors"
                    >
                      {locale === 'fr' ? 'Participer' : 'Participate'}
                    </Link>
                  </div>
                </HoverScale>
              </FadeIn>
            ))}
          </div>
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
