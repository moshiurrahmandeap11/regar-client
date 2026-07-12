'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Ticket, Trophy, Calendar, Search, X, ChevronLeft, ChevronRight, Sparkles, Megaphone, Trash2, Upload, ImageIcon, Pencil } from 'lucide-react';
import { FadeIn } from '@/components/animations';
import toast from 'react-hot-toast';
import MarketingModal from '@/components/admin/MarketingModal';

export default function RafflesContent() {
  const [raffles, setRaffles] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Marketing modal state
  const [marketingTarget, setMarketingTarget] = useState(null); // { name, url }

  const [editingRaffle, setEditingRaffle] = useState(null); // null or raffle object

  const [form, setForm] = useState({
    name: '', nameEn: '', description: '', descriptionEn: '', slug: '', product: '', startDate: '', endDate: '', raffleNumber: '',
    prizes: [{ name: '', nameEn: '', value: '', image: '' }]
  });
  
  // Prize image files and previews
  const [prizeImageFiles, setPrizeImageFiles] = useState([]);
  const [prizeImagePreviews, setPrizeImagePreviews] = useState([]);

  const API = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    fetchRaffles();
    fetchProducts();
  }, []);

  const fetchRaffles = async () => {
    try {
      const res = await fetch(`${API}/api/raffles`);
      const data = await res.json();
      setRaffles(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load raffles');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/api/products?active=true`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products');
    }
  };

  const handlePrizeImageChange = (index, file) => {
    if (!file) return;

    const nextFiles = [...prizeImageFiles];
    nextFiles[index] = file;
    setPrizeImageFiles(nextFiles);

    const reader = new FileReader();
    reader.onloadend = () => {
      const nextPreviews = [...prizeImagePreviews];
      nextPreviews[index] = reader.result;
      setPrizeImagePreviews(nextPreviews);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description || '');
      formData.append('descriptionEn', form.descriptionEn || '');
      formData.append('slug', form.slug || '');
      formData.append('product', form.product);
      formData.append('startDate', form.startDate);
      formData.append('endDate', form.endDate);
      if (form.raffleNumber) {
        formData.append('raffleNumber', form.raffleNumber);
      }
      formData.append('prizes', JSON.stringify(form.prizes));

      prizeImageFiles.forEach((file, index) => {
        if (file) formData.append(`prizeImage_${index}`, file);
      });

      const url = editingRaffle ? `${API}/api/raffles/${editingRaffle._id}` : `${API}/api/raffles`;
      const method = editingRaffle ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error(editingRaffle ? 'Failed to update' : 'Failed to create');
      toast.success(editingRaffle ? 'Raffle updated' : 'Raffle created');
      resetForm();
      fetchRaffles();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const drawWinner = async (id) => {
    const confirmed = await new Promise((resolve) => {
      toast((t) => (
        <div className="space-y-2">
          <p className="text-sm">Draw winner now? This action cannot be undone.</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded bg-neutral-900 text-white text-xs" onClick={() => { toast.dismiss(t.id); resolve(true); }}>Confirm</button>
            <button className="px-3 py-1 rounded border text-xs" onClick={() => { toast.dismiss(t.id); resolve(false); }}>Cancel</button>
          </div>
        </div>
      ), { duration: 10000 });
    });
    if (!confirmed) return;
    try {
      const res = await fetch(`${API}/api/raffles/${id}/draw`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to draw');
      const data = await res.json();
      toast.success(`Winner: ${data.winner?.ticketNumber}`);
      fetchRaffles();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API}/api/raffles/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to update' }));
        throw new Error(err.message);
      }
      toast.success('Status updated');
      fetchRaffles();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (raffle) => {
    const confirmed = await new Promise((resolve) => {
      toast((t) => (
        <div className="space-y-2">
          <p className="text-sm">Delete this raffle? Linked tickets will be detached.</p>
          <p className="text-xs text-neutral-500">{raffle.name}</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded bg-red-600 text-white text-xs" onClick={() => { toast.dismiss(t.id); resolve(true); }}>Delete</button>
            <button className="px-3 py-1 rounded border text-xs" onClick={() => { toast.dismiss(t.id); resolve(false); }}>Cancel</button>
          </div>
        </div>
      ), { duration: 10000 });
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`${API}/api/raffles/${raffle._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete raffle');
      toast.success('Raffle deleted');
      fetchRaffles();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const addPrize = () => {
    setForm({ ...form, prizes: [...form.prizes, { name: '', nameEn: '', value: '', image: '' }] });
    setPrizeImageFiles((prev) => [...prev, null]);
    setPrizeImagePreviews((prev) => [...prev, null]);
  };
  
  const removePrize = (i) => {
    setForm({ ...form, prizes: form.prizes.filter((_, idx) => idx !== i) });
    setPrizeImageFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPrizeImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
  };
  
  const updatePrize = (i, field, val) => {
    const newPrizes = [...form.prizes];
    newPrizes[i][field] = val;
    setForm({ ...form, prizes: newPrizes });
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingRaffle(null);
    setForm({ name: '', nameEn: '', description: '', descriptionEn: '', slug: '', product: '', startDate: '', endDate: '', raffleNumber: '', prizes: [{ name: '', nameEn: '', value: '', image: '' }] });
    setPrizeImageFiles([]);
    setPrizeImagePreviews([]);
  };

  const startEdit = (raffle) => {
    setEditingRaffle(raffle);
    setForm({
      name: raffle.name || '',
      nameEn: raffle.nameEn || '',
      description: raffle.description || '',
      descriptionEn: raffle.descriptionEn || '',
      slug: raffle.slug || '',
      product: raffle.product?._id || raffle.product || '',
      startDate: raffle.startDate ? new Date(raffle.startDate).toISOString().slice(0, 16) : '',
      endDate: raffle.endDate ? new Date(raffle.endDate).toISOString().slice(0, 16) : '',
      raffleNumber: raffle.raffleNumber || '',
      prizes: raffle.prizes?.length ? raffle.prizes.map(p => ({ name: p.name || '', nameEn: p.nameEn || '', value: p.value || '', image: p.image || '' })) : [{ name: '', nameEn: '', value: '', image: '' }],
    });
    setPrizeImageFiles(raffle.prizes?.map(() => null) || []);
    setPrizeImagePreviews(raffle.prizes?.map(p => p.image || null) || []);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filtered = raffles.filter(r => r.name?.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const statusColors = {
    draft: 'bg-neutral-100 text-neutral-600',
    active: 'bg-emerald-100 text-emerald-700',
    closed: 'bg-blue-100 text-blue-700',
    drawn: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search raffles..."
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
          {showForm ? 'Cancel' : 'Create Raffle'}
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold mb-4">{editingRaffle ? 'Edit Raffle' : 'Create New Raffle'}</h2>
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
                    <label className="text-sm font-medium text-neutral-700 mb-1 block">Description (FR)</label>
                    <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1 block">Description (EN)</label>
                    <textarea value={form.descriptionEn} onChange={e => setForm({...form, descriptionEn: e.target.value})} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-neutral-700 mb-1 block">URL Slug <span className="text-neutral-400 font-normal">(optional, auto-generated if empty)</span></label>
                    <input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="e.g. summer-giveaway-2024" className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                    <p className="text-xs text-neutral-400 mt-1">Used in raffle URL: /raffles/your-slug</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-neutral-700 mb-1 block">Raffle Number <span className="text-neutral-400 font-normal">(auto-generated if empty)</span></label>
                      <input type="number" value={form.raffleNumber} onChange={e => setForm({...form, raffleNumber: e.target.value})} placeholder="e.g. 42" className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-700 mb-1 block">Product</label>
                      <select value={form.product} onChange={e => setForm({...form, product: e.target.value})} required className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900">
                        <option value="">Select product</option>
                        {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-neutral-700 mb-1 block">Start Date</label>
                      <input type="datetime-local" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-700 mb-1 block">End Date</label>
                      <input type="datetime-local" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-2 block">Prizes</label>
                  <div className="space-y-3">
                    {form.prizes.map((prize, i) => (
                      <div key={i} className="flex flex-wrap gap-2 items-start bg-neutral-50 rounded-lg p-3">
                        <div className="flex flex-wrap gap-2 flex-1">
                          <input value={prize.name} onChange={e => updatePrize(i, 'name', e.target.value)} placeholder="Prize name (FR)" className="flex-1 min-w-[120px] px-4 py-2 rounded-xl border border-neutral-200 text-sm" />
                          <input value={prize.nameEn} onChange={e => updatePrize(i, 'nameEn', e.target.value)} placeholder="Prize name (EN)" className="flex-1 min-w-[120px] px-4 py-2 rounded-xl border border-neutral-200 text-sm" />
                          <input type="number" value={prize.value} onChange={e => updatePrize(i, 'value', e.target.value)} placeholder="Value" className="w-24 px-4 py-2 rounded-xl border border-neutral-200 text-sm" />
                          {form.prizes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePrize(i)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove prize"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        {/* Prize Image Upload */}
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 px-3 py-2 border border-neutral-200 rounded-lg cursor-pointer bg-white hover:bg-neutral-50 transition-colors">
                            <Upload className="w-4 h-4 text-neutral-500" />
                            <span className="text-xs text-neutral-600">
                              {prizeImageFiles[i]?.name || (prize.image ? 'Change' : 'Image')}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handlePrizeImageChange(i, e.target.files?.[0])}
                              className="hidden"
                            />
                          </label>
                          
                          {(prizeImagePreviews[i] || prize.image) ? (
                            <img
                              src={prizeImagePreviews[i] || prize.image}
                              alt={prize.name || `prize-${i}`}
                              className="w-10 h-10 rounded-lg object-cover border border-neutral-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-neutral-200 flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-neutral-400" />
                            </div>
                          )}
                          
                          {form.prizes.length > 1 && (
                            <button type="button" onClick={() => removePrize(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><X className="w-4 h-4" /></button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={addPrize} className="px-4 py-2 bg-neutral-100 rounded-xl text-sm font-medium hover:bg-neutral-200 transition-colors">+ Add Prize</button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-medium">{editingRaffle ? 'Update Raffle' : 'Create Raffle'}</motion.button>
                  <button type="button" onClick={resetForm} className="px-6 py-2.5 border border-neutral-200 rounded-xl text-sm hover:bg-neutral-50">Cancel</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Raffle</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">End Date</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Winner</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((raffle) => (
                    <motion.tr
                      key={raffle._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium">{raffle.name}</div>
                        <div className="text-xs text-neutral-500">{raffle.prizes?.length || 0} prizes</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <img src={raffle.product?.images?.[0]} alt="" className="w-8 h-8 rounded-lg object-cover" />
                          <span className="text-sm">{raffle.product?.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-neutral-500">
                        {raffle.endDate ? new Date(raffle.endDate).toLocaleDateString('fr-CH') : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={raffle.status}
                          onChange={e => updateStatus(raffle._id, e.target.value)}
                          className={`px-2 py-1 rounded-lg text-xs font-medium border-0 ${statusColors[raffle.status] || statusColors.draft}`}
                        >
                          <option value="draft">Draft</option>
                          <option value="active">Active</option>
                          <option value="closed">Closed</option>
                          <option value="drawn">Drawn</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        {raffle.winner ? (
                          <span className="flex items-center gap-1 text-xs text-amber-600">
                            <Trophy className="w-3 h-3" />
                            {raffle.winningTicket}
                          </span>
                        ) : (
                          <span className="text-xs text-neutral-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setMarketingTarget({
                              name: raffle.name,
                              url: `${process.env.NEXT_PUBLIC_SITE_URL}/en/raffles`,
                            })}
                            className="p-1.5 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                            title="Email Marketing"
                          >
                            <Megaphone className="w-4 h-4" />
                          </button>
                          {raffle.canDraw ? (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => drawWinner(raffle._id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-200 transition-colors"
                            >
                              <Sparkles className="w-3 h-3" />
                              Draw
                            </motion.button>
                          ) : raffle.status === 'active' && new Date(raffle.endDate) > new Date() ? (
                            <span className="text-xs text-neutral-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {Math.ceil((new Date(raffle.endDate) - new Date()) / (1000 * 60 * 60 * 24))}d left
                            </span>
                          ) : raffle.status === 'active' && new Date(raffle.endDate) <= new Date() ? (
                            <span className="text-xs text-amber-600 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              Ready to draw
                            </span>
                          ) : null}
                          <button
                            onClick={() => startEdit(raffle)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit raffle"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(raffle)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete raffle"
                          >
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
                <Ticket className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500 text-sm">No raffles found</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200">
                <p className="text-sm text-neutral-500">{filtered.length} raffles</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 rounded-lg hover:bg-neutral-100 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                  <span className="text-sm font-medium">{currentPage} / {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1 rounded-lg hover:bg-neutral-100 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
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
