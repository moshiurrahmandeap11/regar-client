'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Store, Mail, Phone, Instagram, Facebook, Twitter, Globe, Truck, CreditCard } from 'lucide-react';
import { FadeIn } from '@/components/animations';
import toast from 'react-hot-toast';

export default function SettingsContent() {
  const [settings, setSettings] = useState({
    siteName: 'Regar',
    siteNameEn: 'Regar',
    contactEmail: 'contact@regar.ch',
    contactPhone: '+41 79 123 45 67',
    currency: 'CHF',
    shippingCost: 9.90,
    freeShippingThreshold: 100,
    maintenanceMode: false,
    socialLinks: { instagram: '', facebook: '', twitter: '', tiktok: '' },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API}/api/content/settings`);
      const data = await res.json();
      if (data) {
        setSettings({
          siteName: data.siteName || 'Regar',
          siteNameEn: data.siteNameEn || 'Regar',
          contactEmail: data.contactEmail || 'contact@regar.ch',
          contactPhone: data.contactPhone || '+41 79 123 45 67',
          currency: data.currency || 'CHF',
          shippingCost: data.shippingCost || 9.90,
          freeShippingThreshold: data.freeShippingThreshold || 100,
          maintenanceMode: data.maintenanceMode || false,
          socialLinks: data.socialLinks || { instagram: '', facebook: '', twitter: '', tiktok: '' },
        });
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/content/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateSocial = (platform, value) => {
    setSettings({
      ...settings,
      socialLinks: { ...settings.socialLinks, [platform]: value }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <FadeIn>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Site Info */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-neutral-600" />
            </div>
            <h2 className="text-lg font-semibold">Site Information</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1 block">Site Name (FR)</label>
              <input value={settings.siteName} onChange={e => setSettings({...settings, siteName: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1 block">Site Name (EN)</label>
              <input value={settings.siteNameEn} onChange={e => setSettings({...settings, siteNameEn: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-neutral-600" />
            </div>
            <h2 className="text-lg font-semibold">Contact Information</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1 block">Contact Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input value={settings.contactEmail} onChange={e => setSettings({...settings, contactEmail: e.target.value})} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1 block">Contact Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input value={settings.contactPhone} onChange={e => setSettings({...settings, contactPhone: e.target.value})} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
              </div>
            </div>
          </div>
        </div>

        {/* Shipping & Pricing */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-neutral-600" />
            </div>
            <h2 className="text-lg font-semibold">Shipping & Pricing</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1 block">Currency</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input value={settings.currency} onChange={e => setSettings({...settings, currency: e.target.value})} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1 block">Shipping Cost</label>
              <input type="number" step="0.01" value={settings.shippingCost} onChange={e => setSettings({...settings, shippingCost: parseFloat(e.target.value)})} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1 block">Free Shipping Over</label>
              <input type="number" step="0.01" value={settings.freeShippingThreshold} onChange={e => setSettings({...settings, freeShippingThreshold: parseFloat(e.target.value)})} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-neutral-600" />
            </div>
            <h2 className="text-lg font-semibold">Social Media</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1 block">Instagram</label>
              <div className="relative">
                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input value={settings.socialLinks.instagram} onChange={e => updateSocial('instagram', e.target.value)} placeholder="@regar" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1 block">Facebook</label>
              <div className="relative">
                <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input value={settings.socialLinks.facebook} onChange={e => updateSocial('facebook', e.target.value)} placeholder="regar" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1 block">Twitter</label>
              <div className="relative">
                <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input value={settings.socialLinks.twitter} onChange={e => updateSocial('twitter', e.target.value)} placeholder="@regar" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1 block">TikTok</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input value={settings.socialLinks.tiktok} onChange={e => updateSocial('tiktok', e.target.value)} placeholder="@regar" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Maintenance Mode</h2>
              <p className="text-sm text-neutral-500">Temporarily disable the storefront</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={e => setSettings({...settings, maintenanceMode: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-neutral-900/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900" />
            </label>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 bg-neutral-900 text-white font-medium rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save All Settings'}
        </motion.button>
      </form>
    </FadeIn>
  );
}
