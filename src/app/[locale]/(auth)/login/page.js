'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { FadeIn } from '@/components/animations';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const locale = useLocale();
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success(locale === 'fr' ? 'Connecte !' : 'Logged in!');
      router.push(`/${locale}/dashboard`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <FadeIn className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-neutral-200 p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {locale === 'fr' ? 'Connexion' : 'Login'}
            </h1>
            <p className="text-neutral-500 mt-2 text-sm">
              {locale === 'fr' ? 'Bienvenue sur Regar' : 'Welcome to Regar'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                  placeholder="you@example.com"
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
                  value={password}
                  onChange={e => setPassword(e.target.value)}
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
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-neutral-900 text-white font-medium rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {loading ? (locale === 'fr' ? 'Connexion...' : 'Logging in...') : (locale === 'fr' ? 'Se connecter' : 'Log in')}
            </motion.button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-6">
            {locale === 'fr' ? 'Pas encore de compte ?' : "Don't have an account?"}{' '}
            <Link href="/signup" className="text-neutral-900 font-medium hover:underline">
              {locale === 'fr' ? 'S\'inscrire' : 'Sign up'}
            </Link>
          </p>
        </div>
      </FadeIn>
    </div>
  );
}
