'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { FadeIn } from '@/components/animations';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const locale = useLocale();
  const router = useRouter();
  const { register, user, loading } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Redirect logged-in users away from signup page
  useEffect(() => {
    if (!loading && user) {
      router.push(user.isAdmin ? '/admin/dashboard' : `/${locale}/`);
    }
  }, [user, loading, router, locale]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error(locale === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      toast.success(locale === 'fr' ? 'Compte cree !' : 'Account created!');
      router.push(`/${locale}/`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full" /></div>;
  if (user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <FadeIn className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-neutral-200 p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {locale === 'fr' ? 'Creer un compte' : 'Create account'}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1 block">
                  {locale === 'fr' ? 'Prenom' : 'First name'}
                </label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1 block">
                  {locale === 'fr' ? 'Nom' : 'Last name'}
                </label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1 block">
                {locale === 'fr' ? 'Mot de passe' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1 block">
                {locale === 'fr' ? 'Confirmer' : 'Confirm'}
              </label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-neutral-900 text-white font-medium rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {submitting ? (locale === 'fr' ? 'Creation...' : 'Creating...') : (locale === 'fr' ? 'S\'inscrire' : 'Sign up')}
            </motion.button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-6">
            {locale === 'fr' ? 'Deja un compte ?' : 'Already have an account?'}{' '}
            <Link href="/login" className="text-neutral-900 font-medium hover:underline">
              {locale === 'fr' ? 'Se connecter' : 'Log in'}
            </Link>
          </p>
        </div>
      </FadeIn>
    </div>
  );
}
