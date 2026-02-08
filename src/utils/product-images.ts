// This utility handles product image URLs without using server-specific imports
export const PLACEHOLDER_IMAGE = "/images/placeholder.png";

// Image URLs are not cached in-memory here. Rely on browser, Next.js, and Supabase/CDN caching for optimal performance.
// Ensure your Supabase bucket is public and has long-lived cache headers (e.g., Cache-Control: public, max-age=31536000, immutable)

// Unused but kept for reference
/*
interface _ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "avif" | "jpg" | "png";
  resize?: "cover" | "contain" | "fill";
  cacheKey?: string;
}
*/

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

// Optimized image URL generator with Supabase Image Transformation support
export function getProductImageUrl(
  imageObj: any,
  options: {
    width?: number;
    quality?: number;
    resize?: "cover" | "contain" | "fill"
  } = {}
): string {
  const supabaseUrl: string = (process.env.NEXT_PUBLIC_SUPABASE_URL as string) || "";
  const bucket: string =
    (process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET as string) || "product-images";

  if (!imageObj) return "/images/placeholder.png";

  const knownBuckets = ["product-images", "categories", "hero-slides", "blog"];

  // If it's a string, handle as direct URL or local image
  if (typeof imageObj === "string") {
    let url: string = imageObj.trim();
    if (!url) return "/images/placeholder.png";

    // Strip query params (will re-add them if needed for transformation)
    url = url.split("?")[0];

    // 1. Already absolute (http / https)
    if (/^https?:\/\//i.test(url)) return url;

    // 2. Local public folder reference
    if (url.startsWith("/images/")) return url;

    // 3. Remove redundant prefixes like "product-images/product-images/"
    for (const b of knownBuckets) {
      const doublePrefix = `${b}/${b}/`;
      if (url.startsWith(doublePrefix)) {
        url = url.substring(b.length + 1);
        break;
      }
    }

    // 4. Resolve the path and bucket
    let finalBucket = bucket;
    let finalPath = url;

    // Remove leading slash if present
    const cleanUrl = url.startsWith("/") ? url.substring(1) : url;
    const parts = cleanUrl.split("/");

    if (parts.length > 1 && knownBuckets.includes(parts[0])) {
      finalBucket = parts[0];
      finalPath = parts.slice(1).join("/");
    } else {
      finalPath = cleanUrl;
    }

    // Base URL for the image
    let finalUrl = `${supabaseUrl}/storage/v1/object/public/${finalBucket}/${finalPath}`;

    // Apply Supabase transformations if options are provided
    const params = new URLSearchParams();
    if (options.width) params.append("width", options.width.toString());
    if (options.quality) params.append("quality", options.quality.toString());
    if (options.resize) params.append("resize", options.resize);

    if (params.toString()) {
      // Supabase image transformation format: /storage/v1/render/image/public/bucket/path?width=...
      finalUrl = `${supabaseUrl}/storage/v1/render/image/public/${finalBucket}/${finalPath}?${params.toString()}`;
    }

    return finalUrl;
  }

  // If it's an object, extract the first valid URL property
  const imagePath = extractImageUrl(imageObj);
  if (!imagePath) return "/images/placeholder.png";

  // Recursively call for the extracted string path to use the same logic
  return getProductImageUrl(imagePath, options);
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
    url: getProductImageUrl(imageObj, { width, quality: 80 }),
    width,
  }));
}

// Optimized function for hero/banner images
export function getHeroImageUrl(imageObj: any): string {
  return getProductImageUrl(imageObj, { width: 1280, quality: 85 });
}

// Optimized function for thumbnail images
export function getThumbnailImageUrl(imageObj: any): string {
  return getProductImageUrl(imageObj, { width: 400, quality: 80 });
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
export function debugImageData(_images: any, _productName?: string): void {
  // Debug logging disabled to reduce console noise
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
