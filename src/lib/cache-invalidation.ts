/**
 * Cache Invalidation System
 *
 * This system handles invalidating caches when products are updated.
 * Optimized for Cloudflare Workers environment.
 */

interface CacheInvalidationResult {
  success: boolean;
  error?: string;
  operations: {
    revalidation: boolean;
    cloudflare: boolean;
  };
}

/**
 * Simple cache invalidation that works in serverless environments
 */
export async function invalidateHomepageCache(): Promise<CacheInvalidationResult> {
  console.log("🔄 Starting cache invalidation...");

  const result: CacheInvalidationResult = {
    success: false,
    operations: {
      revalidation: false,
      cloudflare: false,
    },
  };

  try {
    // Step 1: Trigger Next.js revalidation (this is the most important part)
    console.log("🔄 Triggering Next.js revalidation...");

    if (process.env.NEXT_PUBLIC_SITE_URL) {
      try {
        const revalidateResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tags: ["homepage", "categories", "products"],
            }),
          },
        );

        if (revalidateResponse.ok) {
          console.log("✅ Next.js revalidation triggered successfully");
          result.operations.revalidation = true;
        } else {
          const errorText = await revalidateResponse.text();
          console.warn("⚠️ Next.js revalidation failed:", errorText);
        }
      } catch (error) {
        console.warn("⚠️ Next.js revalidation error:", error);
      }
    } else {
      console.warn("⚠️ NEXT_PUBLIC_SITE_URL not set, skipping revalidation");
    }

    // Step 2: Purge Cloudflare cache (if credentials are available)
    if (process.env.CLOUDFLARE_ZONE_ID && process.env.CLOUDFLARE_API_TOKEN) {
      console.log("☁️ Purging Cloudflare cache...");

      try {
        const cloudflareResponse = await fetch(
          `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              purge_everything: true,
            }),
          },
        );

        if (cloudflareResponse.ok) {
          console.log("✅ Cloudflare cache purged successfully");
          result.operations.cloudflare = true;
        } else {
          const errorText = await cloudflareResponse.text();
          console.warn("⚠️ Cloudflare cache purge failed:", errorText);
        }
      } catch (error) {
        console.warn("⚠️ Cloudflare cache purge error:", error);
      }
    } else {
      console.log(
        "☁️ Cloudflare credentials not available, skipping cache purge",
      );
    }

    // Consider it successful if at least one operation succeeded
    result.success =
      result.operations.revalidation || result.operations.cloudflare;

    if (result.success) {
      console.log("✅ Cache invalidation completed successfully");
    } else {
      console.warn("⚠️ Cache invalidation completed with warnings");
    }

    return result;
  } catch (error) {
    console.error("❌ Cache invalidation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      operations: {
        revalidation: false,
        cloudflare: false,
      },
    };
  }
}

/**
 * Invalidate cache for specific category
 */
export async function invalidateCategoryCache(
  categorySlug: string,
): Promise<CacheInvalidationResult> {
  console.log(`🔄 Invalidating cache for category: ${categorySlug}`);

  try {
    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      throw new Error("NEXT_PUBLIC_SITE_URL not set");
    }

    const revalidateResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tags: [`category-${categorySlug}`, "categories"],
        }),
      },
    );

    if (revalidateResponse.ok) {
      console.log(`✅ Category ${categorySlug} cache invalidated successfully`);
      return {
        success: true,
        operations: {
          revalidation: true,
          cloudflare: false,
        },
      };
    } else {
      const errorText = await revalidateResponse.text();
      throw new Error(`Revalidation failed: ${errorText}`);
    }
  } catch (error) {
    console.error(
      `❌ Failed to invalidate category ${categorySlug} cache:`,
      error,
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      operations: {
        revalidation: false,
        cloudflare: false,
      },
    };
  }
}

/**
 * Product update hook - call this whenever products are created/updated/deleted
 */
export async function onProductUpdate(
  productId: string,
  action: "create" | "update" | "delete",
): Promise<CacheInvalidationResult> {
  console.log(`📦 Product ${action}: ${productId}`);

  // Invalidate homepage cache when products change
  return await invalidateHomepageCache();
}
