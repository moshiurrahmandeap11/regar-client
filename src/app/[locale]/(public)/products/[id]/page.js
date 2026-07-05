'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Truck, Shield, RotateCcw, Star, Ticket } from 'lucide-react';
import api from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import QuantitySelector from '@/components/QuantitySelector';
import ProductCard from '@/components/ProductCard';
import CountdownTimer from '@/components/CountdownTimer';
import { FadeIn } from '@/components/animations';
import { productPath, productSlug } from '@/lib/productPath';
import toast from 'react-hot-toast';

const objectIdPattern = /^[a-f\d]{24}$/i;

export default function ProductDetailPage() {
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [productReviews, setProductReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeRaffle, setActiveRaffle] = useState(null);

  const selectedColorData = product?.colors?.find((color) => color.name === selectedColor);
  const displayImages = (() => {
    if (!product) return [];
    const baseImages = Array.isArray(product.images) ? product.images : [];
    if (!selectedColorData?.image) return baseImages;
    return [selectedColorData.image, ...baseImages.filter((img) => img !== selectedColorData.image)];
  })();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        let productData = null;

        if (!objectIdPattern.test(params.id)) {
          const productsRes = await api.get('/api/products');
          const products = Array.isArray(productsRes.data) ? productsRes.data : [];
          productData = products.find((item) => productSlug(item) === params.id) || null;
        }

        if (!productData) {
          const res = await api.get(`/api/products/${params.id}`);
          productData = res.data;
        }

        const productId = productData._id;
        const canonicalPath = productPath(productData);
        if (canonicalPath !== `/products/${params.id}`) {
          router.replace(canonicalPath);
        }
        setProduct(productData);
        setSelectedColor(productData.colors?.[0]?.name);
        setSelectedSize(productData.sizes?.[0]);

        const reviewsRes = await api.get(`/api/reviews?product=${productId}&limit=10`);
        setProductReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
        
        const relatedRes = await api.get(`/api/products?category=${productData.category}&active=true`);
        setRelated(relatedRes.data.filter(p => p._id !== productData._id).slice(0, 4));

        // Fetch the active raffle linked to this product (if any)
        try {
          const raffleRes = await api.get(`/api/raffles?product=${productId}&status=active`);
          const list = Array.isArray(raffleRes.data) ? raffleRes.data : [];
          setActiveRaffle(list[0] || null);
        } catch {
          setActiveRaffle(null);
        }
      } catch (error) {
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchProduct();
  }, [params.id, router]);

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      toast.error(locale === 'fr' ? 'Veuillez selectionner une couleur et une taille' : 'Please select color and size');
      return;
    }
    addToCart(product, selectedColor, selectedSize, quantity, displayImages[activeImage] || displayImages[0]);
    toast.success(locale === 'fr' ? 'Ajoute au panier !' : 'Added to cart!');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error(locale === 'fr' ? 'Veuillez vous connecter pour laisser un avis' : 'Please login to leave a review');
      return;
    }
    if (!reviewComment.trim()) {
      toast.error(locale === 'fr' ? 'Le commentaire est requis' : 'Comment is required');
      return;
    }

    setReviewLoading(true);
    try {
      await api.post('/api/reviews', {
        product: product._id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      const reviewsRes = await api.get(`/api/reviews?product=${product._id}&limit=10`);
      setProductReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
      setReviewComment('');
      setReviewRating(5);
      toast.success(locale === 'fr' ? 'Avis ajoute avec succes' : 'Review added successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full" /></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-neutral-500">Product not found</div>;

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <FadeIn>
            <div className="space-y-4">
              <div className="aspect-square bg-neutral-100 rounded-2xl overflow-hidden">
                <img
                  src={displayImages?.[activeImage] || '/placeholder.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {displayImages?.length > 1 && (
                <div className="flex gap-2">
                  {displayImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${activeImage === i ? 'border-neutral-900' : 'border-transparent'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div>
              {activeRaffle && (
                <div className="inline-flex items-center gap-2.5 mb-5 px-4 py-2 rounded-xl bg-neutral-900 text-white">
                  <Ticket className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-bold tracking-widest uppercase text-amber-400">
                    Raffle No. {activeRaffle.raffleNumber
                      ? String(activeRaffle.raffleNumber).padStart(3, '0')
                      : '—'}
                  </span>
                  <span className="w-px h-3 bg-white/20 shrink-0" />
                  <span className="text-xs text-neutral-300 truncate max-w-[180px]">
                    {locale === 'fr' ? activeRaffle.name : (activeRaffle.nameEn || activeRaffle.name)}
                  </span>
                </div>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">{product.name}</h1>
              
              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-3xl font-bold text-neutral-900">{product.price} CHF</span>
                {product.originalPrice && (
                  <span className="text-lg text-neutral-400 line-through">{product.originalPrice} CHF</span>
                )}
              </div>

              <div className="mt-6 space-y-4">
                {product.colors?.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-2 block">
                      {locale === 'fr' ? 'Couleur' : 'Color'}: {selectedColor}
                    </label>
                    <div className="flex gap-2">
                      {product.colors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => {
                            setSelectedColor(color.name);
                            setActiveImage(0);
                          }}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === color.name ? 'border-neutral-900 scale-110' : 'border-neutral-200'}`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {product.sizes?.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-2 block">
                      {locale === 'fr' ? 'Taille' : 'Size'}
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${selectedSize === size ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 hover:border-neutral-400'}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-2 block">
                    {locale === 'fr' ? 'Quantite' : 'Quantity'}
                  </label>
                  <QuantitySelector value={quantity} onChange={setQuantity} max={product.stock || 10} />
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-neutral-900 text-white font-medium rounded-xl hover:bg-neutral-800 transition-colors"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {locale === 'fr' ? 'Ajouter au panier' : 'Add to cart'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 py-3.5 px-6 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
                >
                  <Heart className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                  { icon: Truck, text: locale === 'fr' ? 'Livraison rapide' : 'Fast shipping' },
                  { icon: Shield, text: locale === 'fr' ? 'Paiement securise' : 'Secure payment' },
                  { icon: RotateCcw, text: locale === 'fr' ? 'Retours 14 jours' : '14-day returns' },
                ].map((item, i) => (
                  <div key={i} className="text-center p-3 bg-neutral-50 rounded-xl">
                    <item.icon className="w-5 h-5 mx-auto text-neutral-600 mb-1" />
                    <p className="text-xs text-neutral-600">{item.text}</p>
                  </div>
                ))}
              </div>

              {/* Tickets sold progress */}
              {typeof product.soldTickets === 'number' && typeof product.maxTickets === 'number' && product.maxTickets > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-neutral-600 font-medium">
                      {locale === 'fr' ? 'Tickets vendus' : 'Tickets sold'}
                    </span>
                    <span className="font-semibold text-neutral-900">
                      {product.soldTickets} / {product.maxTickets}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#c8442d] rounded-full transition-all duration-700"
                      style={{ width: `${Math.min((product.soldTickets / product.maxTickets) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Drawing in countdown */}
              {activeRaffle?.endDate && (
                <div className="mt-4">
                  <CountdownTimer targetDate={activeRaffle.endDate} locale={locale} variant="dark" />
                </div>
              )}
            </div>
          </FadeIn>
        </div>

        {/* Product Description */}
        {(product.description || product.descriptionEn) && (
          <div className="mt-12 border-t border-neutral-200 pt-10">
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">
              {locale === 'fr' ? 'Description' : 'Description'}
            </h2>
            <p className="text-neutral-600 leading-relaxed max-w-3xl">
              {locale === 'fr' ? product.description : product.descriptionEn || product.description}
            </p>
          </div>
        )}

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold mb-6">{locale === 'fr' ? 'Produits similaires' : 'Related products'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map(p => (
                <ProductCard key={p._id} product={p} locale={locale} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-16 space-y-6">
          <h2 className="text-xl font-bold">{locale === 'fr' ? 'Avis clients' : 'Customer reviews'}</h2>

          <form onSubmit={handleSubmitReview} className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">{locale === 'fr' ? 'Votre note' : 'Your rating'}</label>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReviewRating(i + 1)}
                    className="p-1"
                  >
                    <Star className={`w-5 h-5 ${i < reviewRating ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">{locale === 'fr' ? 'Commentaire' : 'Comment'}</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm"
                placeholder={locale === 'fr' ? 'Partagez votre experience...' : 'Share your experience...'}
              />
            </div>

            <button
              type="submit"
              disabled={reviewLoading}
              className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-sm disabled:opacity-60"
            >
              {reviewLoading ? (locale === 'fr' ? 'Envoi...' : 'Submitting...') : (locale === 'fr' ? 'Ajouter un avis' : 'Add review')}
            </button>
          </form>

          {productReviews.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {productReviews.map((review) => (
                <div key={review._id} className="bg-white rounded-2xl border border-neutral-200 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{review.name}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 mt-2">{locale === 'fr' ? review.comment : review.commentEn || review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">{locale === 'fr' ? 'Aucun avis pour ce produit.' : 'No reviews for this product yet.'}</p>
          )}
        </div>
      </div>
    </div>
  );
}
