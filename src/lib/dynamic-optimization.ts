/**
 * Dynamic Optimization System
 *
 * Automatically optimizes new products and handles updates
 * without requiring full site rebuilds
 */

import {
  generateStaticImageUrls,
  generateResponsiveSrcSet,
  type StaticImageUrls,
} from "@/utils/static-image-generator";

interface ProductUpdatePayload {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  compare_at_price?: number;
  images?: any[];
  is_featured?: boolean;
  is_trending?: boolean;
}

/**
 * Automatically optimize a new product when it's uploaded
 */
export async function optimizeNewProduct(productId: string) {
  try {
    console.log(`🚀 Auto-optimizing new product: ${productId}`);

    // Import Supabase client dynamically to avoid edge runtime issues
    const { supabase } = await import("./supabase/client");

    // Fetch the new product
    const { data: product, error } = await supabase
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
        updated_at,
        category:category_id(id, name, slug)
      `,
      )
      .eq("id", productId)
      .single();

    if (error || !product) {
      throw new Error(
        `Failed to fetch product ${productId}: ${error?.message}`,
      );
    }

    // Generate optimized data
    const optimizedProduct = await generateOptimizedProduct(product);

    // Update the static manifest
    await updateStaticManifest("add", optimizedProduct);

    // Pre-warm CDN cache for this product's images
    await preWarmProductImages(optimizedProduct);

    console.log(`✅ Product ${productId} optimized successfully`);
    return optimizedProduct;
  } catch (error) {
    console.error(`❌ Failed to optimize product ${productId}:`, error);
    throw error;
  }
}

/**
 * Handle product updates (price, description, etc.)
 */
export async function handleProductUpdate(
  productId: string,
  updates: ProductUpdatePayload,
) {
  try {
    console.log(`🔄 Updating optimized data for product: ${productId}`);

    // For price/description updates, we only need to update the manifest
    // Images remain the same (cached forever)
    const updatedProduct = await updateProductInManifest(productId, updates);

    // Trigger ISR revalidation for affected pages
    await revalidateProductPages(updatedProduct);

    console.log(`✅ Product ${productId} updated successfully`);
    return updatedProduct;
  } catch (error) {
    console.error(`❌ Failed to update product ${productId}:`, error);
    throw error;
  }
}

/**
 * Generate optimized product data
 */
async function generateOptimizedProduct(product: any) {
  const category = Array.isArray(product.category)
    ? product.category[0]
    : product.category;
  let primaryImageUrl =
    product.images?.[0]?.web_image_url || product.images?.[0]?.url;

  // Clean the image URL to extract just the file ID/path (remove transformation parameters)
  if (primaryImageUrl && primaryImageUrl.includes("?")) {
    primaryImageUrl = primaryImageUrl.split("?")[0];
  }
  // Extract just the filename from the full URL
  if (primaryImageUrl && primaryImageUrl.includes("/")) {
    primaryImageUrl = primaryImageUrl.split("/").pop() || primaryImageUrl;
  }

  if (!primaryImageUrl) {
    throw new Error(`Product ${product.id} has no images`);
  }

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compare_at_price,
    slug: product.slug,
    category: category?.name || "",
    categorySlug: category?.slug || "",
    images: {
      primary: generateStaticImageUrls(primaryImageUrl),
      srcSet: generateResponsiveSrcSet(primaryImageUrl),
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
      lastModified: product.updated_at || product.created_at,
      etag: `"${product.id}-${new Date(
        product.updated_at || product.created_at,
      ).getTime()}"`,
      isOptimized: true,
      optimizedAt: new Date().toISOString(),
    },
  };
}

/**
 * Update the static manifest with new or updated products
 */
async function updateStaticManifest(action: "add" | "update", product: any) {
  try {
    // In a real implementation, you'd:
    // 1. Read current manifest from CDN/cache
    // 2. Update it with new product
    // 3. Write back to CDN
    // 4. Invalidate cache

    // For now, we'll trigger a background regeneration
    await fetch("/api/static-data/regenerate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, product }),
    });
  } catch (error) {
    console.error("Failed to update static manifest:", error);
  }
}

/**
 * Update specific product in manifest (for price/description changes)
 */
async function updateProductInManifest(
  productId: string,
  updates: ProductUpdatePayload,
) {
  // This would update just the specific product data without regenerating images
  // Images URLs remain the same (they never change)

  const { supabase } = await import("./supabase/client");

  const { data: product, error } = await supabase
    .from("products")
    .select(
      `
      id, name, description, price, compare_at_price, slug, images,
      is_featured, is_trending, updated_at,
      category:category_id(id, name, slug)
    `,
    )
    .eq("id", productId)
    .single();

  if (error || !product) {
    throw new Error(`Failed to fetch updated product: ${error?.message}`);
  }

  return await generateOptimizedProduct(product);
}

/**
 * Pre-warm CDN cache for new product images
 */
async function preWarmProductImages(product: any) {
  try {
    const imageUrls = [
      ...Object.values(product.images.primary),
      ...product.images.gallery.flatMap((gallery: any) =>
        Object.values(gallery),
      ),
    ].filter(Boolean) as string[];

    // Make HEAD requests to warm the cache
    const promises = imageUrls.map(
      (url) => fetch(url, { method: "HEAD" }).catch(() => {}), // Ignore errors
    );

    await Promise.allSettled(promises);
    console.log(
      `🔥 Pre-warmed ${imageUrls.length} image URLs for product ${product.id}`,
    );
  } catch (error) {
    console.error("Failed to pre-warm images:", error);
  }
}

/**
 * Trigger ISR revalidation for product pages
 */
async function revalidateProductPages(product: any) {
  try {
    const pagesToRevalidate = [
      `/products/${product.slug}`,
      `/categories/${product.categorySlug}`,
      "/", // Homepage
    ];

    // Trigger Next.js ISR revalidation
    const promises = pagesToRevalidate.map(
      (path) =>
        fetch(`/api/revalidate?path=${encodeURIComponent(path)}`, {
          method: "POST",
        }).catch(() => {}), // Ignore errors
    );

    await Promise.allSettled(promises);
    console.log(
      `🔄 Triggered revalidation for ${pagesToRevalidate.length} pages`,
    );
  } catch (error) {
    console.error("Failed to revalidate pages:", error);
  }
}

/**
 * Webhook handler for automatic optimization
 * Call this from your product upload/update workflows
 */
export async function handleProductWebhook(payload: {
  eventType: "product.created" | "product.updated" | "product.deleted";
  product: any;
}) {
  const { eventType, product } = payload;

  try {
    switch (eventType) {
      case "product.created":
        await optimizeNewProduct(product.id);
        break;

      case "product.updated":
        await handleProductUpdate(product.id, product);
        break;

      case "product.deleted":
        await removeProductFromManifest(product.id);
        break;

      default:
        console.warn(`Unknown event type: ${eventType}`);
    }
  } catch (error) {
    console.error(`Webhook handler failed for ${eventType}:`, error);
    throw error;
  }
}

/**
 * Remove product from manifest when deleted
 */
async function removeProductFromManifest(productId: string) {
  try {
    await fetch("/api/static-data/regenerate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove", productId }),
    });

    console.log(`🗑️ Removed product ${productId} from manifest`);
  } catch (error) {
    console.error("Failed to remove product from manifest:", error);
  }
}

/**
 * Batch optimize multiple products (useful for initial setup)
 */
export async function batchOptimizeProducts(productIds: string[]) {
  console.log(`🚀 Batch optimizing ${productIds.length} products...`);

  const results = await Promise.allSettled(
    productIds.map((id) => optimizeNewProduct(id)),
  );

  const successful = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  console.log(
    `✅ Batch optimization complete: ${successful} successful, ${failed} failed`,
  );

  return { successful, failed, results };
}
