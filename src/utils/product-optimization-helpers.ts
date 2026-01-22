/**
 * Product Optimization Helper Functions
 *
 * These functions can be easily integrated into your existing
 * product upload and update workflows to ensure automatic optimization
 */

/**
 * Call this after uploading a new product
 * Automatically optimizes the product for blazing fast performance
 */
export async function optimizeNewProductAfterUpload(
  productId: string,
): Promise<boolean> {
  try {
    console.log(`🚀 Auto-optimizing newly uploaded product: ${productId}`);

    const response = await fetch("/api/optimize/product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "optimize-new",
        productId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Optimization failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`✅ Product ${productId} optimized:`, result.message);

    return true;
  } catch (error) {
    console.error(`❌ Failed to optimize product ${productId}:`, error);
    return false;
  }
}

/**
 * Call this after updating product information (price, description, etc.)
 * Updates the optimized data without regenerating images
 */
export async function updateOptimizedProductData(
  productId: string,
  updates: {
    name?: string;
    description?: string;
    price?: number;
    compare_at_price?: number;
    is_featured?: boolean;
    is_trending?: boolean;
  },
): Promise<boolean> {
  try {
    console.log(`🔄 Updating optimized data for product: ${productId}`);

    const response = await fetch("/api/optimize/product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "update",
        productId,
        updates,
      }),
    });

    if (!response.ok) {
      throw new Error(`Update failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`✅ Product ${productId} updated:`, result.message);

    return true;
  } catch (error) {
    console.error(`❌ Failed to update product ${productId}:`, error);
    return false;
  }
}

/**
 * Check if a product is optimized
 */
export async function checkProductOptimizationStatus(
  productId: string,
): Promise<{
  isOptimized: boolean;
  lastOptimized?: string;
  lastModified?: string;
}> {
  try {
    const response = await fetch(
      `/api/optimize/product?productId=${productId}`,
    );

    if (!response.ok) {
      throw new Error(`Check failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(
      `Failed to check optimization status for ${productId}:`,
      error,
    );
    return { isOptimized: false };
  }
}

/**
 * Force revalidation of product pages after updates
 */
export async function revalidateProductPages(
  productSlug: string,
  categorySlug?: string,
): Promise<boolean> {
  try {
    const pagesToRevalidate = [
      `/products/${productSlug}`,
      "/", // Homepage
    ];

    if (categorySlug) {
      pagesToRevalidate.push(`/categories/${categorySlug}`);
    }

    const promises = pagesToRevalidate.map((path) =>
      fetch("/api/revalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path }),
      }),
    );

    await Promise.allSettled(promises);
    console.log(
      `🔄 Revalidated ${pagesToRevalidate.length} pages for product ${productSlug}`,
    );

    return true;
  } catch (error) {
    console.error(`Failed to revalidate pages for ${productSlug}:`, error);
    return false;
  }
}

/**
 * Complete workflow for new product upload
 * Call this function after successfully uploading a new product
 */
export async function completeNewProductWorkflow(productId: string): Promise<{
  optimized: boolean;
  revalidated: boolean;
}> {
  console.log(
    `🎯 Running complete optimization workflow for product: ${productId}`,
  );

  // Step 1: Optimize the product
  const optimized = await optimizeNewProductAfterUpload(productId);

  // Step 2: Give it a moment to process
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Step 3: Check status and get product details
  const status = await checkProductOptimizationStatus(productId);

  // Step 4: Revalidate relevant pages (if we have the slug)
  let revalidated = false;
  if (status.isOptimized) {
    // You might need to fetch the product slug here if not available
    // For now, we'll just revalidate the homepage
    revalidated = await revalidateProductPages("", "");
  }

  return { optimized, revalidated };
}

/**
 * Complete workflow for product updates
 * Call this function after successfully updating product information
 */
export async function completeProductUpdateWorkflow(
  productId: string,
  updates: any,
  productSlug?: string,
  categorySlug?: string,
): Promise<{
  updated: boolean;
  revalidated: boolean;
}> {
  console.log(`🎯 Running complete update workflow for product: ${productId}`);

  // Step 1: Update optimized data
  const updated = await updateOptimizedProductData(productId, updates);

  // Step 2: Revalidate relevant pages
  let revalidated = false;
  if (updated && productSlug) {
    revalidated = await revalidateProductPages(productSlug, categorySlug);
  }

  return { updated, revalidated };
}

/**
 * Integration examples for your existing workflows
 */
export const integrationExamples = {
  // Example: In your product upload form/API
  afterProductUpload: `
    // After successfully saving product to database
    const productId = savedProduct.id;
    
    // Automatically optimize for performance
    await completeNewProductWorkflow(productId);
  `,

  // Example: In your product update form/API
  afterProductUpdate: `
    // After successfully updating product in database
    const { productId, slug, categorySlug } = updatedProduct;
    const changes = { name, description, price, compare_at_price };
    
    // Update optimized data
    await completeProductUpdateWorkflow(productId, changes, slug, categorySlug);
  `,

  // Example: In your admin dashboard
  checkOptimizationStatus: `
    // Check if product is optimized
    const status = await checkProductOptimizationStatus(productId);
    
    if (!status.isOptimized) {
      console.log('Product needs optimization');
      await optimizeNewProductAfterUpload(productId);
    }
  `,
};

/**
 * Batch operations for handling multiple products
 */
export async function batchOptimizeProducts(productIds: string[]): Promise<{
  successful: number;
  failed: number;
  results: Array<{ productId: string; success: boolean; error?: string }>;
}> {
  console.log(`🚀 Batch optimizing ${productIds.length} products...`);

  const results = await Promise.allSettled(
    productIds.map(async (productId) => {
      try {
        const success = await optimizeNewProductAfterUpload(productId);
        return { productId, success };
      } catch (error) {
        return {
          productId,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),
  );

  const processedResults = results.map((result) =>
    result.status === "fulfilled"
      ? result.value
      : { productId: "unknown", success: false, error: "Promise rejected" },
  );

  const successful = processedResults.filter((r) => r.success).length;
  const failed = processedResults.filter((r) => !r.success).length;

  console.log(
    `✅ Batch optimization complete: ${successful} successful, ${failed} failed`,
  );

  return { successful, failed, results: processedResults };
}
