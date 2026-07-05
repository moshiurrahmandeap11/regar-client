'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

const defaultSettings = {
  contactEmail: 'contact@regar.ch',
  contactPhone: '+41 79 123 45 67',
  contactLocation: 'Lausanne, Suisse',
  socialLinks: {},
};

export default function useSiteSettings() {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    let active = true;

    api.get('/api/content/settings')
      .then((res) => {
        if (!active) return;
        setSettings({
          ...defaultSettings,
          ...(res.data || {}),
          socialLinks: {
            ...defaultSettings.socialLinks,
            ...(res.data?.socialLinks || {}),
          },
        });
      })
      .catch(() => {
        if (active) setSettings(defaultSettings);
      });

    return () => {
      active = false;
    };
  }, []);

  return settings;
}
