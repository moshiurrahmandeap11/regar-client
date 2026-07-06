'use client';

import { motion } from 'framer-motion';

/**
 * Standardized Loader component used across the entire app.
 * 
 * @param {Object} props
 * @param {string} props.size - 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 * @param {string} props.color - 'primary' (gold #e2bd87) | 'neutral' (dark) | 'white' | 'amber' (admin) (default: 'neutral')
 * @param {boolean} props.fullScreen - Whether to center in full viewport height (default: false)
 * @param {string} props.className - Additional classes
 */
export default function Loader({ size = 'md', color = 'neutral', fullScreen = false, className = '' }) {
  const sizeMap = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-10 h-10 border-[2.5px]',
    xl: 'w-12 h-12 border-[3px]',
  };

  const colorMap = {
    primary: 'border-[#e2bd87]',
    neutral: 'border-neutral-900',
    white: 'border-white',
    amber: 'border-amber-600',
  };

  const spinner = (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`${sizeMap[size] || sizeMap.md} ${colorMap[color] || colorMap.neutral} border-t-transparent rounded-full animate-spin ${className}`}
    />
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      {spinner}
    </div>
  );
}

/**
 * Page-level loader - full screen with primary color
 */
export function PageLoader({ color = 'primary' }) {
  return <Loader size="lg" color={color} fullScreen />;
}

/**
 * Inline loader - for use inside components/cards
 */
export function InlineLoader({ size = 'md', color = 'neutral' }) {
  return <Loader size={size} color={color} />;
}

/**
 * Skeleton loader for cards/lists
 */
export function SkeletonLoader({ count = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          className="h-16 bg-neutral-100 rounded-xl"
        />
      ))}
    </div>
  );
}
