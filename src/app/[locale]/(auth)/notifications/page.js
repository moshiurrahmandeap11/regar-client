'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Link } from '@/i18n/routing';
import { Bell, ArrowLeft, Trash2, BellRing, Package, Gift, Trophy, AlertCircle, Megaphone } from 'lucide-react';
import { PageLoader } from '@/components/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const typeIcons = {
  order: Package,
  raffle: Gift,
  ticket: Gift,
  winner: Trophy,
  system: AlertCircle,
  admin: Megaphone,
};

export default function NotificationsPage() {
  const locale = useLocale();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification, fetchNotifications } = useNotifications();
  const [filter, setFilter] = useState('all'); // all | unread

  useEffect(() => { if (!authLoading && !user) router.push(`/${locale}/login`); }, [user, authLoading, router, locale]);

  const isFr = locale === 'fr';
  const t = (en, fr) => (isFr ? fr : en);

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return t('Just now', 'À l\'instant');
    if (diff < 3600) return `${Math.floor(diff / 60)}m ${t('ago', 'ago')}`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ${t('ago', 'ago')}`;
    return d.toLocaleDateString(isFr ? 'fr-CH' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (authLoading) return <PageLoader color="primary" />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 lg:pb-0">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-neutral-200 transition-colors lg:hidden">
              <ArrowLeft className="w-5 h-5 text-neutral-700" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">{t('Notifications', 'Notifications')}</h1>
              <p className="text-sm text-neutral-500">
                {unreadCount > 0
                  ? t(`${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`, `${unreadCount} notification non lue${unreadCount > 1 ? 's' : ''}`)
                  : t('All caught up!', 'Tout est à jour !')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === 'unread' ? 'bg-[#b88238] text-white' : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {filter === 'unread' ? t('Show All', 'Tout afficher') : t('Unread Only', 'Non lues')}
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                {t('Mark all read', 'Tout marquer comme lu')}
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <PageLoader color="primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-10 text-center">
            <BellRing className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-700 mb-1">
              {filter === 'unread' ? t('No unread notifications', 'Aucune notification non lue') : t('No notifications yet', 'Aucune notification')}
            </h3>
            <p className="text-sm text-neutral-400">
              {filter === 'unread'
                ? t('You have read all your notifications.', 'Vous avez lu toutes vos notifications.')
                : t('When something happens, you will see it here.', 'Quand quelque chose se passe, vous le verrez ici.')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((notif) => {
                const Icon = typeIcons[notif.type] || Bell;
                return (
                  <motion.div
                    key={notif._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={`bg-white rounded-xl border p-4 transition-colors ${
                      notif.read ? 'border-neutral-200' : 'border-amber-200 bg-amber-50/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        notif.read ? 'bg-neutral-100 text-neutral-400' : 'bg-amber-100 text-amber-600'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-neutral-900">{notif.title}</p>
                          <span className="text-xs text-neutral-400 shrink-0">{formatTime(notif.createdAt)}</span>
                        </div>
                        <p className="text-sm text-neutral-600 mt-0.5">{notif.message}</p>
                        <div className="flex items-center gap-3 mt-2">
                          {!notif.read && (
                            <button
                              onClick={() => markAsRead(notif._id)}
                              className="text-xs text-[#b88238] hover:text-[#a07030] font-medium"
                            >
                              {t('Mark as read', 'Marquer comme lu')}
                            </button>
                          )}
                          {notif.link && (
                            <Link href={notif.link} className="text-xs text-neutral-500 hover:text-neutral-700 font-medium">
                              {t('View details', 'Voir les détails')}
                            </Link>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteNotification(notif._id)}
                        className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        title={t('Delete', 'Supprimer')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
