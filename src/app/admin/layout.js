import { Toaster } from 'react-hot-toast';
import '../[locale]/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata = {
  title: 'Admin - Regar',
  description: 'Admin Panel',
};

export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      {children}
      <Toaster position="top-center" />
    </AuthProvider>
  );
}
