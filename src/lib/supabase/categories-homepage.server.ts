/**
 * Server-side Category Data Service for Homepage
 *
 * This service runs only on the server and provides cached category data
 * for the homepage with aggressive performance optimizations.
 */

import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import {
  transformProduct,
  type CategoryData,
} from "@/lib/static-category-data";
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

// Server-side Supabase client with service role
const getSupabaseService = () => {
  if (typeof window !== "undefined") {
    throw new Error(
      "Server-side Supabase client cannot be used on the client.",
    );
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
};

// Cached function to get all categories with products
export const getHomepageCategoryData = unstable_cache(
  async (): Promise<
    Array<{ category: CategoryData; products: Product[]; totalCount: number }>
  > => {
    try {
      const supabase = getSupabaseService();

      // Define preferred category order
      const preferredOrder = [
        "bicycles",
        "skates",
        "ride-in-cars",
        "trampolines",
        "pretend-play",
        "camping-gear",
        // Alternative slug formats that might exist
        "bicycle",
        "skate",
        "ride-cars",
        "trampoline",
        "pretend",
        "camping",
      ];

      // Get all active categories
      const { data: allCategories, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name, slug, image_url")
        .eq("is_active", true);

      if (categoriesError || !allCategories) {
        console.warn("Failed to fetch categories:", categoriesError);
        return [];
      }

      // Sort categories with preferred order first, then alphabetically
      const categories = allCategories.sort((a, b) => {
        const aIndex = preferredOrder.indexOf(a.slug);
        const bIndex = preferredOrder.indexOf(b.slug);

        // If both are in preferred order, sort by preferred order
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }

        // If only a is in preferred order, a comes first
        if (aIndex !== -1 && bIndex === -1) {
          return -1;
        }

        // If only b is in preferred order, b comes first
        if (aIndex === -1 && bIndex !== -1) {
          return 1;
        }

        // If neither is in preferred order, sort alphabetically
        return a.name.localeCompare(b.name);
      });

      // Get products for each category in parallel
      const categoryPromises = categories.map(
        async (category: CategoryData) => {
          try {
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
              .limit(7); // Limit to 7 products for homepage display

            console.log(
              `Category ${category.slug}: Found ${
                directProducts?.length || 0
              } direct products`,
            );

            // Also get products from junction table (additional categories)
            const { data: productIds, error: productIdsError } = await supabase
              .from("product_categories")
              .select("product_id")
              .eq("category_id", category.id);

            console.log(
              `Category ${category.slug}: Found ${
                productIds?.length || 0
              } junction table product IDs`,
            );

            let junctionProducts: any[] = [];
            if (!productIdsError && productIds && productIds.length > 0) {
              const { data: junctionData, error: junctionError } =
                await supabase
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
                  .limit(7);

              if (!junctionError && junctionData) {
                junctionProducts = junctionData;
              }
            }

            // Combine and deduplicate products
            const allProducts = [
              ...(directProducts || []),
              ...junctionProducts,
            ];
            const uniqueProducts = allProducts
              .filter(
                (product, index, self) =>
                  index === self.findIndex((p) => p.id === product.id),
              )
              .slice(0, 7); // Limit to 7 products total

            console.log(
              `Category ${category.slug}: Total unique products: ${uniqueProducts.length}`,
            );

            // Get total count for this category (both direct and junction table)
            const { count: directCount } = await supabase
              .from("products")
              .select("id", { count: "exact", head: true })
              .eq("category_id", category.id)
              .eq("status", "active");

            const { count: junctionCount } = await supabase
              .from("product_categories")
              .select("product_id", { count: "exact", head: true })
              .eq("category_id", category.id);

            const totalCount = (directCount || 0) + (junctionCount || 0);

            if (uniqueProducts.length === 0) {
              return { category, products: [], totalCount };
            }

            const products = uniqueProducts.map((product) =>
              transformProduct(product as DatabaseProduct, category),
            );

            return { category, products, totalCount };
          } catch (error) {
            console.warn(
              `Error fetching products for category ${category.slug}:`,
              error,
            );
            return { category, products: [], totalCount: 0 };
          }
        },
      );

      const results = await Promise.all(categoryPromises);

      // Return all categories, including those without products
      // This ensures carousel links work even for new/empty categories
      return results;
    } catch (error) {
      console.warn("Error fetching homepage category data:", error);
      return [];
    }
  },
  ["homepage-categories-v2"], // Updated cache key to force refresh after junction table changes
  {
    revalidate: 3600, // 1 hour - less aggressive caching for better updates
    tags: ["homepage-categories", "products", "categories"],
  },
);
