import { useState, useEffect, useRef } from "react";
import Image, { ImageLoaderProps } from "next/image";
import {
  generateResponsiveSrcSet,
  getOptimalImageUrl,
} from "@/utils/static-image-generator";

interface UltraFastImageProps {
  imageId: string;
  alt: string;
  priority?: boolean;
  className?: string;
  width?: number;
  height?: number;
  onLoad?: () => void;
}

// Cloudflare loader returns the original URL untouched so Cloudflare handles optimisation
const cloudflareLoader = ({ src }: ImageLoaderProps) => src;

/**
 * Ultra-fast image component optimized for product images
 *
 * Features:
 * - Uses pre-generated static URLs (no runtime transformations)
 * - Aggressive CDN caching with immutable cache headers
 * - AVIF/WebP support with intelligent fallbacks
 * - Intersection observer for lazy loading
 * - Preloading for critical images
 * - Zero CLS (Cumulative Layout Shift)
 */
export default function UltraFastImage({
  imageId,
  alt,
  priority = false,
  className = "",
  width = 800,
  height = 800,
  onLoad,
}: UltraFastImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [supportsAvif, setSupportsAvif] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // Detect AVIF support
  useEffect(() => {
    const detectAvif = async () => {
      try {
        const avif = new window.Image();
        avif.src =
          "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=";
        await new Promise<void>((resolve, reject) => {
          avif.onload = () => resolve();
          avif.onerror = () => reject(new Error("AVIF not supported"));
        });
        setSupportsAvif(true);
      } catch {
        setSupportsAvif(false);
      }
    };

    detectAvif();
  }, []);

  // Intersection observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "50px", // Start loading 50px before entering viewport
      },
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  // Preload critical images with error handling
  useEffect(() => {
    if (!priority || !imageId) return;

    const optimalUrl = getOptimalImageUrl(imageId, {
      width,
      supportsAvif,
      priority: true,
    });

    // Create preload link with error handling
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = optimalUrl;
    link.fetchPriority = "high";

    // Add error handling for preload
    link.onerror = () => {
      if (process.env.NODE_ENV === "development") {
        console.warn(`Failed to preload image: ${optimalUrl}`);
      }
    };

    document.head.appendChild(link);

    return () => {
      try {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      } catch (error) {
        // Silently handle cleanup errors
      }
    };
  }, [imageId, priority, width, supportsAvif]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    if (process.env.NODE_ENV === "development") {
      console.warn(`Failed to load image: ${imageId}`);
    }
    // Still set as loaded to remove skeleton
    setIsLoaded(true);
  };

  if (!imageId) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <svg
          className="w-8 h-8 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  // Generate image URL (simplified since Next.js handles optimization)
  const imageUrl = getOptimalImageUrl(imageId, { width });

  return (
    <div ref={imgRef} className={`relative block ${className}`}>
      {/* Skeleton loader */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}

      {/* Main image - only render when in view or priority */}
      {(isInView || priority) && (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            object-contain transition-all duration-300
            ${isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}
          `}
          loader={cloudflareLoader}
          unoptimized
        />
      )}

      {/* Load indicator for critical images */}
      {priority && !isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
