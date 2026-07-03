'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function PasswordResetPage() {
  const params = useSearchParams();
  const token = params.get('token');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submitForgot = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      toast.success(res.data?.message || 'Reset email sent');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e) => {
    e.preventDefault();

    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/reset-password', {
        token,
        newPassword: password,
      });
      toast.success(res.data?.message || 'Password reset successful');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl border border-neutral-200 p-8">
          <h1 className="text-2xl font-bold text-neutral-900">Reset password</h1>
          <p className="text-sm text-neutral-500 mt-2">
            {token ? 'Enter your new password below.' : 'Enter your account email and we will send a reset link.'}
          </p>

          {!token ? (
            <form onSubmit={submitForgot} className="mt-6 space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
              />
              <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-medium disabled:opacity-60">
                {loading ? 'Sending...' : 'Send reset email'}
              </button>
            </form>
          ) : (
            <form onSubmit={submitReset} className="mt-6 space-y-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
              />
              <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-medium disabled:opacity-60">
                {loading ? 'Saving...' : 'Reset password'}
              </button>
            </form>
          )}

          <Link href="/login" className="mt-5 inline-block text-sm text-neutral-700 hover:text-neutral-900">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
