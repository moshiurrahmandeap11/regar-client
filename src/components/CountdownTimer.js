'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CountdownTimer({ targetDate, locale, variant }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };
    setTimeLeft(calculate());
    const interval = setInterval(() => setTimeLeft(calculate()), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const units = [
    { value: timeLeft.days, label: locale === 'fr' ? 'Jours' : 'Days' },
    { value: timeLeft.hours, label: locale === 'fr' ? 'Heures' : 'Hours' },
    { value: timeLeft.minutes, label: locale === 'fr' ? 'Min' : 'Min' },
    { value: timeLeft.seconds, label: locale === 'fr' ? 'Sec' : 'Sec' },
  ];

  if (variant === 'banner') {
    return (
      <div className="flex items-center gap-3 sm:gap-5">
        {units.map((unit, i) => (
          <div key={i} className="flex items-center gap-3 sm:gap-5">
            <div className="text-center min-w-10 sm:min-w-12">
              <p className="text-white text-3xl sm:text-4xl font-extrabold leading-none">{String(unit.value).padStart(2, '0')}</p>
              <p className="text-[10px] tracking-[0.18em] uppercase text-[#7eb6de] mt-2">{unit.label}</p>
            </div>
            {i < units.length - 1 ? <span className="text-[#7eb6de] text-2xl font-semibold">:</span> : null}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {units.map((unit, i) => (
        <motion.div
          key={i}
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-neutral-900 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg sm:text-xl">{String(unit.value).padStart(2, '0')}</span>
          </div>
          <span className="text-xs text-neutral-500 mt-1">{unit.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
