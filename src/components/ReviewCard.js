'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export default function ReviewCard({ review, locale }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="bg-white rounded-2xl border border-neutral-200 p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
          <span className="font-medium text-sm">{review.name?.charAt(0) || 'U'}</span>
        </div>
        <div>
          <p className="font-medium text-sm">{review.name}</p>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'}`}
              />
            ))}
          </div>
        </div>
      </div>
      <p className="text-sm text-neutral-600 leading-relaxed">
        {locale === 'fr' ? review.comment : review.commentEn || review.comment}
      </p>
      <p className="text-xs text-neutral-400 mt-3">
        {new Date(review.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-CH' : 'en-US')}
      </p>
    </motion.div>
  );
}
