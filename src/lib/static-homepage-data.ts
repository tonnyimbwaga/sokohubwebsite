/**
 * Static Homepage Data Generator
 *
 * This generates static JSON files at build time for blazing fast homepage loading.
 * Data is updated only during builds, not on every request.
 * Perfect for Cloudflare edge caching.
 */

import { createClient } from "@supabase/supabase-js";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

interface StaticProduct {
  id: string;
  name: string;
  price: number;
  slug: string;
  image: string;
  category: string;
  categorySlug: string;
  isFeatured: boolean;
  isDiscounted: boolean;
  discountPercentage?: number;
}

interface StaticCategory {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
  products: StaticProduct[];
}

interface StaticHomepageData {
  categories: StaticCategory[];
  featuredProducts: StaticProduct[];
  dealProducts: StaticProduct[];
  trendingProducts: StaticProduct[];
  lastUpdated: string;
  version: string;
}

const getSupabaseService = () => {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error(
      "Missing required Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
};

const getProductImageUrl = (images: any): string => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return "/images/placeholder-product.png";
  }

  const image = images[0];
  if (typeof image === "string") return image;
  if (image?.web_image_url) return `/api/images/${image.web_image_url}`;
  if (image?.url) return image.url;
  return "/images/placeholder-product.png";
};

const transformToStaticProduct = (
  product: any,
  category: any,
): StaticProduct => {
  const comparePrice = product.compare_at_price || 0;
  const currentPrice = product.price || 0;
  const isDiscounted = comparePrice > currentPrice;
  const discountPercentage = isDiscounted
    ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
    : undefined;

  return {
    id: product.id,
    name: product.name,
    price: currentPrice,
    slug: product.slug,
    image: getProductImageUrl(product.images),
    category: category.name,
    categorySlug: category.slug,
    isFeatured: product.is_featured || false,
    isDiscounted,
    discountPercentage,
  };
};

export async function generateStaticHomepageData(): Promise<StaticHomepageData> {
  const supabase = getSupabaseService();

  console.log("🚀 Generating static homepage data...");

  try {
    // Get all active categories
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("id, name, slug, image_url")
      .eq("is_active", true)
      .order("name");

    if (categoriesError) throw categoriesError;

    // Get category data with products in parallel
    const categoryPromises = categories.map(async (category) => {
      // Get product IDs for this category
      const { data: productIds } = await supabase
        .from("product_categories")
        .select("product_id")
        .eq("category_id", category.id);

      if (!productIds || productIds.length === 0) {
        return {
          id: category.id,
          name: category.name,
          slug: category.slug,
          image: category.image_url || "/images/placeholder.png",
          productCount: 0,
          products: [],
        };
      }

      // Get products for this category
      const { data: products } = await supabase
        .from("products")
        .select(
          `
          id, name, price, compare_at_price, slug, images, 
          is_featured, is_trending, is_deal, status
        `,
        )
        .in(
          "id",
          productIds.map((p: { product_id: string }) => p.product_id),
        )
        .eq("status", "active")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(8); // Get 8 products per category for homepage

      const staticProducts = (products || []).map((product) =>
        transformToStaticProduct(product, category),
      );

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        image: category.image_url || "/images/placeholder.png",
        productCount: productIds.length,
        products: staticProducts,
      };
    });

    const staticCategories = await Promise.all(categoryPromises);

    // Get featured products across all categories
    const { data: featuredProducts } = await supabase
      .from("products")
      .select(
        `
        id, name, price, compare_at_price, slug, images, 
        is_featured, product_categories(categories(name, slug))
      `,
      )
      .eq("status", "active")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(12);

    // Get deal products
    const { data: dealProducts } = await supabase
      .from("products")
      .select(
        `
        id, name, price, compare_at_price, slug, images,
        is_deal, product_categories(categories(name, slug))
      `,
      )
      .eq("status", "active")
      .eq("is_deal", true)
      .not("compare_at_price", "is", null)
      .gt("compare_at_price", 0)
      .order("created_at", { ascending: false })
      .limit(12);

    // Get trending products
    const { data: trendingProducts } = await supabase
      .from("products")
      .select(
        `
        id, name, price, compare_at_price, slug, images,
        is_trending, product_categories(categories(name, slug))
      `,
      )
      .eq("status", "active")
      .eq("is_trending", true)
      .order("created_at", { ascending: false })
      .limit(12);

    // Transform special product collections
    const transformSpecialProducts = (products: any[]) => {
      return products.map((product) => {
        const category = product.product_categories?.[0]?.categories || {
          name: "Other",
          slug: "other",
        };
        return transformToStaticProduct(product, category);
      });
    };

    const staticData: StaticHomepageData = {
      categories: staticCategories.filter((cat) => cat.products.length > 0), // Only include categories with products
      featuredProducts: transformSpecialProducts(featuredProducts || []),
      dealProducts: transformSpecialProducts(dealProducts || []).sort(
        (a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0),
      ), // Sort by highest discount
      trendingProducts: transformSpecialProducts(trendingProducts || []),
      lastUpdated: new Date().toISOString(),
      version: "2.0",
    };

    console.log(
      `✅ Generated static data for ${staticData.categories.length} categories`,
    );
    console.log(`✅ Featured: ${staticData.featuredProducts.length} products`);
    console.log(`✅ Deals: ${staticData.dealProducts.length} products`);
    console.log(`✅ Trending: ${staticData.trendingProducts.length} products`);

    return staticData;
  } catch (error) {
    console.error("❌ Error generating static homepage data:", error);
    throw error;
  }
}

export async function writeStaticHomepageData(): Promise<void> {
  try {
    const data = await generateStaticHomepageData();

    // Check if we can write to filesystem (not available in serverless environments)
    if (typeof process === "undefined" || !process.cwd) {
      console.log(
        "⚠️ Filesystem operations not available in this environment, skipping file write",
      );
      return;
    }

    try {
      // Ensure public/data directory exists
      const dataDir = join(process.cwd(), "public", "data");
      mkdirSync(dataDir, { recursive: true });

      // Write the static data file
      const filePath = join(dataDir, "homepage.json");
      writeFileSync(filePath, JSON.stringify(data, null, 2));

      console.log(`✅ Static homepage data written to: ${filePath}`);

      // Also write individual category files for faster category page loading
      for (const category of data.categories) {
        const categoryPath = join(dataDir, `category-${category.slug}.json`);
        writeFileSync(categoryPath, JSON.stringify(category, null, 2));
      }

      console.log(
        `✅ Generated ${data.categories.length} individual category files`,
      );
    } catch (fsError) {
      console.warn(
        "⚠️ Filesystem operations failed (likely in serverless environment):",
        fsError,
      );
      // Don't throw error, just log warning
    }
  } catch (error) {
    console.error("❌ Failed to write static homepage data:", error);
    throw error;
  }
}

// Export types for use in components
export type { StaticHomepageData, StaticCategory, StaticProduct };
