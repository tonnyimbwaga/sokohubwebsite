// This utility handles product image URLs without using server-specific imports
export const PLACEHOLDER_IMAGE = "/images/placeholder.png";

// Image URLs are not cached in-memory here. Rely on browser, Next.js, and Supabase/CDN caching for optimal performance.
// Ensure your Supabase bucket is public and has long-lived cache headers (e.g., Cache-Control: public, max-age=31536000, immutable)

// Optimized image configuration for Workers
const IMAGE_CONFIG = {
  // Use smaller default sizes for mobile-first approach
  defaultWidth: 400,
  defaultHeight: 400,
  // Quality settings optimized for file size
  quality: 75,
  // Supported formats in order of preference
  formats: ["webp", "avif", "jpg"] as const,
  // Lazy loading threshold
  lazyThreshold: 2000, // 2KB threshold for lazy loading
} as const;

interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "avif" | "jpg" | "png";
  resize?: "cover" | "contain" | "fill";
  cacheKey?: string;
}

// Helper function to extract image URL from various image object formats
function extractImageUrl(imageData: any): string | null {
  if (!imageData) return null;

  // If it's already a string URL
  if (typeof imageData === "string") {
    return imageData.trim() || null;
  }

  // If it's an object, try various properties
  if (typeof imageData === "object" && imageData !== null) {
    // Try common image URL properties in order of preference
    const urlProperties = [
      "web_image_url",
      "web_optimized_image_url",
      "feed_image_url",
      "url",
      "src",
      "href",
      "path",
      "filename",
      "name",
    ];

    for (const prop of urlProperties) {
      if (imageData[prop] && typeof imageData[prop] === "string") {
        const url = imageData[prop].trim();
        if (url) return url;
      }
    }
  }

  return null;
}

// Optimized image URL generator with reduced processing
export function getProductImageUrl(imageObj: any): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const bucket =
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "product-images";
  if (!imageObj) return "/images/placeholder.png";

  // If it's a string, handle as direct URL or local image
  if (typeof imageObj === "string") {
    let url = imageObj.trim();
    if (!url) return "/images/placeholder.png";

    // Strip query params
    url = url.split("?")[0];

    // 1. Already absolute (http / https)
    if (/^https?:\/\//i.test(url)) return url;

    // 2. Local public folder reference
    if (url.startsWith("/images/")) return url;

    // 3. If the string already contains a slash we assume the first segment is the bucket name,
    //    e.g. "categories/uuid.webp" or "blog/2024/05/uuid.jpg".
    if (url.includes("/")) {
      return `${supabaseUrl}/storage/v1/object/public/${url}`;
    }

    // 4. Bare UUID or filename – default bucket
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${url}`;
  }

  // If it's an object, extract the first valid URL property
  let imagePath = extractImageUrl(imageObj) || "";
  if (!imagePath) return "/images/placeholder.png";
  imagePath = imagePath.split("?")[0];
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("/images/")) return imagePath;
  // If imagePath already contains a slash, presume it includes bucket information
  if (imagePath.includes("/")) {
    return `${supabaseUrl}/storage/v1/object/public/${imagePath}`;
  }
  // Check if it's a UUID (likely a direct file in the bucket)
  if (
    imagePath.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    )
  ) {
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${imagePath}`;
  }
  // Otherwise, treat as Supabase path
  const trimmedPath = imagePath.trim();
  // If already absolute http(s) URL, return as-is
  if (/^https?:\/\//i.test(trimmedPath)) {
    return trimmedPath;
  }
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${trimmedPath}`;
}

// Optimized function for getting multiple image sizes
export function getResponsiveImageUrls(
  imageObj: any,
  sizes: number[] = [320, 640, 1024],
): Array<{ url: string; width: number }> {
  if (!imageObj) {
    return sizes.map((width) => ({
      url: PLACEHOLDER_IMAGE,
      width,
    }));
  }

  return sizes.map((width) => ({
    url: getProductImageUrl(imageObj),
    width,
  }));
}

// Optimized function for hero/banner images
export function getHeroImageUrl(imageObj: any): string {
  return getProductImageUrl(imageObj);
}

// Optimized function for thumbnail images
export function getThumbnailImageUrl(imageObj: any): string {
  return getProductImageUrl(imageObj);
}

// Preload critical images (use sparingly)
export function preloadImage(url: string, priority: boolean = false): void {
  if (typeof window === "undefined") return;

  // Only preload if image is likely to be viewed soon
  if (priority) {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = url;
    link.fetchPriority = "high";
    document.head.appendChild(link);
  }
}

// Lazy loading helper
export function shouldLazyLoad(imagePath: string | null | undefined): boolean {
  if (!imagePath) return false;

  // Don't lazy load small images or placeholders
  if (imagePath.includes("placeholder") || imagePath.includes("thumb")) {
    return false;
  }

  return true;
}

// Utility to escape XML special characters
export function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Helper to map the product's images to absolute URLs for feeds
export function getFeedImageUrl(imageObj: any): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const bucket =
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "product-images";

  if (!imageObj) {
    return "/images/placeholder.png";
  }

  const rawPath: string | undefined =
    imageObj.feed_image_url ||
    imageObj.feed_url ||
    imageObj.web_image_url ||
    imageObj.url;

  if (!rawPath || typeof rawPath !== "string") {
    return "/images/placeholder.png";
  }

  const trimmedPath = rawPath.trim();

  // Absolute URL provided
  if (/^https?:\/\//i.test(trimmedPath)) {
    return trimmedPath;
  }

  // Build Supabase public URL
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${trimmedPath}`;
}

// Debug helper to log image data structure (disabled in production)
export function debugImageData(images: any, productName?: string): void {
  // Debug logging disabled to reduce console noise
  // if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  //   console.log(`Image data for ${productName || 'product'}:`, {
  //     images,
  //     type: typeof images,
  //     isArray: Array.isArray(images),
  //     length: Array.isArray(images) ? images.length : 'N/A',
  //     firstItem: Array.isArray(images) && images.length > 0 ? images[0] : null
  //   });
  // }
}

// Helper to get product images from product_image_versions table
export async function getProductImageVersions(productId: string) {
  if (typeof window !== "undefined") {
    // Client-side: use the supabase client
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const { data, error } = await supabase
      .from("product_image_versions")
      .select("web_image_url, feed_image_url, web_optimized_image_url")
      .eq("product_id", productId);

    if (error) {
      console.error("Error fetching product image versions:", error);
      return [];
    }

    return data || [];
  }

  return [];
}
