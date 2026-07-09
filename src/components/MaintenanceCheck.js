'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Construction, Wrench, Clock } from 'lucide-react';
import api from '@/lib/api';

export default function MaintenanceCheck({ children }) {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [checking, setChecking] = useState(true);
  const pathname = usePathname();
  const locale = useLocale();
  const isFr = locale === 'fr';

  // Admin routes bypass maintenance check
  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.match(/^\/(fr|en)\/admin/);

  useEffect(() => {
    if (isAdminRoute) {
      setChecking(false);
      return;
    }

    const checkMaintenance = async () => {
      try {
        const res = await api.get('/api/content/settings');
        setMaintenanceMode(res.data?.maintenanceMode === true);
      } catch {
        // If API fails, assume not in maintenance mode
        setMaintenanceMode(false);
      } finally {
        setChecking(false);
      }
    };

    checkMaintenance();

    // Re-check every 30 seconds
    const interval = setInterval(checkMaintenance, 30000);
    return () => clearInterval(interval);
  }, [isAdminRoute]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (maintenanceMode && !isAdminRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1419] text-white px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Construction className="w-10 h-10 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4">
            {isFr ? 'Site en maintenance' : 'Website is under maintenance'}
          </h1>
          <p className="text-neutral-400 mb-8 leading-relaxed">
            {isFr
              ? 'Nous effectuons actuellement une maintenance planifiée pour améliorer votre expérience. Veuillez revenir bientôt.'
              : 'We are currently performing scheduled maintenance to improve your experience. Please check back soon.'}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
            <Wrench className="w-4 h-4" />
            <span>{isFr ? 'Notre équipe travaille dessus' : 'Our team is working on it'}</span>
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-neutral-600">
            <Clock className="w-3 h-3" />
            <span>{isFr ? 'Fin estimée : Bientôt' : 'Estimated completion: Soon'}</span>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
