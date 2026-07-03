'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const token = params.get('token');
  const defaultEmail = params.get('email') || '';
  const [email, setEmail] = useState(defaultEmail);
  const [verifying, setVerifying] = useState(Boolean(token));
  const [verified, setVerified] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (!token) return;
      setVerifying(true);
      try {
        await api.get(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        setVerified(true);
        toast.success('Email verified successfully');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Verification failed');
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [token]);

  const resendEmail = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    setSending(true);
    try {
      const res = await api.post('/api/auth/resend-verification', { email });
      toast.success(res.data?.message || 'Verification email sent');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send verification email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl border border-neutral-200 p-8">
          <h1 className="text-2xl font-bold text-neutral-900">Email verification</h1>
          <p className="text-sm text-neutral-500 mt-2">Verify your email to activate your account.</p>

          {verifying ? <p className="text-sm mt-5 text-neutral-600">Verifying your email...</p> : null}
          {verified ? (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              Email verified. You can now log in.
            </div>
          ) : null}

          <form onSubmit={resendEmail} className="mt-6 space-y-3">
            <label className="text-sm font-medium text-neutral-700 block">Resend verification email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
            />
            <button
              type="submit"
              disabled={sending}
              className="w-full py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-medium disabled:opacity-60"
            >
              {sending ? 'Sending...' : 'Resend email'}
            </button>
          </form>

          <Link href="/login" className="mt-5 inline-block text-sm text-neutral-700 hover:text-neutral-900">
            Go to login
          </Link>
        </div>
      </div>
    </div>
  );
}
