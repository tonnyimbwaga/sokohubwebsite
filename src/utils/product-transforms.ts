export interface TransformedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  status: string;
  is_featured: boolean;
  is_trending: boolean;
  is_deal: boolean;
  sku: string;
  slug: string;
  category_id?: string;
  images?: string[];
  is_published: boolean;
  created_at: string;
  category?: { name: string; slug: string }; // Legacy single category support
  categories?: Array<{ id: string; name: string; slug: string }>; // Multiple categories
  tags?: string[];
}

export function transformProductData(product: any): TransformedProduct {
  // Extract legacy category from the array if it exists
  const category =
    Array.isArray(product.category) && product.category.length > 0
      ? product.category[0]
      : product.category;

  // Extract categories from product_categories relationship
  const categories = product.categories
    ? product.categories
        .map((pc: any) => pc.category)
        .filter((c: any) => c !== null)
        .map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
        }))
    : [];

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    status: product.status,
    is_featured: product.is_featured,
    is_trending: product.is_trending,
    is_deal: product.is_deal,
    sku: product.sku,
    slug: product.slug,
    category_id: product.category_id,
    images: product.images,
    is_published: product.is_published,
    created_at: product.created_at,
    category, // Keep for backward compatibility
    categories: categories.length > 0 ? categories : undefined,
    tags: Array.isArray(product.tags) ? product.tags : [],
  };
}
