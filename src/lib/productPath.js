export const productSlug = (product) => {
  const source = product?.slug || product?.nameEn || product?.name || '';
  const slug = source
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || null;
};

export const productPath = (product) => {
  const slug = productSlug(product);
  return slug ? `/products/${slug}` : '/products';
};
