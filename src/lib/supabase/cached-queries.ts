import { unstable_cache } from "next/cache";
import { productQueries } from "./products";

/**
 * Intelligent Caching Layer for Supabase Products
 * 
 * This layer uses Next.js unstable_cache to provide:
 * 1. Near-instant response times for cached data
 * 2. Automatic revalidation based on tags
 * 3. Fallback behavior when cache is missing
 */

export const getCachedNewArrivals = unstable_cache(
    async (limit = 8) => {
        console.log("🔥 [Cache Miss] Fetching fresh New Arrivals from DB");
        return productQueries.getNewArrivals(limit);
    },
    ["new-arrivals"],
    {
        revalidate: 3600, // Fallback revalidation of 1 hour
        tags: ["products", "new-arrivals"],
    }
);

export const getCachedFeaturedProducts = unstable_cache(
    async (limit = 8) => {
        console.log("🔥 [Cache Miss] Fetching fresh Featured Products from DB");
        return productQueries.getFeaturedProducts(limit);
    },
    ["featured-products"],
    {
        revalidate: 3600,
        tags: ["products", "featured"],
    }
);

export const getCachedDeals = unstable_cache(
    async (limit = 8) => {
        console.log("🔥 [Cache Miss] Fetching fresh Deals from DB");
        return productQueries.getDeals(limit);
    },
    ["product-deals"],
    {
        revalidate: 3600,
        tags: ["products", "deals"],
    }
);

export const getCachedTrendingProducts = unstable_cache(
    async (limit = 8) => {
        console.log("🔥 [Cache Miss] Fetching fresh Trending Products from DB");
        return productQueries.getTrendingProducts(limit);
    },
    ["trending-products"],
    {
        revalidate: 3600,
        tags: ["products", "trending"],
    }
);

export const getCachedProductBySlug = (slug: string) => unstable_cache(
    async () => {
        console.log(`🔥 [Cache Miss] Fetching fresh product: ${slug}`);
        return productQueries.getProductBySlug(slug);
    },
    [`product-${slug}`],
    {
        revalidate: 3600,
        tags: ["products", `product-${slug}`],
    }
)();

export const getCachedProducts = (params: any) => unstable_cache(
    async () => {
        console.log("🔥 [Cache Miss] Fetching products with params:", params);
        return productQueries.getProducts(params);
    },
    [`products-list-${JSON.stringify(params)}`],
    {
        revalidate: 3600,
        tags: ["products", "products-list"],
    }
)();

export const getCachedCategories = unstable_cache(
    async () => {
        const { supabase } = await import("./client");
        const { data } = await supabase.from("categories").select("name, slug, id").eq("is_active", true);
        return data || [];
    },
    ["categories-list"],
    {
        revalidate: 3600,
        tags: ["categories"],
    }
);
