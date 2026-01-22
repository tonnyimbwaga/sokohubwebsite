"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import UltraFastImage from "./UltraFastImage";
import { ShoppingCartIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

interface StaticProduct {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  slug: string;
  category: string;
  categorySlug: string;
  images: {
    primary: {
      mobile: string;
      tablet: string;
      desktop: string;
      thumb: string;
    };
  };
}

interface UltraFastProductCardProps {
  product: StaticProduct;
  priority?: boolean;
  className?: string;
  showIndex?: boolean;
  index?: number;
}

/**
 * Ultra-fast product card optimized for performance:
 * - Uses pre-generated static image URLs
 * - No database queries needed
 * - Aggressive caching
 * - Minimal JavaScript bundle
 * - Zero layout shift
 */
export default function UltraFastProductCard({
  product,
  priority = false,
  className = "",
  showIndex = false,
  index,
}: UltraFastProductCardProps) {
  const [addCartStatus, setAddCartStatus] = useState<
    "idle" | "loading" | "success"
  >("idle");
  const { addToCart } = useCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (addCartStatus !== "idle") return;

    setAddCartStatus("loading");

    try {
      // Optimistic update with minimal delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      addToCart({
        id: product.id,
        name: product.name,
        price:
          product.compareAtPrice && product.compareAtPrice < product.price
            ? product.compareAtPrice
            : product.price,
        quantity: 1,
        slug: product.slug,
        category: product.category,
        categorySlug: product.categorySlug,
        images: [{ url: product.images.primary.thumb }],
      } as any);

      setAddCartStatus("success");
      toast.success(`${product.name} added to cart!`);

      // Reset after success feedback
      setTimeout(() => setAddCartStatus("idle"), 1500);
    } catch (error) {
      setAddCartStatus("idle");
      toast.error("Failed to add to cart");
    }
  };

  // Extract image ID from URL for UltraFastImage
  const getImageId = (url: string) => {
    const match = url.match(/\/([^\/\?]+)(\?|$)/);
    return match ? match[1] : "";
  };

  const imageId = getImageId(product.images.primary.thumb) || "placeholder";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index ? index * 0.1 : 0 }}
      className={`group relative rounded-xl bg-white p-3 shadow-sm product-card-hover ${className}`}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-50">
          {/* Index badge */}
          {showIndex && index !== undefined && (
            <div className="absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              {index + 1}
            </div>
          )}

          {/* Sale badge */}
          {product.compareAtPrice && product.price < product.compareAtPrice && (
            <div className="absolute top-2 right-2 z-10 rounded-md bg-red-500 px-2 py-1 text-xs font-bold text-white">
              {Math.round(
                ((product.compareAtPrice - product.price) /
                  product.compareAtPrice) *
                  100,
              )}
              % OFF
            </div>
          )}

          {/* Ultra-fast image */}
          <UltraFastImage
            imageId={imageId}
            alt={product.name}
            priority={priority}
            width={400}
            height={400}
            className="h-full w-full transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="mt-3 space-y-1">
          {/* Product name */}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2">
            {product.compareAtPrice &&
            product.price < product.compareAtPrice ? (
              <>
                <span className="text-lg font-bold text-primary">
                  KSh {product.price.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  KSh {product.compareAtPrice.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-primary">
                KSh {product.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to cart button */}
      <div className="mt-3 opacity-0 transition-opacity group-hover:opacity-100 lg:opacity-100">
        <motion.button
          onClick={handleAddToCart}
          disabled={addCartStatus === "loading"}
          className={`
            flex mx-auto w-11/12 sm:w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium
            transition-all duration-200
            ${
              addCartStatus === "success"
                ? "bg-green-500 text-white"
                : "bg-primary text-white hover:bg-primary/90"
            }
            ${
              addCartStatus === "loading" ? "cursor-not-allowed opacity-60" : ""
            }
          `}
          whileHover={addCartStatus === "idle" ? { scale: 1.02 } : {}}
          whileTap={addCartStatus === "idle" ? { scale: 0.98 } : {}}
        >
          {addCartStatus === "loading" && (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Adding...
            </>
          )}

          {addCartStatus === "success" && (
            <>
              <CheckCircleIcon className="h-4 w-4" />
              Added!
            </>
          )}

          {addCartStatus === "idle" && (
            <>
              <ShoppingCartIcon className="h-4 w-4" />
              Add to Cart
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
