'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Gift, Ticket, ShoppingCart, Package, Users, Trophy,
  CreditCard, BarChart3, FileText, Bell, Settings, MessageSquare, Activity,
  Crown, Search, ChevronDown, Calendar, LogOut, User, X, CheckCircle, Sparkles,
  Menu, Home, Construction
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';
import BrandLogo from '@/components/BrandLogo';
import { routing } from '@/i18n/routing';

const allMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { id: 'giveaways', label: 'Giveaways', icon: Gift, href: '/admin/raffles' },
  { id: 'entries', label: 'Entries', icon: Ticket, href: '/admin/tickets' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
  { id: 'products', label: 'Products', icon: Package, href: '/admin/products' },
  { id: 'users', label: 'Users', icon: Users, href: '/admin/users' },
  { id: 'winners', label: 'Winners', icon: Trophy, href: '/admin/winners' },
  { id: 'draw', label: 'Draw', icon: Sparkles, href: '/admin/draw' },
  { id: 'payouts', label: 'Payouts', icon: CreditCard, href: '/admin/payments' },
  { id: 'reports', label: 'Reports', icon: BarChart3, href: '/admin/analytics' },
  { id: 'content', label: 'Content', icon: FileText, href: '/admin/content' },
  { id: 'notifications', label: 'Notif', icon: Bell, href: '/admin/notifications' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
  { id: 'support', label: 'Support', icon: MessageSquare, href: '/admin/contacts' },
  { id: 'logs', label: 'Logs', icon: Activity, href: '/admin/draw-history' },
];

const mobileNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
  { id: 'giveaways', label: 'Giveaways', icon: Gift, href: '/admin/raffles' },
  { id: 'users', label: 'Users', icon: Users, href: '/admin/users' },
  { id: 'more', label: 'More', icon: Menu, href: '#' },
];

export default function AdminLayoutClient({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifUnread, setNotifUnread] = useState(0);
  const notifRef = useRef(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);
  const [activeRaffles, setActiveRaffles] = useState([]);
  const [sidebarRaffleImage, setSidebarRaffleImage] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const getReadState = () => {
    try { const stored = localStorage.getItem('admin_notifications_read'); return stored ? JSON.parse(stored) : {}; } catch { return {}; }
  };
  const saveReadState = (readMap) => {
    try { localStorage.setItem('admin_notifications_read', JSON.stringify(readMap)); } catch { }
  };

  useEffect(() => { if (!loading && !user?.isAdmin) router.push('/fr/login'); }, [loading, user, router]);

  useEffect(() => {
    // Check saved locale preference and redirect if needed
    if (typeof window === 'undefined') return;
    const savedLocale = localStorage.getItem('user-locale');
    if (savedLocale && routing.locales.includes(savedLocale)) {
      // Admin pages are at /admin/*, but user came from /fr/admin or /en/admin
      // We need to check the referrer or just ensure consistency
      const currentPath = pathname;
      const localeMatch = currentPath.match(/^\/(fr|en)\/admin/);
      if (localeMatch && localeMatch[1] !== savedLocale) {
        const newPath = currentPath.replace(/^\/(fr|en)(\/admin)/, `/${savedLocale}$2`);
        if (newPath !== currentPath) {
          window.location.href = newPath;
        }
      }
    }
  }, [pathname]);

  useEffect(() => {
    if (!user?.isAdmin) return;
    const fetchData = async () => {
      try {
        const [ordersRes, rafflesRes, notifRes, settingsRes] = await Promise.all([
          api.get('/api/orders').catch(() => ({ data: [] })),
          api.get('/api/raffles?status=active').catch(() => ({ data: [] })),
          api.get('/api/notifications/all?limit=10').catch(() => ({ data: [] })),
          api.get('/api/content/settings').catch(() => ({ data: {} })),
        ]);
        const orders = Array.isArray(ordersRes.data) ? ordersRes.data.slice(0, 5) : [];
        const raffles = Array.isArray(rafflesRes.data) ? rafflesRes.data : [];
        setActiveRaffles(raffles);
        // Set sidebar raffle image
        const firstRaffle = raffles[0];
        const img = firstRaffle?.prizes?.[0]?.image || firstRaffle?.product?.images?.[0] || '';
        setSidebarRaffleImage(img);
        const notifs = [];
        const readState = getReadState();
        orders.forEach((order) => {
          if (order.status === 'awaiting_payment') {
            const id = `order-${order._id}`;
            notifs.push({ id, type: 'order', title: 'New Order', message: `Order ${order.orderNumber} awaiting payment`, time: new Date(order.createdAt).toLocaleDateString(), read: !!readState[id], link: '/admin/orders' });
          }
        });
        raffles.forEach((raffle) => {
          if (raffle.canDraw) {
            const id = `raffle-${raffle._id}`;
            notifs.push({ id, type: 'raffle', title: 'Ready to Draw', message: `${raffle.name} is eligible`, time: 'Now', read: !!readState[id], link: '/admin/draw' });
          }
        });
        // Add real notifications from API
        const apiNotifs = Array.isArray(notifRes.data) ? notifRes.data : [];
        apiNotifs.forEach((n) => {
          notifs.push({
            id: n._id,
            type: n.type,
            title: n.title,
            message: n.message,
            time: new Date(n.createdAt).toLocaleDateString(),
            read: n.read,
            link: n.link || '/admin/dashboard',
          });
        });
        setNotifications(notifs.slice(0, 6));
        setNotifUnread(notifs.filter(n => !n.read).length);
        setMaintenanceMode(settingsRes.data?.maintenanceMode === true);
      } catch (error) { console.error('Admin layout error:', error); }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false);
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) setUserDropdownOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setSearchFocused(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      if (q.includes('order')) router.push('/admin/orders');
      else if (q.includes('product') || q.includes('cap')) router.push('/admin/products');
      else if (q.includes('user')) router.push('/admin/users');
      else if (q.includes('raffle') || q.includes('giveaway')) router.push('/admin/raffles');
      else if (q.includes('ticket') || q.includes('entry')) router.push('/admin/tickets');
      else if (q.includes('winner')) router.push('/admin/winners');
      else if (q.includes('payment') || q.includes('payout')) router.push('/admin/payments');
      else if (q.includes('report') || q.includes('analytic')) router.push('/admin/analytics');
      else if (q.includes('content') || q.includes('page')) router.push('/admin/content');
      else if (q.includes('contact') || q.includes('support')) router.push('/admin/contacts');
      else if (q.includes('setting')) router.push('/admin/settings');
      else if (q.includes('log') || q.includes('history') || q.includes('activity')) router.push('/admin/draw-history');
      else router.push('/admin/dashboard');
      setSearchQuery('');
      setSearchFocused(false);
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setNotifUnread(prev => Math.max(0, prev - 1));
    const readState = getReadState();
    readState[id] = true;
    saveReadState(readState);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setNotifUnread(0);
    const readState = getReadState();
    notifications.forEach(n => { readState[n.id] = true; });
    saveReadState(readState);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!user?.isAdmin) return null;

  const activeTab = allMenuItems.find(item => pathname.includes(item.href))?.id || 'dashboard';
  const activeRaffle = activeRaffles[0];
  const today = new Date();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const dateRangeText = `${thirtyDaysAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  const adminLabel = user?.isAdmin ? 'Admin' : 'User';

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0f0f0f] text-white fixed inset-y-0 left-0 z-50">
        <div className="p-5 flex-1 overflow-y-auto">
          <div className="flex items-center justify-center mb-8">
            <BrandLogo size="sm" />
          </div>
          <nav className="space-y-0.5">
            {allMenuItems.map((item) => (
              <Link key={item.id} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === item.id ? 'bg-[#b88238] text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}>
                <item.icon className="w-4 h-4 shrink-0" />{item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="bg-neutral-800 rounded-xl p-3.5">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2.5 overflow-hidden">
              {sidebarRaffleImage ? (
                <img src={sidebarRaffleImage} alt="Raffle" className="w-full h-full object-cover" />
              ) : (
                <Crown className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <p className="text-sm font-semibold text-white mb-0.5">Raffle is Live!</p>
            <p className="text-xs text-neutral-400 mb-3">{activeRaffle ? activeRaffle.name : 'No active raffle'}</p>
            <Link href="/admin/raffles" className="block w-full bg-[#b88238] hover:bg-[#a07030] text-white text-xs font-medium py-2 rounded-lg transition-colors text-center">View Giveaway</Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-neutral-700 flex items-center justify-center shrink-0">
              {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : <span className="text-sm font-medium text-white">{user.firstName?.[0]}{user.lastName?.[0]}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.firstName || 'Admin'} {user.lastName || 'User'}</p>
              <p className="text-xs text-neutral-400 truncate">{adminLabel}</p>
            </div>
            <button onClick={() => { logout(); router.push('/fr/login'); }} className="p-1.5 text-neutral-400 hover:text-red-400 transition-colors" title="Logout"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Mobile Sidebar */}
      <motion.aside initial={{ x: -280 }} animate={{ x: sidebarOpen ? 0 : -280 }} transition={{ type: 'spring', damping: 25 }} className="fixed inset-y-0 left-0 z-50 w-64 bg-[#0f0f0f] text-white lg:hidden">
        <div className="p-5 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <BrandLogo size="sm" />
            <button onClick={() => setSidebarOpen(false)} className="p-1 text-neutral-400"><X className="w-5 h-5" /></button>
          </div>
          <nav className="space-y-0.5 flex-1 overflow-y-auto">
            {allMenuItems.map((item) => (
              <Link key={item.id} href={item.href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === item.id ? 'bg-[#b88238] text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}>
                <item.icon className="w-4 h-4 shrink-0" />{item.label}
              </Link>
            ))}
          </nav>
          <div className="pt-3 border-t border-white/10">
            <div className="bg-neutral-800 rounded-xl p-3 mb-3">
              <p className="text-xs font-semibold text-white mb-0.5">Raffle is Live!</p>
              <p className="text-xs text-neutral-400 mb-2">{activeRaffle ? activeRaffle.name : 'No active raffle'}</p>
              <Link href="/admin/raffles" onClick={() => setSidebarOpen(false)} className="block w-full bg-[#b88238] text-white text-xs font-medium py-1.5 rounded-lg text-center">View Giveaway</Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-neutral-700 flex items-center justify-center shrink-0">
                {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : <span className="text-sm font-medium">{user.firstName?.[0]}{user.lastName?.[0]}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.firstName || 'Admin'} {user.lastName || 'User'}</p>
                <p className="text-xs text-neutral-400 truncate">{adminLabel}</p>
              </div>
              <button onClick={() => { logout(); router.push('/fr/login'); }} className="p-1.5 text-neutral-400 hover:text-red-400 transition-colors"><LogOut className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 min-w-0 pb-20 lg:pb-0">
        {/* Mobile Header - matches screenshot: black bg, hamburger, CAPRAFFLE logo, notification bell */}
        <div className="lg:hidden sticky top-0 z-30 bg-[#0f1419] px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="text-white p-1">
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/admin/dashboard" className="flex items-center gap-1.5">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex items-center gap-2">
            {maintenanceMode && (
              <div className="flex items-center gap-1 bg-amber-500/20 text-amber-400 rounded px-2 py-1 text-[10px] font-medium">
                <Construction className="w-3 h-3" />
                <span>MAINT</span>
              </div>
            )}
            <div className="relative" ref={notifRef}>
              <button onClick={() => setNotifOpen(!notifOpen)} className="relative text-white p-1">
                <Bell className="w-6 h-6" />
                {notifUnread > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{notifUnread}</span>}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-neutral-200 shadow-lg z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                    <h3 className="font-semibold text-sm text-neutral-900">Notifications</h3>
                    {notifUnread > 0 && <button onClick={markAllRead} className="text-xs text-amber-600 hover:text-amber-700 font-medium">Mark all read</button>}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-neutral-400"><Bell className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">No notifications</p></div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} onClick={() => { markAsRead(notif.id); router.push(notif.link); setNotifOpen(false); }} className={`px-4 py-3 border-b border-neutral-50 hover:bg-neutral-50 cursor-pointer transition-colors ${!notif.read ? 'bg-amber-50/50' : ''}`}>
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
                    <Link href="/admin/notifications" onClick={() => setNotifOpen(false)} className="text-xs text-amber-600 hover:text-amber-700 font-medium text-center block">View all notifications</Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Top Header */}
        <header className="hidden lg:flex bg-white border-b border-neutral-200 px-4 sm:px-6 py-3 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-neutral-900 capitalize">{allMenuItems.find(i => i.id === activeTab)?.label || 'Dashboard'}</h1>
          </div>

          {maintenanceMode && (
            <div className="hidden md:flex items-center gap-2 bg-amber-100 text-amber-800 rounded-lg px-3 py-2 text-xs font-medium">
              <Construction className="w-3.5 h-3.5" />
              Maintenance Mode Active
            </div>
          )}

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search */}
            <div ref={searchRef} className={`hidden sm:flex items-center rounded-lg px-3 py-2 w-64 transition-all ${searchFocused ? 'bg-white border border-amber-300 ring-2 ring-amber-100' : 'bg-neutral-100'}`}>
              <Search className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
              <input type="text" placeholder="Search anything..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => setSearchFocused(true)} onKeyDown={handleSearch} className="bg-transparent text-sm text-neutral-700 placeholder-neutral-400 outline-none w-full" />
              {searchQuery && <button onClick={() => { setSearchQuery(''); setSearchFocused(false); }} className="ml-1 text-neutral-400 hover:text-neutral-600"><X className="w-3.5 h-3.5" /></button>}
            </div>

            {/* Date Range */}
            <div className="hidden md:flex items-center gap-2 bg-neutral-100 rounded-lg px-3 py-2">
              <Calendar className="w-4 h-4 text-neutral-500" />
              <span className="text-sm text-neutral-600">{dateRangeText}</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 hover:bg-neutral-100 rounded-lg text-neutral-600 transition-colors">
                <Bell className="w-5 h-5" />
                {notifUnread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-neutral-200 shadow-lg z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                    <h3 className="font-semibold text-sm text-neutral-900">Notifications</h3>
                    {notifUnread > 0 && <button onClick={markAllRead} className="text-xs text-amber-600 hover:text-amber-700 font-medium">Mark all read</button>}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-neutral-400"><Bell className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">No notifications</p></div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} onClick={() => { markAsRead(notif.id); router.push(notif.link); setNotifOpen(false); }} className={`px-4 py-3 border-b border-neutral-50 hover:bg-neutral-50 cursor-pointer transition-colors ${!notif.read ? 'bg-amber-50/50' : ''}`}>
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
                    <Link href="/admin/notifications" onClick={() => setNotifOpen(false)} className="text-xs text-amber-600 hover:text-amber-700 font-medium text-center block">View all notifications</Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button onClick={() => setUserDropdownOpen(!userDropdownOpen)} className="hidden sm:flex items-center gap-2 hover:bg-neutral-100 rounded-lg px-2 py-1.5 transition-colors">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-200 flex items-center justify-center">
                  {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-medium text-neutral-600">{user.firstName?.[0]}{user.lastName?.[0]}</span>}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-neutral-900 leading-tight">{user.firstName || 'Admin'} {user.lastName || 'User'}</p>
                  <p className="text-xs text-neutral-500 leading-tight">{adminLabel}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-neutral-200 shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-neutral-100">
                    <p className="text-sm font-semibold text-neutral-900">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-neutral-500">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link href="/admin/settings" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"><Settings className="w-4 h-4" />Settings</Link>
                    <button onClick={() => { setUserDropdownOpen(false); logout(); router.push('/fr/login'); }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"><LogOut className="w-4 h-4" />Logout</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6">{children}</main>

        {/* Mobile Bottom Nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 px-1 py-1">
          <div className="flex items-center justify-around max-w-md mx-auto">
            {mobileNavItems.map((item) => (
              item.id === 'more' ? (
                <button key={item.id} onClick={() => setMoreMenuOpen(!moreMenuOpen)} className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors text-neutral-400 hover:text-neutral-600">
                  <item.icon className="w-5 h-5" strokeWidth={2} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              ) : (
                <Link key={item.id} href={item.href} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${activeTab === item.id ? 'text-[#b88238]' : 'text-neutral-400 hover:text-neutral-600'}`}>
                  <item.icon className="w-5 h-5" strokeWidth={activeTab === item.id ? 2.5 : 2} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              )
            ))}
          </div>
        </div>

        {/* Mobile More Menu */}
        {moreMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMoreMenuOpen(false)} />
            <div className="absolute bottom-16 left-2 right-2 bg-white rounded-xl shadow-lg border border-neutral-200 p-3">
              <div className="grid grid-cols-4 gap-2">
                {allMenuItems.filter(i => !mobileNavItems.find(m => m.id === i.id)).map((item) => (
                  <Link key={item.id} href={item.href} onClick={() => setMoreMenuOpen(false)} className={`flex flex-col items-center gap-1 p-2 rounded-lg ${activeTab === item.id ? 'bg-[#b88238]/10 text-[#b88238]' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                    <item.icon className="w-5 h-5" />
                    <span className="text-[10px]">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
