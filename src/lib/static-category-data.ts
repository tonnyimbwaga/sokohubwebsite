/**
 * Category Data Service - Blazing Fast Performance
 *
 * Strategy:
 * - Server-side data fetching for homepage
 * - Client-side optimized queries for individual categories
 * - Aggressive caching to minimize database calls
 * - Optimize for Cloudflare CDN caching
 */

import { getProductImageUrl } from "@/utils/product-images";
import type { Product } from "@/data/types";

interface DatabaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  status: string;
  is_featured: boolean;
  sku: string;
  slug: string;
  category_id: string;
  images: Array<{
    web_image_url?: string;
    feed_image_url?: string;
    url?: string;
    alt?: string;
  }>;
}

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
}

// Transform database product to UI product
export const transformProduct = (
  product: DatabaseProduct,
  category: CategoryData,
): Product => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: product.price,
  salePrice: undefined,
  images:
    Array.isArray(product.images) && product.images.length > 0
      ? [{ url: getProductImageUrl(product.images[0]) }]
      : [{ url: "/images/placeholder.png" }],
  sku: product.sku,
  slug: product.slug || product.sku.toLowerCase(),
  category: category.name,
  categorySlug: category.slug,
  ageRange: "",
  inStock: product.stock > 0,
  isFeatured: product.is_featured || false,
  rating: 5,
  reviews: 0,
  sizes: [
    { value: "0-2", label: "0-2 years", price: product.price, inStock: true },
    { value: "2-4", label: "2-4 years", price: product.price, inStock: true },
    { value: "4-6", label: "4-6 years", price: product.price, inStock: true },
    { value: "6+", label: "6+ years", price: product.price, inStock: true },
  ],
});

// Client-side function to fetch category products
export const fetchCategoryProducts = async (
  categorySlug: string,
): Promise<Product[]> => {
  try {
    // Import supabase only when needed (client-side)
    const { supabase } = await import("@/lib/supabase/client");

    // First get category data
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id, name, slug, image_url")
      .eq("slug", categorySlug)
      .eq("is_active", true)
      .single();

    if (categoryError || !category) {
      console.warn(`Category ${categorySlug} not found:`, categoryError);
      return [];
    }

    // Get products directly using category_id field (primary relationship)
    const { data: directProducts, error: directError } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        description,
        price,
        stock,
        status,
        is_featured,
        sku,
        slug,
        category_id,
        images
      `,
      )
      .eq("category_id", category.id)
      .eq("status", "active")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(12); // Get more products for category pages

    // Also get products from junction table (additional categories)
    const { data: productIds, error: productIdsError } = await supabase
      .from("product_categories")
      .select("product_id")
      .eq("category_id", category.id);

    let junctionProducts: any[] = [];
    if (!productIdsError && productIds && productIds.length > 0) {
      const { data: junctionData, error: junctionError } = await supabase
        .from("products")
        .select(
          `
          id,
          name,
          description,
          price,
          stock,
          status,
          is_featured,
          sku,
          slug,
          category_id,
          images
        `,
        )
        .in(
          "id",
          productIds.map((p: { product_id: string }) => p.product_id),
        )
        .eq("status", "active")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(12);

      if (!junctionError && junctionData) {
        junctionProducts = junctionData;
      }
    }

    // Combine and deduplicate products
    const allProducts = [...(directProducts || []), ...junctionProducts];
    const uniqueProducts = allProducts
      .filter(
        (product, index, self) =>
          index === self.findIndex((p) => p.id === product.id),
      )
      .slice(0, 12); // Limit to 12 products for category pages

    if (uniqueProducts.length === 0) {
      return [];
    }

    return uniqueProducts.map((product) =>
      transformProduct(product as DatabaseProduct, category),
    );
  } catch (error) {
    console.warn(
      `Error fetching category products for ${categorySlug}:`,
      error,
    );
    return [];
  }
};

// Pre-generate anchor IDs for smooth scrolling
export const generateCategoryAnchor = (slug: string): string =>
  `category-${slug}`;

// Static data for common categories - these rarely change so we can cache aggressively
export const STATIC_CATEGORY_SLUGS = [
  "action-figures",
  "board-games",
  "building-blocks",
  "dolls",
  "educational-toys",
  "outdoor-toys",
  "puzzles",
  "remote-control",
  "sports-games",
  "stuffed-animals",
] as const;
