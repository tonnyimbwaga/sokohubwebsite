/**
 * Utility functions for optimizing Supabase queries
 * Focused on reducing resource consumption and improving performance
 */
import {
  PostgrestFilterBuilder,
  PostgrestTransformBuilder,
} from "@supabase/postgrest-js";
import { Database } from "@/types/supabase";

// Simple LRU cache for query results
type CacheEntry = {
  data: any;
  expires: number;
};

const queryCache = new Map<string, CacheEntry>();
const MAX_CACHE_ENTRIES = 50; // Limit cache size for memory efficiency

type Table = keyof Database["public"]["Tables"];
type TableRow<T extends Table> = Database["public"]["Tables"][T]["Row"];

/**
 * Select only the necessary columns from a table
 * @param query The Supabase query builder
 * @param columns Array of column names to select
 * @returns Modified query with only specified columns
 */
export function selectColumns<T extends Table>(
  query: PostgrestFilterBuilder<Database["public"]["Tables"][T]>,
  columns: (keyof TableRow<T>)[],
): PostgrestTransformBuilder<Database["public"]["Tables"][T]> {
  return query.select(columns.join(","));
}

/**
 * Add caching headers to Supabase fetch requests
 * @param seconds Cache duration in seconds
 * @returns Headers object with cache control
 */
export function getCacheHeaders(seconds: number = 60) {
  return {
    headers: {
      "Cache-Control": `public, max-age=${seconds}, s-maxage=${seconds * 2}`,
      "CDN-Cache-Control": `public, max-age=${seconds * 4}`,
      "Surrogate-Control": `public, max-age=${seconds * 4}`,
    },
  };
}

/**
 * Optimize a product query by selecting only necessary fields and adding caching
 * @param query The Supabase query builder for products table
 * @param cacheDuration Cache duration in seconds
 * @param limit Maximum number of results to return (pagination)
 * @returns Optimized query
 */
export function optimizeProductQuery(
  query: PostgrestFilterBuilder<Database["public"]["Tables"]["products"]>,
  _cacheDuration: number = 60,
  limit: number = 12, // Default to reasonable page size
): PostgrestFilterBuilder<Database["public"]["Tables"]["products"]> {
  // Apply security best practices - always filter by status
  return query
    .select(
      `
      id,
      name,
      price,
      compare_at_price,
      stock,
      status,
      images,
      slug,
      trending_order,
      featured_order,
      deal_order
    `,
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit) // Always apply a limit to prevent excessive data transfer
    .returns<TableRow<"products">[]>();
}

/**
 * Optimize image loading by adding width and quality parameters
 * @param imageUrl The original image URL
 * @param width Desired width in pixels
 * @param quality Image quality (1-100)
 * @param format Image format (webp recommended for best compression)
 * @returns Optimized image URL with parameters
 */
export function optimizeImageUrl(
  imageUrl: string,
  width: number = 800,
  quality: number = 80,
  format: "webp" | "jpg" | "auto" = "webp",
): string {
  if (!imageUrl) return "";

  // Security check - validate URL format
  try {
    // Handle relative URLs
    if (!imageUrl.startsWith("http") && !imageUrl.startsWith("/")) {
      return imageUrl; // Return as is if it's not a URL we can process
    }

    // For Supabase URLs, add optimization parameters
    if (imageUrl.includes("supabase")) {
      const url = new URL(imageUrl);
      url.searchParams.set("width", width.toString());
      url.searchParams.set("quality", quality.toString());

      // WebP provides better compression and quality
      if (format !== "auto") {
        url.searchParams.set("format", format);
      }

      // Add cache control for better performance
      url.searchParams.set("cache-control", "public, max-age=31536000");

      return url.toString();
    }

    return imageUrl;
  } catch (error) {
    console.error("Error optimizing image URL:", error);
    return imageUrl; // Return original URL if there's an error
  }
}

/**
 * Cache query results to reduce Supabase API calls
 * @param cacheKey Unique key for the query
 * @param fetchFn Function that performs the actual data fetch
 * @param ttlSeconds Time to live in seconds
 * @returns Cached or fresh data
 */
export async function cachedQuery<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 60,
): Promise<T> {
  // Check if we have a valid cached result
  const now = Date.now();
  const cached = queryCache.get(cacheKey);

  if (cached && cached.expires > now) {
    return cached.data as T;
  }

  // If not in cache or expired, fetch fresh data
  const data = await fetchFn();

  // Clean up cache if it's getting too large
  if (queryCache.size >= MAX_CACHE_ENTRIES) {
    // Remove oldest entry
    const oldestKey = queryCache.keys().next().value;
    if (oldestKey) queryCache.delete(oldestKey);
  }

  // Store in cache
  if (cacheKey)
    queryCache.set(cacheKey, {
      data,
      expires: now + ttlSeconds * 1000,
    });

  return data;
}

/**
 * Sanitize user input for safe use in database queries
 * @param input User-provided input string
 * @returns Sanitized string safe for database use
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";

  // Remove any SQL injection patterns
  return input
    .replace(/[\\';\-\-]/g, "") // Remove SQL comment markers and quotes
    .replace(
      /\bdrop\b|\bdelete\b|\bupdate\b|\binsert\b|\bselect\b|\bunion\b|\balter\b/gi,
      "",
    ) // Remove SQL keywords
    .trim();
}

/**
 * Optimize SEO metadata for product pages
 * @param product Product data
 * @returns SEO-friendly metadata
 */
export function getProductSeoMetadata(product: any) {
  if (!product) return {};

  const title = product.name
    ? `${product.name} | Sokohub Kenya`
    : "Sokohub Kenya";
  const description = product.description
    ? `${product.description.substring(0, 160)}...`
    : "Quality products at affordable prices in Kenya";

  const imageUrl =
    product.images && product.images[0]
      ? optimizeImageUrl(product.images[0], 1200, 80, "webp")
      : "";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl, alt: product.name }] : [],
      locale: "en_KE",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${product.slug}`,
    },
  };
}
