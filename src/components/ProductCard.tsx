"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import LazyMotionDom from "./motion/LazyMotionDom"; // Import LazyMotionDom
import UltraFastImage from "./UltraFastImage";

import { ShoppingCartIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

import type { Product, CartItem } from "@/data/types";
import { useCart } from "@/hooks/useCart";
import { getProductImageUrl, debugImageData } from "@/utils/product-images";
import { getProductUrl } from "@/utils/product-url";
import { toast } from "sonner";


interface ProductCardProps {
  product: Product;
  className?: string;
  showIndex?: boolean;
  priority?: boolean;
}

const ProductCard = ({
  product,
  className = "",
  showIndex = false,
  priority = false,
}: ProductCardProps) => {
  // Debug image data in development
  debugImageData(product.images, product.name);

  const imageUrl = getProductImageUrl(product.images?.[0]);

  // Extract image ID for ultra-fast loading
  const getImageId = (url: string) => {
    const match = url.match(/\/([^\/\?]+)(\?|$)/);
    return match ? match[1] : "";
  };

  const imageId = getImageId(imageUrl) || "placeholder";

  const [addCartStatus, setAddCartStatus] = useState<
    "idle" | "loading" | "success"
  >("idle");
  const { addToCart } = useCart();
  const [isNavigating, setIsNavigating] = useState(false);
  const router = require("next/navigation").useRouter?.() || null;

  if (!product.slug) {
    console.error("Product is missing slug:", product);
    return null;
  }

  const handleAddToCart = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (addCartStatus !== "idle" && addCartStatus !== "success") return;

    setAddCartStatus("loading");
    console.log(`Adding product ${product.id} (${product.name}) to cart...`);

    const cartItemToAdd: CartItem = {
      ...product,
      quantity: 1,
      selectedSize: product.sizes?.[0]?.value ?? undefined,
    };

    try {
      await new Promise((resolve) => setTimeout(resolve, 750));
      addToCart(cartItemToAdd);
      setAddCartStatus("success");



      const successMessage = cartItemToAdd.selectedSize
        ? `${product.name} (Size: ${cartItemToAdd.selectedSize}) added to cart!`
        : `${product.name} added to cart!`;
      toast.success(successMessage);

      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(100); // Vibrate for 100ms
      }
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      setAddCartStatus("idle");
      toast.error("Could not add item to cart. Please try again.");
      return;
    }

    setTimeout(() => {
      setAddCartStatus("idle");
    }, 2000);
  };

  const handleCardClick = async () => {
    if (isNavigating) return;
    setIsNavigating(true);



    // Add a small delay for visual feedback
    setTimeout(() => {
      if (router) {
        router.push(getProductUrl(product));
      } else {
        window.location.href = getProductUrl(product);
      }
    }, 120); // quick tap feedback
  };

  const SpinnerIcon = () => (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  return (
    <LazyMotionDom>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`group relative rounded-xl bg-white p-1 shadow-sm product-card-hover ${className} ${isNavigating ? "pointer-events-none opacity-70" : ""
          }`}
        whileTap={{ scale: 0.97 }}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${product.name}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleCardClick();
        }}
      >
        {/* Loading overlay when navigating */}
        {isNavigating && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/70 rounded-xl">
            <svg
              className="animate-spin h-8 w-8 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}
        <div className="block">
          <div className="relative aspect-square bg-gray-100 overflow-hidden rounded-lg">
            {showIndex && "index" in product && (
              <div className="absolute top-0 left-0 z-10 w-12 h-12 flex items-center justify-center">
                <svg
                  width="42"
                  height="36"
                  viewBox="0 0 28 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 3C14 3 10 6 10 9.5C10 11.5 11 13 14 13C17 13 18 11.5 18 9.5C18 6 14 3 14 3Z"
                    fill="#10B981"
                  />
                  <path
                    d="M14 3C14 3 18 6 18 9.5C18 11.5 17 13 14 13C11 13 10 11.5 10 9.5C10 6 14 3 14 3Z"
                    fill="#059669"
                  />
                  <path
                    d="M14 5C14 5 8 9 8 13C8 16.5 11 19 14 19C17 19 20 16.5 20 13C20 9 14 5 14 5Z"
                    fill="#10B981"
                  />
                  <path
                    d="M14 5C20 9 20 13 20 13C20 16.5 17 19 14 19C17 19 20 16.5 20 13C20 9 14 5 14 5Z"
                    fill="#059669"
                    fillOpacity="0.8"
                  />
                </svg>
                <span className="absolute text-white font-extrabold text-lg left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 drop-shadow-sm">
                  {product.index}
                </span>
              </div>
            )}
            {((product.salePrice && product.price > product.salePrice) ||
              (product as any).discountPercentage) && (
                <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                  {(product as any).discountPercentage
                    ? `${(product as any).discountPercentage}% OFF`
                    : `${Math.round(
                      ((product.price - product.salePrice!) / product.price) *
                      100,
                    )}% OFF`}
                </div>
              )}
            <UltraFastImage
              imageId={imageId}
              alt={product.name}
              priority={priority}
              width={400}
              height={400}
              className="w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="mt-4 space-y-1">
            <h3 className="text-base sm:text-lg font-normal sm:font-medium text-gray-900 group-hover:text-primary transition-colors duration-200 truncate sm:truncate-none">
              {product.name}
            </h3>
            <div className="flex flex-col space-y-0">
              {product.salePrice && product.price > product.salePrice ? (
                <>
                  <span className="text-base sm:text-lg font-normal sm:font-bold text-primary">
                    KSh {product.salePrice.toLocaleString()}
                  </span>
                  <span
                    className={`text-sm line-through ${className?.includes("best-deals-card")
                      ? "text-gray-300/70"
                      : "text-gray-500"
                      }`}
                  >
                    KSh {product.price.toLocaleString()}
                  </span>
                </>
              ) : (
                <span className="text-base sm:text-lg font-normal sm:font-bold text-primary">
                  KSh {product.price.toLocaleString()}
                </span>
              )}
            </div>
            {/* Add to Cart Button Container - Enhanced for mobile */}
            <div className="pt-2 transition-all duration-300 ease-in-out lg:max-h-0 lg:opacity-0 lg:overflow-hidden group-hover:lg:max-h-14 group-hover:lg:opacity-100">
              <motion.button
                onClick={handleAddToCart}
                disabled={addCartStatus === "loading"}
                className={`relative mx-auto w-11/12 sm:w-full min-h-[48px]
                  flex items-center justify-center gap-2
                  py-3 px-4 rounded-full
                  text-[15px] font-medium tracking-wide
                  shadow-sm active:shadow-none
                  transition-all duration-200 ease-in-out 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50
                  active:scale-[0.98] 
                  before:absolute before:inset-0 before:rounded-full before:bg-black/0 
                  before:transition-colors before:duration-200
                  active:before:bg-black/[0.12]
                  disabled:before:bg-transparent
                  ${addCartStatus === "loading" || addCartStatus === "success"
                    ? "cursor-not-allowed shadow-none"
                    : "hover:shadow-md active:translate-y-[1px]"
                  }
                  ${addCartStatus === "success"
                    ? "bg-emerald-600 text-white"
                    : "bg-primary text-white"
                  }
                  disabled:opacity-60 disabled:cursor-not-allowed disabled:active:translate-y-0`}
                whileHover={addCartStatus === "idle" ? { scale: 1.02 } : {}}
                whileTap={addCartStatus === "idle" ? { scale: 0.98 } : {}}
              >
                <span className="relative flex items-center justify-center gap-2">
                  {addCartStatus === "loading" && (
                    <>
                      <SpinnerIcon />
                      <span>Adding...</span>
                    </>
                  )}
                  {addCartStatus === "success" && (
                    <>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center justify-center"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                      </motion.span>
                      <span>Added!</span>
                    </>
                  )}
                  {addCartStatus === "idle" && (
                    <>
                      <ShoppingCartIcon className="h-5 w-5" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </LazyMotionDom>
  );
};

export default ProductCard;
