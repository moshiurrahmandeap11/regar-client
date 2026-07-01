'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Ticket, Trophy,
  Star, FileText, Settings, BarChart3, LogOut, Menu, X, Store
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { id: 'products', label: 'Products', icon: Package, href: '/admin/products' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
  { id: 'users', label: 'Users', icon: Users, href: '/admin/users' },
  { id: 'raffles', label: 'Raffles', icon: Ticket, href: '/admin/raffles' },
  { id: 'winners', label: 'Winners', icon: Trophy, href: '/admin/winners' },
  { id: 'reviews', label: 'Reviews', icon: Star, href: '/admin/reviews' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
  { id: 'content', label: 'Content', icon: FileText, href: '/admin/content' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
];

export default function AdminLayoutClient({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user?.isAdmin) {
      router.push('/fr/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user?.isAdmin) return null;

  const activeTab = menuItems.find(item => pathname.includes(item.href))?.id || 'dashboard';

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-neutral-900 text-white fixed inset-y-0 left-0 z-50">
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-neutral-900 font-bold text-lg">R</span>
            </div>
            <div>
              <span className="font-bold text-lg block leading-tight">Admin</span>
              <span className="text-xs text-neutral-400">Panel</span>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-white/10 text-white'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {activeTab === item.id && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 bg-amber-500 rounded-full"
                  />
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-3">
            <div className="w-8 h-8 bg-neutral-700 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">{user.firstName?.[0]}{user.lastName?.[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-neutral-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.push('/fr/login'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-neutral-900 text-white lg:hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <span className="text-neutral-900 font-bold text-sm">R</span>
                    </div>
                    <span className="font-bold">Admin</span>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        activeTab === item.id ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <button
                  onClick={() => { logout(); router.push('/fr/login'); }}
                  className="mt-8 w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 min-w-0">
        <header className="bg-white border-b border-neutral-200 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold capitalize">{menuItems.find(i => i.id === activeTab)?.label || 'Dashboard'}</h1>
          </div>
          <Link href="/" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
            <Store className="w-4 h-4" />
            <span className="hidden sm:inline">View Store</span>
          </Link>
        </header>

        <main className="p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
