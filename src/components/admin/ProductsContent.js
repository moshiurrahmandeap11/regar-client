'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Upload, ImageIcon, Search, ChevronLeft, ChevronRight, Megaphone, Star, Globe, Tag, Sparkles } from 'lucide-react';
import { FadeIn } from '@/components/animations';
import toast from 'react-hot-toast';
import MarketingModal from '@/components/admin/MarketingModal';
import { productPath } from '@/lib/productPath';

export default function ProductsContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [hasColors, setHasColors] = useState(false);
  const [hasSizes, setHasSizes] = useState(false);
  const [colorImagePreviews, setColorImagePreviews] = useState([]);
  const [colorImageFiles, setColorImageFiles] = useState([]);
  const [imagesList, setImagesList] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [form, setForm] = useState({
    name: '', nameEn: '', slug: '', description: '', descriptionEn: '', price: '', originalPrice: '',
    stock: '', maxTickets: '', category: 'caps', colors: [{ name: '', hex: '#000000', image: '' }], sizes: [''],
    featured: false, isActive: true,
    metaTitle: '', metaTitleEn: '', metaDescription: '', metaDescriptionEn: '', seoKeywords: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Marketing modal state
  const [marketingTarget, setMarketingTarget] = useState(null); // { name, url }

  const API = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/products`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [API]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleAddImages = (files) => {
    const fileArray = Array.from(files || []).filter((f) => f && f.type && f.type.startsWith('image/'));
    if (!fileArray.length) return;

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagesList((prev) => [
          ...prev,
          {
            id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            url: reader.result,
            file,
            isNew: true,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setImagesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetCover = (index) => {
    if (index === 0) return;
    setImagesList((prev) => {
      const next = [...prev];
      const [target] = next.splice(index, 1);
      next.unshift(target);
      return next;
    });
  };

  const handleMoveImage = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= imagesList.length) return;
    setImagesList((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[target];
      next[target] = temp;
      return next;
    });
  };

  const handleColorImageChange = (index, file) => {
    if (!file) return;

    const nextFiles = [...colorImageFiles];
    nextFiles[index] = file;
    setColorImageFiles(nextFiles);

    const reader = new FileReader();
    reader.onloadend = () => {
      const nextPreviews = [...colorImagePreviews];
      nextPreviews[index] = reader.result;
      setColorImagePreviews(nextPreviews);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach(key => {
      if (key === 'colors' || key === 'sizes') {
        // Handled specifically below
      } else {
        formData.append(key, form[key]);
      }
    });

    const cleanColors = hasColors
      ? form.colors
          .filter((color, i) => color.name?.trim() || color.image || colorImageFiles[i])
          .map(color => ({ name: color.name || '', hex: color.hex || '#000000', image: color.image || '' }))
      : [];
    const cleanSizes = hasSizes
      ? form.sizes.filter(s => typeof s === 'string' && s.trim().length > 0)
      : [];

    formData.append('colors', JSON.stringify(cleanColors));
    formData.append('sizes', JSON.stringify(cleanSizes));

    const existingImages = [];
    const newFiles = [];
    const imageOrder = [];

    imagesList.forEach((item) => {
      if (!item.isNew && item.url) {
        const idx = existingImages.length;
        existingImages.push(item.url);
        imageOrder.push(`existing:${idx}`);
      } else if (item.isNew && item.file) {
        const idx = newFiles.length;
        newFiles.push(item.file);
        imageOrder.push(`new:${idx}`);
      }
    });

    if (existingImages.length > 0) {
      formData.append('images', JSON.stringify(existingImages));
    }
    newFiles.forEach((file) => {
      formData.append('images', file);
    });
    if (imageOrder.length > 0) {
      formData.append('imageOrder', JSON.stringify(imageOrder));
    }

    if (hasColors) {
      colorImageFiles.forEach((file, index) => {
        if (file) formData.append(`colorImage_${index}`, file);
      });
    }

    const url = editing ? `${API}/api/products/${editing}` : `${API}/api/products`;
    const method = editing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: formData });
      if (!res.ok) throw new Error('Failed to save');
      toast.success(editing ? 'Product updated' : 'Product created');
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await new Promise((resolve) => {
      toast((t) => (
        <div className="space-y-2">
          <p className="text-sm">Are you sure you want to delete this product?</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded bg-neutral-900 text-white text-xs" onClick={() => { toast.dismiss(t.id); resolve(true); }}>Delete</button>
            <button className="px-3 py-1 rounded border text-xs" onClick={() => { toast.dismiss(t.id); resolve(false); }}>Cancel</button>
          </div>
        </div>
      ), { duration: 10000 });
    });
    if (!confirmed) return;
    try {
      const res = await fetch(`${API}/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (product) => {
    setEditing(product._id);
    const validColors = (product.colors || []).filter(c => c && (c.name?.trim() || c.image));
    const validSizes = (product.sizes || []).filter(s => s && String(s).trim());

    setHasColors(validColors.length > 0);
    setHasSizes(validSizes.length > 0);

    setForm({
      name: product.name, nameEn: product.nameEn || '', slug: product.slug || '',
      description: product.description || '',
      descriptionEn: product.descriptionEn || '', price: product.price, originalPrice: product.originalPrice || '',
      stock: product.stock, maxTickets: product.maxTickets, category: product.category,
      colors: validColors.length
        ? validColors.map((color) => ({ name: color.name || '', hex: color.hex || '#000000', image: color.image || '' }))
        : [{ name: '', hex: '#000000', image: '' }],
      sizes: validSizes.length ? validSizes : [''],
      featured: product.featured, isActive: product.isActive,
      metaTitle: product.metaTitle || '',
      metaTitleEn: product.metaTitleEn || '',
      metaDescription: product.metaDescription || '',
      metaDescriptionEn: product.metaDescriptionEn || '',
      seoKeywords: Array.isArray(product.seoKeywords) ? product.seoKeywords.join(', ') : (product.seoKeywords || '')
    });
    setImagesList(
      (product.images || []).map((imgUrl, i) => ({
        id: `existing-${i}-${Math.random().toString(36).substring(2, 8)}`,
        url: imgUrl,
        file: null,
        isNew: false,
      }))
    );
    setColorImagePreviews(validColors.map((color) => color.image || null));
    setColorImageFiles([]);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setHasColors(false);
    setHasSizes(false);
    setImagesList([]);
    setIsDragging(false);
    setColorImagePreviews([]);
    setColorImageFiles([]);
    setForm({
      name: '', nameEn: '', slug: '', description: '', descriptionEn: '', price: '', originalPrice: '',
      stock: '', maxTickets: '', category: 'caps', colors: [{ name: '', hex: '#000000', image: '' }], sizes: [''],
      featured: false, isActive: true,
      metaTitle: '', metaTitleEn: '', metaDescription: '', metaDescriptionEn: '', seoKeywords: ''
    });
  };

  const addColor = () => {
    setForm({ ...form, colors: [...form.colors, { name: '', hex: '', image: '' }] });
    setColorImageFiles((prev) => [...prev, null]);
    setColorImagePreviews((prev) => [...prev, null]);
  };

  const removeColor = (i) => {
    setForm({ ...form, colors: form.colors.filter((_, idx) => idx !== i) });
    setColorImageFiles((prev) => prev.filter((_, idx) => idx !== i));
    setColorImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateColor = (i, field, val) => {
    const newColors = [...form.colors];
    newColors[i][field] = val;
    setForm({ ...form, colors: newColors });
  };

  const addSize = () => setForm({ ...form, sizes: [...form.sizes, ''] });
  const removeSize = (i) => setForm({ ...form, sizes: form.sizes.filter((_, idx) => idx !== i) });
  const updateSize = (i, val) => {
    const newSizes = [...form.sizes];
    newSizes[i] = val;
    setForm({ ...form, sizes: newSizes });
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Add Product'}
        </motion.button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Product' : 'Add New Product'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1 block">Name (FR)</label>
                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1 block">Name (EN)</label>
                    <input value={form.nameEn} onChange={e => setForm({...form, nameEn: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-neutral-700 mb-1 block">URL Slug <span className="text-neutral-400 font-normal">(optional, auto-generated if empty)</span></label>
                    <input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="e.g. casquette-signature" className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                    <p className="text-xs text-neutral-400 mt-1">Used in product URL: /products/your-slug</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1 block">Price (CHF)</label>
                    <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1 block">Original Price</label>
                    <input type="number" step="0.01" value={form.originalPrice} onChange={e => setForm({...form, originalPrice: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1 block">Stock</label>
                    <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1 block">Max Tickets</label>
                    <input type="number" value={form.maxTickets} onChange={e => setForm({...form, maxTickets: e.target.value})} required className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1 block">Description (FR)</label>
                    <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1 block">Description (EN)</label>
                    <textarea value={form.descriptionEn} onChange={e => setForm({...form, descriptionEn: e.target.value})} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none" />
                  </div>
                </div>

                {/* Product Images (Gallery & Cover) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-neutral-800">Product Images</label>
                        {imagesList.length > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-medium">
                            {imagesList.length} {imagesList.length === 1 ? 'photo' : 'photos'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400">The 1st photo is used as the product cover.</p>
                    </div>
                    {imagesList.length > 0 && (
                      <label
                        htmlFor="product-images-input"
                        className="cursor-pointer text-xs font-medium text-neutral-900 hover:text-neutral-700 flex items-center gap-1 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Photos
                      </label>
                    )}
                  </div>

                  <input
                    id="product-images-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      handleAddImages(e.target.files);
                      e.target.value = '';
                    }}
                    className="hidden"
                  />

                  {imagesList.length === 0 ? (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        if (e.dataTransfer?.files?.length) {
                          handleAddImages(e.dataTransfer.files);
                        }
                      }}
                      onClick={() => document.getElementById('product-images-input')?.click()}
                      className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                        isDragging
                          ? 'border-neutral-900 bg-neutral-100/70 scale-[0.99]'
                          : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50/50 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-neutral-600 border border-neutral-200">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-800">
                            Drag & drop photos here, or <span className="text-neutral-900 underline underline-offset-2">browse</span>
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">
                            Upload one or multiple photos (JPG, PNG, WEBP)
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        if (e.dataTransfer?.files?.length) {
                          handleAddImages(e.dataTransfer.files);
                        }
                      }}
                      className={`p-3 rounded-2xl border-2 border-dashed transition-all ${
                        isDragging ? 'border-neutral-900 bg-neutral-100/60' : 'border-neutral-200 bg-neutral-50/30'
                      }`}
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {imagesList.map((item, index) => {
                          const isCover = index === 0;
                          return (
                            <div
                              key={item.id || index}
                              className={`group relative aspect-square rounded-xl overflow-hidden bg-neutral-100 border transition-all ${
                                isCover
                                  ? 'ring-2 ring-neutral-900 border-transparent shadow-md'
                                  : 'border-neutral-200 hover:border-neutral-400'
                              }`}
                            >
                              <img src={item.url} alt="" className="w-full h-full object-cover" />

                              {/* Badge */}
                              {isCover ? (
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-neutral-900/90 backdrop-blur-sm text-white text-[10px] font-semibold flex items-center gap-1 shadow-sm">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  <span>Cover</span>
                                </div>
                              ) : (
                                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium">
                                  #{index + 1}
                                </div>
                              )}

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                title="Remove photo"
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600/90 hover:bg-red-700 text-white shadow transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>

                              {/* Action controls footer */}
                              <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between opacity-95 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => handleMoveImage(index, -1)}
                                  title="Move left"
                                  className={`p-1 rounded bg-white/20 hover:bg-white/40 text-white transition-colors ${
                                    index === 0 ? 'opacity-30 cursor-not-allowed' : ''
                                  }`}
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>

                                {!isCover && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetCover(index)}
                                    title="Set as main cover photo"
                                    className="px-2 py-0.5 text-[10px] font-medium rounded bg-white/90 hover:bg-white text-neutral-900 shadow transition-colors flex items-center gap-1"
                                  >
                                    <Star className="w-2.5 h-2.5" />
                                    Cover
                                  </button>
                                )}

                                <button
                                  type="button"
                                  disabled={index === imagesList.length - 1}
                                  onClick={() => handleMoveImage(index, 1)}
                                  title="Move right"
                                  className={`p-1 rounded bg-white/20 hover:bg-white/40 text-white transition-colors ${
                                    index === imagesList.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                                  }`}
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {/* Add Photo tile in grid */}
                        <label
                          htmlFor="product-images-input"
                          className="aspect-square border-2 border-dashed border-neutral-300 hover:border-neutral-500 rounded-xl cursor-pointer hover:bg-neutral-50 transition-all flex flex-col items-center justify-center gap-1.5 text-neutral-500 hover:text-neutral-700"
                        >
                          <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
                            <Plus className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-medium">Add photo</span>
                        </label>
                      </div>

                      <p className="text-[11px] text-neutral-400 mt-2 px-1">
                        Tip: First photo is the catalog cover. Use &larr; &rarr; arrows to reorder or click &apos;Cover&apos; on any image.
                      </p>
                    </div>
                  )}
                </div>

                {/* Color Variants Toggle */}
                <div className="pt-3 border-t border-neutral-100">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-sm font-medium text-neutral-800">Color Variants</span>
                      <p className="text-xs text-neutral-400">Enable if this product comes in different colors</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasColors}
                        onChange={e => {
                          const checked = e.target.checked;
                          setHasColors(checked);
                          if (checked && form.colors.length === 0) {
                            setForm(prev => ({ ...prev, colors: [{ name: '', hex: '#000000', image: '' }] }));
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900"></div>
                    </label>
                  </div>

                  {hasColors && (
                    <div className="space-y-2 pl-3 border-l-2 border-neutral-200 pt-1">
                      {form.colors.map((color, i) => (
                        <div key={i} className="flex flex-wrap items-center gap-2 bg-neutral-50 rounded-lg p-2">
                          <input type="color" value={color.hex} onChange={e => updateColor(i, 'hex', e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                          <input value={color.name} onChange={e => updateColor(i, 'name', e.target.value)} placeholder="Color name" className="w-24 px-2 py-1 rounded border border-neutral-200 text-xs" />

                          <label className="flex items-center gap-2 px-2 py-1.5 border border-neutral-200 rounded-lg cursor-pointer bg-white hover:bg-neutral-50 transition-colors">
                            <Upload className="w-3 h-3" />
                            <span className="text-xs">{colorImageFiles[i]?.name || 'Image'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleColorImageChange(i, e.target.files?.[0])}
                              className="hidden"
                            />
                          </label>

                          {(colorImagePreviews[i] || color.image) ? (
                            <img
                              src={colorImagePreviews[i] || color.image}
                              alt={color.name || `color-${i}`}
                              className="w-8 h-8 rounded object-cover border border-neutral-200"
                            />
                          ) : null}

                          {form.colors.length > 1 && (
                            <button type="button" onClick={() => removeColor(i)} className="text-red-500 hover:text-red-700"><X className="w-3 h-3" /></button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={addColor} className="px-3 py-2 bg-neutral-100 rounded-lg text-xs font-medium hover:bg-neutral-200 transition-colors">+ Add Color</button>
                    </div>
                  )}
                </div>

                {/* Size Variants Toggle */}
                <div className="pt-3 border-t border-neutral-100">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-sm font-medium text-neutral-800">Size Variants</span>
                      <p className="text-xs text-neutral-400">Enable if this product has sizes (e.g. S, M, L)</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasSizes}
                        onChange={e => {
                          const checked = e.target.checked;
                          setHasSizes(checked);
                          if (checked && form.sizes.length === 0) {
                            setForm(prev => ({ ...prev, sizes: [''] }));
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900"></div>
                    </label>
                  </div>

                  {hasSizes && (
                    <div className="pl-3 border-l-2 border-neutral-200 pt-1">
                      <div className="flex flex-wrap gap-2">
                        {form.sizes.map((size, i) => (
                          <div key={i} className="flex items-center gap-1 bg-neutral-50 rounded-lg p-2">
                            <input value={size} onChange={e => updateSize(i, e.target.value)} placeholder="Size" className="w-16 px-2 py-1 rounded border border-neutral-200 text-xs text-center" />
                            {form.sizes.length > 1 && (
                              <button type="button" onClick={() => removeSize(i)} className="text-red-500 hover:text-red-700"><X className="w-3 h-3" /></button>
                            )}
                          </div>
                        ))}
                        <button type="button" onClick={addSize} className="px-3 py-2 bg-neutral-100 rounded-lg text-xs font-medium hover:bg-neutral-200 transition-colors">+ Add Size</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* SEO & Search Engine Optimization Card */}
                <div className="pt-5 border-t border-neutral-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
                        <Globe className="w-4 h-4 text-[#d8a868]" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-neutral-800">SEO & Search Engine Metadata</span>
                        <p className="text-xs text-neutral-400">Optimize how this product appears on Google and social shares</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-500" />
                      Google SERP
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 mb-1 block">
                        Meta Title (FR) <span className="text-neutral-400 font-normal">(optional)</span>
                      </label>
                      <input
                        value={form.metaTitle}
                        onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                        placeholder={form.name ? `${form.name} | Regar` : 'e.g. Casquette Signature | Regar'}
                        className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 mb-1 block">
                        Meta Title (EN) <span className="text-neutral-400 font-normal">(optional)</span>
                      </label>
                      <input
                        value={form.metaTitleEn}
                        onChange={(e) => setForm({ ...form, metaTitleEn: e.target.value })}
                        placeholder={form.nameEn ? `${form.nameEn} | Regar` : 'e.g. Signature Cap | Regar'}
                        className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 mb-1 block">
                        Meta Description (FR)
                      </label>
                      <textarea
                        value={form.metaDescription}
                        onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                        rows={2}
                        placeholder="Description affichée dans les résultats Google..."
                        className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 mb-1 block">
                        Meta Description (EN)
                      </label>
                      <textarea
                        value={form.metaDescriptionEn}
                        onChange={(e) => setForm({ ...form, metaDescriptionEn: e.target.value })}
                        rows={2}
                        placeholder="Snippet displayed on Google and social media..."
                        className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 mb-1 flex items-center justify-between">
                      <span>SEO Keywords <span className="text-neutral-400 font-normal">(comma-separated)</span></span>
                      <span className="text-[11px] text-neutral-400">e.g. luxury cap, streetwear, raffle, limited drop</span>
                    </label>
                    <input
                      value={form.seoKeywords}
                      onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })}
                      placeholder="luxury cap, limited edition, sneaker raffle, regar"
                      className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />

                    {/* Keywords Tag Badges preview */}
                    {form.seoKeywords && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {form.seoKeywords.split(',').map((k, idx) => {
                          const tag = k.trim();
                          if (!tag) return null;
                          return (
                            <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-[11px] font-medium">
                              <Tag className="w-2.5 h-2.5 text-[#d8a868]" />
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Live Google SERP Simulation Preview */}
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1.5 select-none">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Google Search Result Preview (Simulation)
                    </span>
                    <div className="text-xs text-neutral-500 flex items-center gap-1.5">
                      <span className="font-semibold text-neutral-700">https://regar.com</span>
                      <span>›</span>
                      <span>products</span>
                      <span>›</span>
                      <span className="truncate max-w-[140px]">{form.slug || 'product-slug'}</span>
                    </div>
                    <h4 className="text-sm sm:text-base font-medium text-blue-700 hover:underline cursor-pointer truncate">
                      {(form.metaTitleEn || form.metaTitle || form.nameEn || form.name || 'Product Title')} | Regar
                    </h4>
                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                      {form.metaDescriptionEn || form.metaDescription || form.descriptionEn || form.description || 'Exclusive luxury streetwear caps with automatic entry to luxury raffle giveaways. Fast shipping across Switzerland and Europe.'}
                    </p>
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="w-4 h-4 rounded border-neutral-300" />
                    <span className="text-sm">Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="w-4 h-4 rounded border-neutral-300" />
                    <span className="text-sm">Active</span>
                  </label>
                </div>

                <div className="flex gap-3">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors">
                    {editing ? 'Update Product' : 'Create Product'}
                  </motion.button>
                  {editing && (
                    <button type="button" onClick={resetForm} className="px-6 py-2.5 border border-neutral-200 rounded-xl text-sm hover:bg-neutral-50 transition-colors">Cancel</button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Price</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Stock</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((product) => (
                    <motion.tr
                      key={product._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-neutral-100 overflow-hidden shrink-0">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-neutral-300 m-auto" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{product.name}</p>
                            <p className="text-xs text-neutral-500">{product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{product.price} CHF</span>
                        {product.originalPrice > 0 && (
                          <span className="text-xs text-neutral-400 line-through ml-1">{product.originalPrice} CHF</span>
                        )}
                      </td>
                      <td className="py-3 px-4">{product.stock}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          product.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setMarketingTarget({
                              name: product.name,
                              url: `${process.env.NEXT_PUBLIC_SITE_URL}/en${productPath(product)}`,
                            })}
                            className="p-1.5 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                            title="Email Marketing"
                          >
                            <Megaphone className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEdit(product)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(product._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <ImageIcon className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500 text-sm">No products found</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200">
                <p className="text-sm text-neutral-500">{filtered.length} products</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded-lg hover:bg-neutral-100 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium">{currentPage} / {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded-lg hover:bg-neutral-100 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Marketing Modal */}
      <MarketingModal
        open={!!marketingTarget}
        onClose={() => setMarketingTarget(null)}
        itemName={marketingTarget?.name || ''}
        itemUrl={marketingTarget?.url || ''}
      />
    </div>
  );
}
