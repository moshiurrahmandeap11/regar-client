export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { id, locale } = resolvedParams;
  const isFr = locale === 'fr';

  try {
    const API =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:5101';

    const res = await fetch(`${API}/api/products/${id}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return {
        title: isFr ? 'Produit | Regar' : 'Product | Regar',
      };
    }

    const product = await res.json();
    const rawTitle = isFr
      ? product.metaTitle || product.name
      : product.metaTitleEn || product.nameEn || product.name;
    const title = `${rawTitle} | Regar`;

    const description = isFr
      ? product.metaDescription || product.description
      : product.metaDescriptionEn || product.descriptionEn || product.description;

    const keywords =
      Array.isArray(product.seoKeywords) && product.seoKeywords.length > 0
        ? product.seoKeywords
        : [
            'regar',
            'luxury cap',
            'casquette de luxe',
            'streetwear',
            'raffle',
            'giveaway',
            'tirage au sort',
          ];

    const image =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : '/images/regar-hero-banner.jpeg';

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        images: [
          {
            url: image,
            alt: product.name,
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
    };
  } catch {
    return {
      title: isFr ? 'Produit | Regar' : 'Product | Regar',
    };
  }
}

export default function ProductLayout({ children }) {
  return <>{children}</>;
}

