'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Gift, Ticket, ShoppingCart, Package, Users, Trophy,
  CreditCard, BarChart3, FileText, Bell, Settings, MessageSquare, Activity,
  Crown, Search, ChevronDown, Calendar, LogOut, User, X, CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { id: 'giveaways', label: 'Giveaways', icon: Gift, href: '/admin/raffles' },
  { id: 'entries', label: 'Entries', icon: Ticket, href: '/admin/tickets' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
  { id: 'products', label: 'Products (Caps)', icon: Package, href: '/admin/products' },
  { id: 'users', label: 'Users', icon: Users, href: '/admin/users' },
  { id: 'winners', label: 'Winners', icon: Trophy, href: '/admin/winners' },
  { id: 'payouts', label: 'Payouts', icon: CreditCard, href: '/admin/payments' },
  { id: 'reports', label: 'Reports', icon: BarChart3, href: '/admin/analytics' },
  { id: 'content', label: 'Pages & Content', icon: FileText, href: '/admin/content' },
  { id: 'notifications', label: 'Notifications', icon: Bell, href: '/admin/notifications' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
  { id: 'support', label: 'Support Tickets', icon: MessageSquare, href: '/admin/contacts' },
  { id: 'logs', label: 'Activity Logs', icon: Activity, href: '/admin/draw-history' },
];

export default function AdminLayoutClient({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);
  
  // Notifications state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifUnread, setNotifUnread] = useState(0);
  const notifRef = useRef(null);
  
  // User dropdown state
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);
  
  // Active raffles for sidebar promo
  const [activeRaffles, setActiveRaffles] = useState([]);

  useEffect(() => {
    if (!loading && !user?.isAdmin) {
      router.push('/fr/login');
    }
  }, [loading, user, router]);

  // Fetch notifications and active raffles
  useEffect(() => {
    if (!user?.isAdmin) return;
    
    const fetchData = async () => {
      try {
        // Fetch recent orders for notifications
        const [ordersRes, rafflesRes] = await Promise.all([
          api.get('/api/orders').catch(() => ({ data: [] })),
          api.get('/api/raffles?status=active').catch(() => ({ data: [] })),
        ]);
        
        const orders = Array.isArray(ordersRes.data) ? ordersRes.data.slice(0, 5) : [];
        const raffles = Array.isArray(rafflesRes.data) ? rafflesRes.data : [];
        
        setActiveRaffles(raffles);
        
        // Build notifications from real data
        const notifs = [];
        
        orders.forEach((order, i) => {
          if (order.status === 'awaiting_payment') {
            notifs.push({
              id: `order-${order._id}`,
              type: 'order',
              title: 'New Order',
              message: `Order ${order.orderNumber} awaiting payment`,
              time: new Date(order.createdAt).toLocaleDateString(),
              read: i > 1,
              link: '/admin/orders',
            });
          }
        });
        
        raffles.forEach((raffle) => {
          if (raffle.canDraw) {
            notifs.push({
              id: `raffle-${raffle._id}`,
              type: 'raffle',
              title: 'Raffle Ready to Draw',
              message: `${raffle.name} is eligible for winner draw`,
              time: 'Now',
              read: false,
              link: '/admin/draw',
            });
          }
        });
        
        setNotifications(notifs.slice(0, 6));
        setNotifUnread(notifs.filter(n => !n.read).length);
      } catch (error) {
        console.error('Admin layout data fetch error:', error);
      }
    };
    
    fetchData();
  }, [user]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search handler
  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // Route to relevant page based on search query
      const q = searchQuery.toLowerCase().trim();
      if (q.includes('order')) router.push('/admin/orders');
      else if (q.includes('product') || q.includes('cap')) router.push('/admin/products');
      else if (q.includes('user')) router.push('/admin/users');
      else if (q.includes('raffle') || q.includes('giveaway')) router.push('/admin/raffles');
      else if (q.includes('ticket') || q.includes('entry')) router.push('/admin/tickets');
      else if (q.includes('winner')) router.push('/admin/winners');
      else if (q.includes('payment')) router.push('/admin/payments');
      else router.push('/admin/dashboard');
      setSearchQuery('');
      setSearchFocused(false);
    }
  };

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setNotifUnread(prev => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setNotifUnread(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user?.isAdmin) return null;

  const activeTab = menuItems.find(item => pathname.includes(item.href))?.id || 'dashboard';
  
  const activeRaffle = activeRaffles[0];

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0f0f0f] text-white fixed inset-y-0 left-0 z-50">
        <div className="p-5 flex-1 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 flex items-center justify-center">
              <Crown className="w-6 h-6 text-amber-400" />
            </div>
            <span className="font-bold text-lg tracking-wide text-white">CAPRAFFLE</span>
          </div>

          {/* Navigation */}
          <nav className="space-y-0.5">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-[#b88238] text-white'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-white/10 space-y-3">
          {/* Promo Card */}
          <div className="bg-neutral-800 rounded-xl p-3.5">
            <div className="w-10 h-10 bg-neutral-700 rounded-lg flex items-center justify-center mb-2.5">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-sm font-semibold text-white mb-0.5">Raffle is Live!</p>
            <p className="text-xs text-neutral-400 mb-3">
              {activeRaffle ? activeRaffle.name : 'No active raffle'}
            </p>
            <Link 
              href={activeRaffle ? `/admin/raffles` : '/admin/raffles'}
              className="block w-full bg-[#b88238] hover:bg-[#a07030] text-white text-xs font-medium py-2 rounded-lg transition-colors text-center"
            >
              View Giveaway
            </Link>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-neutral-700 flex items-center justify-center shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-medium text-white">{user.firstName?.[0]}{user.lastName?.[0]}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.firstName || 'Admin'} {user.lastName || 'User'}</p>
              <p className="text-xs text-neutral-400 truncate">Super Admin</p>
            </div>
            <button
              onClick={() => { logout(); router.push('/fr/login'); }}
              className="p-1.5 text-neutral-400 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 25 }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-[#0f0f0f] text-white lg:hidden"
      >
        <div className="p-5 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <Crown className="w-6 h-6 text-amber-400" />
              <span className="font-bold text-lg tracking-wide">CAPRAFFLE</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-1 text-neutral-400">
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="space-y-0.5 flex-1 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-[#b88238] text-white'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="pt-3 border-t border-white/10">
            {/* Mobile Promo Card */}
            <div className="bg-neutral-800 rounded-xl p-3 mb-3">
              <p className="text-xs font-semibold text-white mb-0.5">Raffle is Live!</p>
              <p className="text-xs text-neutral-400 mb-2">
                {activeRaffle ? activeRaffle.name : 'No active raffle'}
              </p>
              <Link 
                href="/admin/raffles"
                onClick={() => setSidebarOpen(false)}
                className="block w-full bg-[#b88238] text-white text-xs font-medium py-1.5 rounded-lg text-center"
              >
                View Giveaway
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-neutral-700 flex items-center justify-center shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-medium">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.firstName || 'Admin'} {user.lastName || 'User'}</p>
                <p className="text-xs text-neutral-400 truncate">Super Admin</p>
              </div>
              <button
                onClick={() => { logout(); router.push('/fr/login'); }}
                className="p-1.5 text-neutral-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-neutral-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg text-neutral-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-neutral-900 capitalize">
              {menuItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search */}
            <div 
              ref={searchRef}
              className={`hidden sm:flex items-center rounded-lg px-3 py-2 w-64 transition-all ${
                searchFocused ? 'bg-white border border-amber-300 ring-2 ring-amber-100' : 'bg-neutral-100'
              }`}
            >
              <Search className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={handleSearch}
                className="bg-transparent text-sm text-neutral-700 placeholder-neutral-400 outline-none w-full"
              />
              {searchQuery && (
                <button 
                  onClick={() => { setSearchQuery(''); setSearchFocused(false); }}
                  className="ml-1 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Date Range */}
            <div className="hidden md:flex items-center gap-2 bg-neutral-100 rounded-lg px-3 py-2">
              <Calendar className="w-4 h-4 text-neutral-500" />
              <span className="text-sm text-neutral-600">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 hover:bg-neutral-100 rounded-lg text-neutral-600 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {notifUnread > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-neutral-200 shadow-lg z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                    <h3 className="font-semibold text-sm text-neutral-900">Notifications</h3>
                    {notifUnread > 0 && (
                      <button 
                        onClick={markAllRead}
                        className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-neutral-400">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id}
                          onClick={() => { markAsRead(notif.id); router.push(notif.link); setNotifOpen(false); }}
                          className={`px-4 py-3 border-b border-neutral-50 hover:bg-neutral-50 cursor-pointer transition-colors ${
                            !notif.read ? 'bg-amber-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.read ? 'bg-neutral-300' : 'bg-amber-500'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-neutral-900">{notif.title}</p>
                              <p className="text-xs text-neutral-500 mt-0.5">{notif.message}</p>
                              <p className="text-xs text-neutral-400 mt-1">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-neutral-100">
                    <Link 
                      href="/admin/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="text-xs text-amber-600 hover:text-amber-700 font-medium text-center block"
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="hidden sm:flex items-center gap-2 hover:bg-neutral-100 rounded-lg px-2 py-1.5 transition-colors"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-200 flex items-center justify-center">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-medium text-neutral-600">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-neutral-900 leading-tight">{user.firstName || 'Admin'} {user.lastName || 'User'}</p>
                  <p className="text-xs text-neutral-500 leading-tight">Super Admin</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-neutral-200 shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-neutral-100">
                    <p className="text-sm font-semibold text-neutral-900">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-neutral-500">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link 
                      href="/admin/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <button 
                      onClick={() => { setUserDropdownOpen(false); logout(); router.push('/fr/login'); }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
