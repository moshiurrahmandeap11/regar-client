'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Store, Mail, Phone, Instagram, Facebook, Twitter, Globe, Truck, CreditCard, Plus, Trash2 } from 'lucide-react';
import { FadeIn } from '@/components/animations';
import toast from 'react-hot-toast';

export default function SettingsContent() {
  const [settings, setSettings] = useState({
    siteName: 'Regar',
    siteNameEn: 'Regar',
    contactEmail: 'support@regar.ch',
    contactPhone: '+41 79 123 45 67',
    currency: 'CHF',
    shippingCost: 9.90,
    freeShippingThreshold: 100,
    maintenanceMode: false,
    socialLinks: { instagram: '', facebook: '', twitter: '', tiktok: '' },
    newsletterTemplates: [],
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
          contactEmail: data.contactEmail || 'support@regar.ch',
          contactPhone: data.contactPhone || '+41 79 123 45 67',
          currency: data.currency || 'CHF',
          shippingCost: data.shippingCost || 9.90,
          freeShippingThreshold: data.freeShippingThreshold || 100,
          maintenanceMode: data.maintenanceMode || false,
          socialLinks: data.socialLinks || { instagram: '', facebook: '', twitter: '', tiktok: '' },
          newsletterTemplates: Array.isArray(data.newsletterTemplates) ? data.newsletterTemplates : [],
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

  const MARKETING_TEMPLATE_PRESET = {
    name: 'Marketing — Product Drop',
    subject: '🎉 New drop from {{siteName}}: {{productName}}',
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1f2937;">
  <div style="background:#111827;padding:24px 32px;border-radius:12px 12px 0 0;">
    <h1 style="margin:0;color:#ffffff;font-size:22px;letter-spacing:1px;">{{siteName}}</h1>
  </div>
  <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;">
    <h2 style="margin:0 0 12px;font-size:20px;color:#111827;">New drop — {{productName}}</h2>
    <p style="margin:0 0 20px;color:#4b5563;line-height:1.7;">
      Hi {{email}},<br><br>
      We have something exciting for you. Check out the latest addition to the Regar collection.
    </p>
    <a href="{{productUrl}}"
       style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;
              padding:14px 28px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.5px;">
      View Now →
    </a>
    <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;">
      You're receiving this because you subscribed to {{siteName}} updates.<br>
      {{year}} © {{siteName}}
    </p>
  </div>
</div>`,
    type: 'BULK',
    isDefault: true,
  };

  const addMarketingPreset = () => {
    const already = (settings.newsletterTemplates || []).some(
      (t) => t.name === MARKETING_TEMPLATE_PRESET.name,
    );
    if (already) {
      toast('Marketing template already exists');
      return;
    }
    // If we're marking this as default, unset any other BULK defaults
    const updated = (settings.newsletterTemplates || []).map((t) =>
      t.type === 'BULK' ? { ...t, isDefault: false } : t,
    );
    setSettings({
      ...settings,
      newsletterTemplates: [...updated, { ...MARKETING_TEMPLATE_PRESET }],
    });
    toast.success('Marketing template added — save settings to persist it');
  };

  const addTemplate = () => {
    setSettings({
      ...settings,
      newsletterTemplates: [
        ...(settings.newsletterTemplates || []),
        {
          name: '',
          subject: '',
          html: '',
          type: 'BULK',
          isDefault: false,
        },
      ],
    });
  };

  const updateTemplate = (index, field, value) => {
    const updatedTemplates = [...(settings.newsletterTemplates || [])];
    updatedTemplates[index] = { ...updatedTemplates[index], [field]: value };
    setSettings({ ...settings, newsletterTemplates: updatedTemplates });
  };

  const removeTemplate = (index) => {
    const updatedTemplates = [...(settings.newsletterTemplates || [])];
    updatedTemplates.splice(index, 1);
    setSettings({ ...settings, newsletterTemplates: updatedTemplates });
  };

  const setTemplateDefault = (index) => {
    const templates = [...(settings.newsletterTemplates || [])];
    const current = templates[index];
    if (!current) return;

    const updatedTemplates = templates.map((template, templateIndex) => {
      if (template.type !== current.type) return template;
      return { ...template, isDefault: templateIndex === index };
    });

    setSettings({ ...settings, newsletterTemplates: updatedTemplates });
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
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-neutral-900/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900" />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold">Newsletter Email Templates</h2>
              <p className="text-sm text-neutral-500">Add HTML templates for instant thank-you and bulk emails.</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={addMarketingPreset}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 text-sm hover:bg-neutral-50 text-neutral-700"
              >
                <Plus className="w-4 h-4" />
                Marketing Preset
              </button>
              <button
                type="button"
                onClick={addTemplate}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-900 text-white text-sm hover:bg-neutral-800"
              >
                <Plus className="w-4 h-4" />
                Add Template
              </button>
            </div>
          </div>

          <div className="rounded-xl border bg-neutral-50 p-3 text-xs text-neutral-600 mb-4 space-y-1">
            <p className="font-medium text-neutral-700">Available variables</p>
            <p>
              <span className="font-mono">{'{{email}}'}</span> &nbsp;
              <span className="font-mono">{'{{siteName}}'}</span> &nbsp;
              <span className="font-mono">{'{{year}}'}</span>
            </p>
            <p className="text-neutral-500">Marketing sends also support:</p>
            <p>
              <span className="font-mono">{'{{productName}}'}</span> &nbsp;
              <span className="font-mono">{'{{productUrl}}'}</span> &nbsp;
              <span className="font-mono">{'{{productLink}}'}</span>
              <span className="text-neutral-400"> (renders as a clickable &lt;a&gt; tag)</span>
            </p>
          </div>

          {(!settings.newsletterTemplates || settings.newsletterTemplates.length === 0) ? (
            <p className="text-sm text-neutral-500">No templates yet. Add one of type THANK_YOU and one of type BULK.</p>
          ) : (
            <div className="space-y-4">
              {settings.newsletterTemplates.map((template, index) => (
                <div key={template._id || index} className="rounded-xl border border-neutral-200 p-4 bg-white space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-neutral-700 mb-1 block">Template Name</label>
                      <input
                        value={template.name || ''}
                        onChange={(e) => updateTemplate(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm"
                        placeholder="Summer Promotion"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-700 mb-1 block">Template Type</label>
                      <select
                        value={template.type || 'BULK'}
                        onChange={(e) => updateTemplate(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm"
                      >
                        <option value="BULK">BULK</option>
                        <option value="THANK_YOU">THANK_YOU</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1 block">Email Subject</label>
                    <input
                      value={template.subject || ''}
                      onChange={(e) => updateTemplate(index, 'subject', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm"
                      placeholder="Thanks for subscribing"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1 block">HTML Body</label>
                    <textarea
                      value={template.html || ''}
                      onChange={(e) => updateTemplate(index, 'html', e.target.value)}
                      rows={8}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm font-mono"
                      placeholder="<h1>Hello {{email}}</h1>"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
                      <input
                        type="checkbox"
                        checked={!!template.isDefault}
                        onChange={() => setTemplateDefault(index)}
                      />
                      Set as default for this template type
                    </label>

                    <button
                      type="button"
                      onClick={() => removeTemplate(index)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
