'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';

export default function QuantitySelector({ value, onChange, min = 1, max = 10 }) {
  return (
    <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="p-2 hover:bg-neutral-100 transition-colors disabled:opacity-30"
        disabled={value <= min}
      >
        <Minus className="w-4 h-4" />
      </motion.button>
      <span className="w-10 text-center font-medium text-sm">{value}</span>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="p-2 hover:bg-neutral-100 transition-colors disabled:opacity-30"
        disabled={value >= max}
      >
        <Plus className="w-4 h-4" />
      </motion.button>
    </div>
  );
}
