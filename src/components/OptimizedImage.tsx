import { useState, useEffect, useCallback, useRef } from "react";
import Image, { ImageLoaderProps } from "next/image";

interface OptimizedImageProps {
  src: string | { src: string };
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: "lazy" | "eager";
  quality?: number;
  priority?: boolean;
  preload?: boolean;
  sizes?: string;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
}

/**
 * OptimizedImage wraps next/image for best performance.
 * - Uses responsive sizes by default.
 * - Use priority/preload for above-the-fold images.
 * - Use loading="lazy" for below-the-fold images.
 * - Optionally use placeholder="blur" and blurDataURL for LQIP.
 */

// Default neutral blurDataURL (light gray)
const DEFAULT_BLUR =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P4z8DwHwAFgwJ/lwQn1wAAAABJRU5ErkJggg==";

// Cloudflare loader: simply return the original src so Cloudflare can handle optimisation
const cloudflareLoader = ({ src }: ImageLoaderProps) => src;

export default function OptimizedImage({
  src,
  alt,
  width = 800,
  height,
  className = "",
  loading = "lazy",
  quality = 75,
  priority = false,
  preload = false,
  sizes,
  placeholder = "blur",
  blurDataURL,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Normalize src to string if it's an imported image module
  const normalizedSrc =
    typeof src === "object" && src !== null && "src" in src ? src.src : src;

  // Handle image preloading for critical images (disabled to reduce preload warnings)
  useEffect(() => {
    // Preloading disabled to reduce unused preload warnings
    // Only enable for truly critical above-the-fold images
    if (!preload || !normalizedSrc || typeof document === "undefined") return;
    // const link = document.createElement('link');
    // link.rel = 'preload';
    // link.as = 'image';
    // link.href = normalizedSrc;
    // link.fetchPriority = 'high';
    // document.head.appendChild(link);
    // return () => {
    //   document.head.removeChild(link);
    // };
  }, [normalizedSrc, preload]);

  // Handle image load state
  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    // Only log errors in development to reduce console noise
    if (process.env.NODE_ENV === "development") {
      console.error("[OptimizedImage] Failed to load image:", normalizedSrc);
    }
    setHasError(true);
    setIsLoading(false);
  }, [normalizedSrc]);

  // Smart default for sizes: full width on mobile, half on tablet, 1/3 on desktop
  const defaultSizes =
    sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-100">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="flex space-x-1">
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
          </div>
        </div>
      )}
      {/* Lightweight loading animation: fade-in + pop */}
      <Image
        src={normalizedSrc}
        alt={alt}
        width={width}
        height={height || Math.round(width * 0.75)}
        className={`
          transition-all duration-500
          ${isLoading ? "opacity-0 scale-95" : "opacity-100 scale-100"}
          ${className}
        `}
        loading={priority ? "eager" : loading}
        priority={priority}
        quality={quality}
        sizes={defaultSizes}
        placeholder={placeholder}
        blurDataURL={blurDataURL || DEFAULT_BLUR}
        onLoad={handleLoad}
        onError={handleError}
        style={{ backgroundColor: isLoading ? "#f3f4f6" : undefined }}
        loader={cloudflareLoader}
        unoptimized
      />
      {/* If image fails, show a simple icon */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <svg
            className="w-10 h-10 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

// Add shimmer and slow spin animations to your global CSS (e.g., tailwind.config.js or global.css):
// .animate-shimmer { background-size: 200% 100%; animation: shimmer 1.2s linear infinite; }
// @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
// .animate-spin-slow { animation: spin 1.5s linear infinite; }
// .animate-bounce { animation: bounce 1s infinite; }
