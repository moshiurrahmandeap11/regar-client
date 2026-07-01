'use client';

import Link from 'next/link';

export default function StaticInfoPage({ title, description, primaryLabel, primaryHref, secondaryLabel, secondaryHref }) {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 sm:p-10 text-center">
          <h1 className="text-3xl font-bold text-neutral-900">{title}</h1>
          <p className="text-neutral-600 mt-4">{description}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {primaryHref && primaryLabel ? (
              <Link href={primaryHref} className="px-5 py-3 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors">
                {primaryLabel}
              </Link>
            ) : null}
            {secondaryHref && secondaryLabel ? (
              <Link href={secondaryHref} className="px-5 py-3 rounded-xl border border-neutral-200 text-sm font-medium hover:bg-neutral-50 transition-colors">
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
