import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Toaster } from 'react-hot-toast';
import '../[locale]/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata = {
  title: 'Admin - Regar',
  description: 'Admin Panel',
};

export default async function AdminLayout({ children, params }) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthProvider>
            {children}
            <Toaster position="top-center" />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
