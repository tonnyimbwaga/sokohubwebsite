// Utility to generate a product URL, optionally using SKU and slug
export function getProductUrl(product: { slug: string; sku?: string }): string {
  // Use slug only for product URLs
  return `/products/${encodeURIComponent(product.slug)}`;
}
