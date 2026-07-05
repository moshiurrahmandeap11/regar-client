'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Upload, ImageIcon, Search, ChevronLeft, ChevronRight, Megaphone } from 'lucide-react';
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
  const [colorImagePreviews, setColorImagePreviews] = useState([]);
  const [form, setForm] = useState({
    name: '', nameEn: '', description: '', descriptionEn: '', price: '', originalPrice: '',
    stock: '', maxTickets: '', category: 'caps', colors: [{ name: '', hex: '', image: '' }], sizes: [''],
    featured: false, isActive: true
  });
  const [colorImageFiles, setColorImageFiles] = useState([]);
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
        formData.append(key, JSON.stringify(form[key]));
      } else {
        formData.append(key, form[key]);
      }
    });

    colorImageFiles.forEach((file, index) => {
      if (file) formData.append(`colorImage_${index}`, file);
    });

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
    setForm({
      name: product.name, nameEn: product.nameEn || '', description: product.description || '',
      descriptionEn: product.descriptionEn || '', price: product.price, originalPrice: product.originalPrice || '',
      stock: product.stock, maxTickets: product.maxTickets, category: product.category,
      colors: product.colors?.length
        ? product.colors.map((color) => ({ name: color.name || '', hex: color.hex || '#000000', image: color.image || '' }))
        : [{ name: '', hex: '', image: '' }],
      sizes: product.sizes?.length ? product.sizes : [''],
      featured: product.featured, isActive: product.isActive
    });
    setColorImagePreviews((product.colors || []).map((color) => color.image || null));
    setColorImageFiles([]);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setColorImagePreviews([]);
    setColorImageFiles([]);
    setForm({
      name: '', nameEn: '', description: '', descriptionEn: '', price: '', originalPrice: '',
      stock: '', maxTickets: '', category: 'caps', colors: [{ name: '', hex: '', image: '' }], sizes: [''],
      featured: false, isActive: true
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

                {/* Colors */}
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-2 block">Colors</label>
                  <div className="space-y-2">
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
                    <button type="button" onClick={addColor} className="px-3 py-2 bg-neutral-100 rounded-lg text-xs font-medium hover:bg-neutral-200 transition-colors">+ Add</button>
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-2 block">Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {form.sizes.map((size, i) => (
                      <div key={i} className="flex items-center gap-1 bg-neutral-50 rounded-lg p-2">
                        <input value={size} onChange={e => updateSize(i, e.target.value)} placeholder="Size" className="w-16 px-2 py-1 rounded border border-neutral-200 text-xs text-center" />
                        {form.sizes.length > 1 && (
                          <button type="button" onClick={() => removeSize(i)} className="text-red-500 hover:text-red-700"><X className="w-3 h-3" /></button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={addSize} className="px-3 py-2 bg-neutral-100 rounded-lg text-xs font-medium hover:bg-neutral-200 transition-colors">+ Add</button>
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
