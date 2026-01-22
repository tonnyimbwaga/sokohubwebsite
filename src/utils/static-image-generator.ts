/**
 * Static Image URL Generator for CDN Optimization
 *
 * Since product images never change, we can:
 * 1. Pre-generate all required image variants
 * 2. Serve them directly from Cloudflare CDN
 * 3. Set aggressive cache headers (1 year+)
 * 4. Eliminate runtime image transformations
 */

// Image variant interface
export interface ImageVariant {
  width: number;
  height: number;
  quality: number;
  format: "webp" | "avif" | "jpg";
  suffix: string;
}

export interface StaticImageUrls {
  mobile: string;
  mobileAvif: string;
  tablet: string;
  tabletAvif: string;
  desktop: string;
  desktopAvif: string;
  thumb: string;
  hero: string;
  heroAvif: string;
  original: string;
}

/**
 * Generate all static image URLs for a product image
 * These URLs can be cached indefinitely since images never change
 *
 * For Cloudflare setup: URLs point to original Supabase images,
 * Cloudflare handles optimization and caching via Next.js Image component
 */
export function generateStaticImageUrls(imageId: string): StaticImageUrls {
  const baseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://tafojbtftmihrheeyoky.supabase.co";
  const bucket =
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "product-images";

  // Use direct Supabase storage URLs - Cloudflare will optimize via Next.js
  const cdnBaseUrl = `${baseUrl}/storage/v1/object/public/${bucket}`;
  const originalUrl = `${cdnBaseUrl}/${imageId}`;

  return {
    mobile: originalUrl,
    mobileAvif: originalUrl,
    tablet: originalUrl,
    tabletAvif: originalUrl,
    desktop: originalUrl,
    desktopAvif: originalUrl,
    thumb: originalUrl,
    hero: originalUrl,
    heroAvif: originalUrl,
    original: originalUrl,
  };
}

/**
 * Generate responsive image srcSet for optimal loading
 */
export function generateResponsiveSrcSet(imageId: string): {
  srcSet: string;
  srcSetAvif: string;
  sizes: string;
} {
  const urls = generateStaticImageUrls(imageId);

  // Since we're using the same URL for all variants, Next.js Image will handle the optimization
  return {
    srcSet: `${urls.original} 320w, ${urls.original} 640w, ${urls.original} 800w, ${urls.original} 1200w`,
    srcSetAvif: `${urls.original} 320w, ${urls.original} 640w, ${urls.original} 800w, ${urls.original} 1200w`,
    sizes:
      "(max-width: 640px) 320px, (max-width: 1024px) 640px, (max-width: 1280px) 800px, 1200px",
  };
}

/**
 * Pre-warm CDN cache for critical images
 * Call this during build time or for above-the-fold images
 */
export async function preWarmImageCache(imageIds: string[]): Promise<void> {
  const promises = imageIds.flatMap((imageId) => {
    const urls = generateStaticImageUrls(imageId);
    return Object.values(urls).map(
      (url) => fetch(url, { method: "HEAD" }).catch(() => { }), // Ignore errors
    );
  });

  await Promise.allSettled(promises);
}

/**
 * Get the optimal image URL based on viewport and device capabilities
 */
export function getOptimalImageUrl(
  imageId: string,
  _context: {
    width?: number;
    devicePixelRatio?: number;
    supportsAvif?: boolean;
    priority?: boolean;
  } = {},
): string {
  const urls = generateStaticImageUrls(imageId);

  // Since all URLs are the same now, just return the original
  // Next.js Image component will handle the optimization
  return urls.original;
}

/**
 * Generate image manifest for preloading critical images
 */
export function generateImageManifest(
  productImages: Array<{ id: string; priority: boolean }>,
): {
  preload: string[];
  prefetch: string[];
} {
  const preload: string[] = [];
  const prefetch: string[] = [];

  productImages.forEach(({ id, priority }) => {
    const urls = generateStaticImageUrls(id);

    if (priority) {
      // Preload critical images in modern formats
      preload.push(urls.desktopAvif, urls.desktop);
    } else {
      // Prefetch non-critical images
      prefetch.push(urls.mobile, urls.tablet);
    }
  });

  return { preload, prefetch };
}
