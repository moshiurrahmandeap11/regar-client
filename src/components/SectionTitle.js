'use client';

import { motion } from 'framer-motion';

export default function SectionTitle({
  title,
  subtitle,
  centered = true,
  titleClassName = 'text-neutral-900',
  subtitleClassName = 'text-neutral-500',
}) {
  return (
    <div className={`mb-10 ${centered ? 'text-center' : ''}`}>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`text-2xl sm:text-3xl font-bold ${titleClassName}`}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className={`mt-2 max-w-xl mx-auto ${subtitleClassName}`}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
