'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Save, Camera, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { FadeIn } from '@/components/animations';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const locale = useLocale();
  const router = useRouter();
  const { user, loading, updateProfile } = useAuth();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    street: '', city: '', zip: '', country: '',
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/login`);
    } else if (user) {
      setForm({
        firstName: user.firstName || '', lastName: user.lastName || '',
        email: user.email || '', phone: user.phone || '',
        street: user.address?.street || '', city: user.address?.city || '',
        zip: user.address?.zip || '', country: user.address?.country || '',
      });
      setAvatarPreview(user.avatar || null);
    }
  }, [user, loading, router, locale]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('firstName', form.firstName);
      formData.append('lastName', form.lastName);
      formData.append('phone', form.phone);
      formData.append('address', JSON.stringify({
        street: form.street, city: form.city, zip: form.zip, country: form.country,
      }));
      if (avatarFile) formData.append('avatar', avatarFile);

      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to update');
      const updatedUser = await res.json();
      // Update local user state
      window.dispatchEvent(new CustomEvent('user-updated', { detail: updatedUser }));
      toast.success(locale === 'fr' ? 'Profil mis a jour' : 'Profile updated');
    } catch (error) {
      toast.error(error.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full" /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h1 className="text-2xl font-bold text-neutral-900 mb-8">
            {locale === 'fr' ? 'Mon profil' : 'My profile'}
          </h1>

          <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8">
            {/* Avatar Section */}
            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-neutral-200 flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-neutral-400" />
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-neutral-900 rounded-full flex items-center justify-center cursor-pointer hover:bg-neutral-700 transition-colors shadow-md">
                  <Camera className="w-4 h-4 text-white" />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
              <div>
                <h2 className="font-semibold text-lg">{user.firstName} {user.lastName}</h2>
                <p className="text-sm text-neutral-500">{user.email}</p>
                {avatarFile && (
                  <p className="text-xs text-amber-600 mt-1">{locale === 'fr' ? 'Nouvelle photo selectionnee' : 'New photo selected'}</p>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1 block">{locale === 'fr' ? 'Prenom' : 'First name'}</label>
                  <input type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1 block">{locale === 'fr' ? 'Nom' : 'Last name'}</label>
                  <input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1 block">Email</label>
                <input type="email" value={form.email} disabled className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1 block">{locale === 'fr' ? 'Telephone' : 'Phone'}</label>
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm" />
              </div>

              <div className="border-t border-neutral-200 pt-4">
                <h3 className="font-medium text-neutral-900 mb-3">{locale === 'fr' ? 'Adresse' : 'Address'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-neutral-700 mb-1 block">{locale === 'fr' ? 'Rue' : 'Street'}</label>
                    <input type="text" value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1 block">{locale === 'fr' ? 'Ville' : 'City'}</label>
                    <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1 block">{locale === 'fr' ? 'Code postal' : 'ZIP'}</label>
                    <input type="text" value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1 block">{locale === 'fr' ? 'Pays' : 'Country'}</label>
                    <input type="text" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm" />
                  </div>
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 py-3 bg-neutral-900 text-white font-medium rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50">
                <Save className="w-4 h-4" />
                {saving ? (locale === 'fr' ? 'Enregistrement...' : 'Saving...') : (locale === 'fr' ? 'Enregistrer' : 'Save')}
              </motion.button>
            </form>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
