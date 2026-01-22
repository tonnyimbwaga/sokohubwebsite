import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import { notFound } from "next/navigation";
import type { Product } from "@/data/types";

type DatabaseProduct = Database["public"]["Tables"]["products"]["Row"];

function transformProduct(product: DatabaseProduct): Product {
  return {
    id: product.id,
    name: product.name,
    description: product.description || "",
    price: product.price || 0,
    sku: product.sku || "",
    slug: product.slug || "",
    category: "", // Will be filled by parent category
    categorySlug: "", // Will be filled by parent category
    images: Array.isArray(product.images)
      ? product.images.map((img) => {
          if (typeof img === "string") {
            return { url: img };
          } else if (img && typeof img === "object") {
            // Preserve object with its existing properties (e.g., web_image_url)
            return img;
          } else {
            // Fallback to empty URL
            return { url: "" };
          }
        })
      : [],
    ageRange: "",
    inStock: true, // Default to true if not specified
    isFeatured: product.is_featured || false,
    rating: 0, // Default rating
    reviews: 0, // Default reviews count
  };
}

// Using a service role client for server-side data fetching.
// This is more reliable in serverless environments for non-user-specific data.
const getSupabaseService = () => {
  if (typeof window !== "undefined") {
    // This should not happen since this is a .server.ts file
    throw new Error("Supabase service client cannot be used on the client.");
  }
  // @ts-ignore – edge build has no type defs; cast afterwards
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  ) as any;
};

export const serverCategoryQueries = {
  async getAllCategories() {
    try {
      const supabase = getSupabaseService();

      const { data, error } = await supabase
        .from("categories")
        .select(
          `
          id,
          name,
          slug,
          description,
          image_url,
          products (
            id,
            name,
            slug,
            description,
            price,
            sku,
            images,
            is_featured
          )
        `,
        )
        .eq("is_active", true);

      if (error) {
        console.error(
          "Error fetching categories:",
          JSON.stringify(error, null, 2),
        );
        return null;
      }

      if (!data) return null;

      // Define preferred category order (same as getCategorySummaries)
      const preferredOrder = [
        "bicycles",
        "skates",
        "ride-in-cars",
        "trampolines",
        "pretend-play",
        "camping-gear",
        "bicycle",
        "skate",
        "ride-cars",
        "trampoline",
        "pretend",
        "camping",
      ];

      // Sort categories with preferred order first, then alphabetically
      const sortedData = data.sort((a: any, b: any) => {
        const aIndex = preferredOrder.indexOf(a.slug);
        const bIndex = preferredOrder.indexOf(b.slug);

        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }

        if (aIndex !== -1 && bIndex === -1) {
          return -1;
        }

        if (aIndex === -1 && bIndex !== -1) {
          return 1;
        }

        return a.name.localeCompare(b.name);
      });

      return sortedData.map((category: any) => ({
        ...category,
        products: (category.products || []).map((product: any) => ({
          ...transformProduct(product as DatabaseProduct),
          category: category.name,
          categorySlug: category.slug,
        })),
      }));
    } catch (error) {
      console.error(
        "Unexpected error in getAllCategories:",
        error instanceof Error ? error.message : String(error),
      );
      return null;
    }
  },

  async getAllCategorySlugs() {
    try {
      const supabase = getSupabaseService();
      const { data, error } = await supabase
        .from("categories")
        .select("slug")
        .eq("is_active", true);

      if (error) {
        console.error(
          "Error fetching category slugs:",
          JSON.stringify(error, null, 2),
        );
        return []; // Return empty array on error
      }
      return data || []; // Return data or empty array if data is null
    } catch (error) {
      console.error(
        "Unexpected error in getAllCategorySlugs:",
        error instanceof Error ? error.message : String(error),
      );
      return []; // Return empty array on unexpected error
    }
  },

  async getCategoryBySlug(
    slug: string,
    page: number = 1,
    pageSize: number = 12,
  ) {
    try {
      const supabase = getSupabaseService();

      // 1. Fetch category details
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("id, name, slug, description, image_url")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (categoryError) {
        if (categoryError.code === "PGRST116") {
          console.warn(`Category with slug '${slug}' not found.`);
          notFound(); // Triggers 404 page
        }
        console.error(
          `Error fetching category by slug '${slug}':`,
          JSON.stringify(categoryError, null, 2),
        );
        return null;
      }

      if (!categoryData) {
        console.warn(`Category data for slug '${slug}' was unexpectedly null.`);
        notFound(); // Triggers 404 page
      }

      // Type guard for categoryData
      if (typeof categoryData.id === "undefined") {
        console.error(`Category ID is undefined for slug '${slug}'.`);
        return null;
      }

      // 2. Fetch product IDs that belong to this category in TWO ways:
      //    a) Direct relationship on the products table (category_id)
      //    b) Junction table (product_categories)

      // a) Direct products
      const { data: directProductsIdsData, error: directProductsError } =
        await supabase
          .from("products")
          .select("id")
          .eq("category_id", categoryData.id)
          .eq("status", "active");

      if (directProductsError) {
        console.error(
          `Error fetching direct product ids for category '${slug}':`,
          JSON.stringify(directProductsError, null, 2),
        );
      }

      const directProductIds = (directProductsIdsData || []).map(
        (p: { id: string }) => p.id,
      );

      // b) Junction table products
      const { data: junctionIdsData, error: junctionIdsError } = await supabase
        .from("product_categories")
        .select("product_id")
        .eq("category_id", categoryData.id);

      if (junctionIdsError) {
        console.error(
          `Error fetching junction product ids for category '${slug}':`,
          JSON.stringify(junctionIdsError, null, 2),
        );
      }

      const junctionProductIds = (junctionIdsData || []).map(
        (p: { product_id: string }) => p.product_id,
      );

      // Combine and deduplicate ids
      const combinedIdsSet = new Set<string>([
        ...directProductIds,
        ...junctionProductIds,
      ]);
      const allProductIds = Array.from(combinedIdsSet);

      // Calculate total product count
      const totalProductCount = allProductIds.length;

      if (totalProductCount === 0) {
        return {
          ...categoryData,
          products: [],
          totalProductCount: 0,
        };
      }

      // 3. Fetch paginated products for the category using the combined product IDs
      const offset = (page - 1) * pageSize;
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select(
          `
          id,
          name,
          slug,
          description,
          price,
          sku,
          images,
          is_featured
        `,
        )
        .in("id", allProductIds)
        .eq("status", "active")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (productsError) {
        console.error(
          `Error fetching products for category '${slug}':`,
          JSON.stringify(productsError, null, 2),
        );
        return null;
      }

      const transformedProducts = (productsData || []).map((product: any) => ({
        ...transformProduct(product as DatabaseProduct),
        category: categoryData.name,
        categorySlug: categoryData.slug,
      }));

      return {
        ...categoryData,
        products: transformedProducts,
        totalProductCount,
      };
    } catch (error) {
      console.error(
        `Unexpected error in getCategoryBySlug for slug '${slug}':`,
        error instanceof Error ? error.message : String(error),
      );
      return null;
    }
  },

  async getCategorySummaries(limit: number = 24) {
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

      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, image_url")
        .eq("is_active", true)
        .limit(limit);

      if (error) {
        console.error(
          "Error fetching category summaries:",
          JSON.stringify(error, null, 2),
        );
        return [];
      }

      if (!data) return [];

      // Sort categories with preferred order first, then alphabetically
      const sortedData = data.sort((a: any, b: any) => {
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

      return sortedData;
    } catch (error) {
      console.error(
        "Unexpected error in getCategorySummaries:",
        error instanceof Error ? error.message : String(error),
      );
      return [];
    }
  },
};
