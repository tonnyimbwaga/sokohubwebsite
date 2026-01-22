/**
 * Static Data Layer for Blazing Fast Performance
 *
 * Strategy:
 * 1. Pre-generate static JSON files for all products during build
 * 2. Serve from Cloudflare CDN with aggressive caching
 * 3. Use ISR for updates when product descriptions/prices change
 * 4. Keep images URLs static since they never change
 */

import {
  generateStaticImageUrls,
  generateResponsiveSrcSet,
} from "../utils/static-image-generator";

interface StaticProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  slug: string;
  category: string;
  categorySlug: string;
  images: {
    primary: ReturnType<typeof generateStaticImageUrls>;
    srcSet: ReturnType<typeof generateResponsiveSrcSet>;
    gallery: Array<ReturnType<typeof generateStaticImageUrls>>;
  };
  metadata: {
    lastModified: string;
    etag: string;
  };
}

interface StaticDataManifest {
  products: Record<string, StaticProduct>;
  categories: Record<
    string,
    {
      id: string;
      name: string;
      slug: string;
      productIds: string[];
      featuredProducts: string[];
    }
  >;
  collections: {
    featured: string[];
    trending: string[];
    newArrivals: string[];
    bestDeals: string[];
  };
  lastUpdated: string;
  version: number;
}

// Global manifest cache
let manifestCache: StaticDataManifest | null = null;
let manifestLastFetch = 0;
const MANIFEST_TTL = 60 * 1000; // 1 minute in dev, longer in prod

/**
 * Get the static data manifest from CDN
 * This is cached aggressively and only updates when products change
 */
async function getDataManifest(): Promise<StaticDataManifest> {
  const now = Date.now();

  // Return cached manifest if still valid
  if (manifestCache && now - manifestLastFetch < MANIFEST_TTL) {
    return manifestCache;
  }

  try {
    // Use relative URL for client-side requests to avoid CSP issues
    const manifestUrl =
      typeof window !== "undefined"
        ? "/api/static-data/manifest" // Client-side: relative URL
        : `${process.env.NEXT_PUBLIC_SITE_URL}/api/static-data/manifest`; // Server-side: full URL

    const response = await fetch(manifestUrl, {
      cache: "force-cache",
      next: {
        revalidate: process.env.NODE_ENV === "production" ? 3600 : 60, // 1 hour in prod, 1 min in dev
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch manifest: ${response.status}`);
    }

    manifestCache = await response.json();
    manifestLastFetch = now;

    return manifestCache!;
  } catch (error) {
    console.error("Failed to fetch static data manifest:", error);

    // Fallback to database if static data fails
    return await generateManifestFromDatabase();
  }
}

/**
 * Get product data instantly from static cache
 */
export async function getStaticProduct(
  slug: string,
): Promise<StaticProduct | null> {
  const manifest = await getDataManifest();

  // Find product by slug
  const product = Object.values(manifest.products).find((p) => p.slug === slug);
  return product || null;
}

/**
 * Get multiple products instantly
 */
export async function getStaticProducts(
  productIds: string[],
): Promise<StaticProduct[]> {
  const manifest = await getDataManifest();

  return productIds
    .map((id) => manifest.products[id])
    .filter((product): product is StaticProduct => product !== undefined);
}

/**
 * Get products by category instantly
 */
export async function getStaticProductsByCategory(
  categorySlug: string,
  limit = 10,
): Promise<StaticProduct[]> {
  const manifest = await getDataManifest();

  const category = Object.values(manifest.categories).find(
    (c) => c.slug === categorySlug,
  );
  if (!category) return [];

  return getStaticProducts(category.productIds.slice(0, limit));
}

/**
 * Get featured products instantly
 */
export async function getStaticFeaturedProducts(
  limit = 8,
): Promise<StaticProduct[]> {
  const manifest = await getDataManifest();
  return getStaticProducts(manifest.collections.featured.slice(0, limit));
}

/**
 * Get trending products instantly
 */
export async function getStaticTrendingProducts(
  limit = 8,
): Promise<StaticProduct[]> {
  const manifest = await getDataManifest();
  return getStaticProducts(manifest.collections.trending.slice(0, limit));
}

/**
 * Get new arrivals instantly
 */
export async function getStaticNewArrivals(
  limit = 8,
): Promise<StaticProduct[]> {
  const manifest = await getDataManifest();
  return getStaticProducts(manifest.collections.newArrivals.slice(0, limit));
}

/**
 * Get best deals instantly
 */
export async function getStaticBestDeals(limit = 8): Promise<StaticProduct[]> {
  const manifest = await getDataManifest();
  return getStaticProducts(manifest.collections.bestDeals.slice(0, limit));
}

/**
 * Fallback: Generate manifest from database (used for build-time generation)
 */
export async function generateManifestFromDatabase(): Promise<StaticDataManifest> {
  // Import dynamically to avoid issues in edge runtime
  const { supabase } = await import("./supabase/client");

  // Fetch all active products with their categories
  const { data: products, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      description,
      price,
      compare_at_price,
      slug,
      images,
      is_featured,
      is_trending,
      created_at,
      category:category_id(id, name, slug)
    `,
    )
    .eq("is_published", true);

  if (error || !products) {
    throw new Error("Failed to fetch products from database");
  }

  // Transform products to static format
  const staticProducts: Record<string, StaticProduct> = {};
  const categories: Record<string, any> = {};
  const collections = {
    featured: [] as string[],
    trending: [] as string[],
    newArrivals: [] as string[],
    bestDeals: [] as string[],
  };

  for (const product of products) {
    const category = Array.isArray(product.category)
      ? product.category[0]
      : product.category;
    let primaryImageId =
      product.images?.[0]?.web_image_url || product.images?.[0]?.url;

    // Clean the image URL to extract just the file ID/path (remove transformation parameters)
    if (primaryImageId && primaryImageId.includes("?")) {
      primaryImageId = primaryImageId.split("?")[0];
    }
    // Extract just the filename from the full URL
    if (primaryImageId && primaryImageId.includes("/")) {
      primaryImageId = primaryImageId.split("/").pop() || primaryImageId;
    }

    if (!primaryImageId) continue;

    const staticProduct: StaticProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compare_at_price,
      slug: product.slug,
      category: category?.name || "",
      categorySlug: category?.slug || "",
      images: {
        primary: generateStaticImageUrls(primaryImageId),
        srcSet: generateResponsiveSrcSet(primaryImageId),
        gallery: (product.images || [])
          .map((img: any) => {
            let imageId = img.web_image_url || img.url;
            // Clean the image URL to extract just the file ID/path
            if (imageId && imageId.includes("?")) {
              imageId = imageId.split("?")[0];
            }
            if (imageId && imageId.includes("/")) {
              imageId = imageId.split("/").pop() || imageId;
            }
            return imageId ? generateStaticImageUrls(imageId) : null;
          })
          .filter(Boolean),
      },
      metadata: {
        lastModified: new Date().toISOString(),
        etag: `"${product.id}-${Date.now()}"`,
      },
    };

    staticProducts[product.id] = staticProduct;

    // Organize into collections
    if (product.is_featured) {
      collections.featured.push(product.id);
    }
    if (product.is_trending) {
      collections.trending.push(product.id);
    }
    if (product.compare_at_price && product.price < product.compare_at_price) {
      collections.bestDeals.push(product.id);
    }

    // Recent products as new arrivals
    const createdAt = new Date(product.created_at);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (createdAt > thirtyDaysAgo) {
      collections.newArrivals.push(product.id);
    }

    // Group by category
    if (category) {
      if (!categories[category.id]) {
        categories[category.id] = {
          id: category.id,
          name: category.name,
          slug: category.slug,
          productIds: [],
          featuredProducts: [],
        };
      }
      categories[category.id].productIds.push(product.id);
      if (product.is_featured) {
        categories[category.id].featuredProducts.push(product.id);
      }
    }
  }

  return {
    products: staticProducts,
    categories,
    collections,
    lastUpdated: new Date().toISOString(),
    version: Date.now(),
  };
}

/**
 * Build-time static data generation
 * Call this during your build process
 */
export async function generateStaticDataFiles(): Promise<void> {
  const manifest = await generateManifestFromDatabase();

  // In a real implementation, you'd write these files to your static hosting
  // For now, we'll just prepare the data structure
  console.log("Generated static data manifest with:", {
    products: Object.keys(manifest.products).length,
    categories: Object.keys(manifest.categories).length,
    collections: {
      featured: manifest.collections.featured.length,
      trending: manifest.collections.trending.length,
      newArrivals: manifest.collections.newArrivals.length,
      bestDeals: manifest.collections.bestDeals.length,
    },
  });

  return;
}
