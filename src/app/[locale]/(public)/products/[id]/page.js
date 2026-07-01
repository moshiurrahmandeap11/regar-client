'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Truck, Shield, RotateCcw } from 'lucide-react';
import api from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import QuantitySelector from '@/components/QuantitySelector';
import ProductCard from '@/components/ProductCard';
import { FadeIn } from '@/components/animations';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const locale = useLocale();
  const params = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/api/products/${params.id}`);
        setProduct(res.data);
        setSelectedColor(res.data.colors?.[0]?.name);
        setSelectedSize(res.data.sizes?.[0]);
        
        const relatedRes = await api.get(`/api/products?category=${res.data.category}&active=true`);
        setRelated(relatedRes.data.filter(p => p._id !== res.data._id).slice(0, 4));
      } catch (error) {
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchProduct();
  }, [params.id]);

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      toast.error(locale === 'fr' ? 'Veuillez selectionner une couleur et une taille' : 'Please select color and size');
      return;
    }
    addToCart(product, selectedColor, selectedSize, quantity);
    toast.success(locale === 'fr' ? 'Ajoute au panier !' : 'Added to cart!');
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
                  src={product.images?.[activeImage] || '/placeholder.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.images?.length > 1 && (
                <div className="flex gap-2">
                  {product.images.map((img, i) => (
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
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">{product.name}</h1>
              <p className="mt-2 text-neutral-500">{locale === 'fr' ? product.description : product.descriptionEn || product.description}</p>
              
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
                          onClick={() => setSelectedColor(color.name)}
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
            </div>
          </FadeIn>
        </div>

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
      </div>
    </div>
  );
}
