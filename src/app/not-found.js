import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold text-neutral-900">404</h1>
        <p className="mt-3 text-neutral-600">Page introuvable.</p>
        <Link href="/fr" className="inline-block mt-6 px-5 py-3 rounded-xl bg-neutral-900 text-white text-sm font-medium">
          Retour a l'accueil
        </Link>
      </div>
    </div>
  );
}
