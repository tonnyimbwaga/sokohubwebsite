"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ProductCard from "./ProductCard";
import ViewAllCard from "./ViewAllCard";
import type { Product } from "@/data/types";

interface ProductCarouselProps {
  products: Product[];
  className?: string;
  showIndex?: boolean;
  priorityCount?: number;
  showViewAll?: boolean;
  categoryName?: string;
  categorySlug?: string;
  totalProductCount?: number; // Total products in category
}

const ProductCarousel = ({
  products,
  className = "",
  showIndex = false,
  priorityCount = 6,
  showViewAll = false,
  categoryName = "",
  categorySlug = "",
  totalProductCount = 0,
}: ProductCarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);

  const checkScrollButtons = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const handleResize = () => setTimeout(checkScrollButtons, 100);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [products]);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current && !isScrolling) {
      setIsScrolling(true);
      const { scrollLeft, clientWidth } = carouselRef.current;

      // Responsive scroll amount based on screen size
      const isMobile = window.innerWidth <= 640;
      const isTablet = window.innerWidth <= 1024 && window.innerWidth > 640;

      let scrollAmount;
      if (isMobile) {
        // On mobile, scroll by 2 cards (100% width)
        scrollAmount = clientWidth;
      } else if (isTablet) {
        // On tablet, scroll by 3 cards
        scrollAmount = Math.floor(clientWidth / 3) * 3;
      } else {
        // Desktop: scroll by visible cards
        const cardWidth = 280 + 16; // card width + gap
        scrollAmount = Math.floor(clientWidth / cardWidth) * cardWidth;
      }

      const scrollTo =
        direction === "left"
          ? scrollLeft - scrollAmount
          : scrollLeft + scrollAmount;

      carouselRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth",
      });

      setTimeout(() => {
        checkScrollButtons();
        setIsScrolling(false);
      }, 300);
    }
  };

  if (!products.length) return null;

  return (
    <div className={`relative group ${className}`}>
      {/* Left Arrow - Hidden on mobile, softer styling on desktop */}
      <AnimatePresence>
        {canScrollLeft && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            onClick={() => scroll("left")}
            disabled={isScrolling}
            className="absolute -left-4 top-1/2 z-20 hidden sm:flex h-9 w-9 lg:h-10 lg:w-10 -translate-y-1/2 items-center justify-center rounded-full bg-gray-50/90 backdrop-blur-sm shadow-sm border border-gray-200/40 transition-all hover:scale-105 hover:shadow-md hover:bg-gray-100/90 hover:border-gray-300/60 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group-hover:opacity-100 opacity-70"
            aria-label="Previous products"
          >
            <FiChevronLeft className="text-sm lg:text-base text-gray-500 transition-colors" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Carousel Container */}
      <div
        ref={carouselRef}
        className="no-scrollbar flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth mobile-carousel-container swipe-indicator scroll-shadow"
        onScroll={checkScrollButtons}
        style={{
          scrollPaddingLeft: "0.75rem",
          scrollPaddingRight: "0.75rem",
          scrollSnapType: "x mandatory",
        }}
      >
        {products.map((product, index) => (
          <div
            key={product.id}
            className="flex-shrink-0 mobile-product-card sm:min-w-[280px] sm:max-w-[280px]"
            style={{ scrollSnapAlign: "start" }}
          >
            <ProductCard
              product={product}
              showIndex={showIndex}
              priority={index < priorityCount}
              className="product-card-hover h-full"
            />
          </div>
        ))}

        {/* View All Card - Only show if there are more than 7 products in the category */}
        {showViewAll &&
          categoryName &&
          categorySlug &&
          totalProductCount > 7 && (
            <div
              className="flex-shrink-0 mobile-product-card sm:min-w-[280px] sm:max-w-[280px]"
              style={{ scrollSnapAlign: "start" }}
            >
              <ViewAllCard
                categoryName={categoryName}
                categorySlug={categorySlug}
                className="transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg h-full"
              />
            </div>
          )}
      </div>

      {/* Right Arrow - Hidden on mobile, softer styling on desktop */}
      <AnimatePresence>
        {canScrollRight && (
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            onClick={() => scroll("right")}
            disabled={isScrolling}
            className="absolute -right-4 top-1/2 z-20 hidden sm:flex h-9 w-9 lg:h-10 lg:w-10 -translate-y-1/2 items-center justify-center rounded-full bg-gray-50/90 backdrop-blur-sm shadow-sm border border-gray-200/40 transition-all hover:scale-105 hover:shadow-md hover:bg-gray-100/90 hover:border-gray-300/60 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group-hover:opacity-100 opacity-70"
            aria-label="Next products"
          >
            <FiChevronRight className="text-sm lg:text-base text-gray-500 transition-colors" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile: Subtle scroll indicator - centered relative to product images */}
      <div className="sm:hidden">
        {canScrollRight && (
          <div className="absolute top-1/2 right-4 -translate-y-1/2 flex items-center gap-1 text-gray-400">
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              }}
            >
              <FiChevronRight className="text-lg" />
            </motion.div>
          </div>
        )}
      </div>

      {/* Desktop: Scroll Indicators */}
      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 hidden lg:flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {Array.from({ length: Math.ceil(products.length / 4) }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-gray-300 transition-all duration-200"
          />
        ))}
      </div>

      <style jsx>{`
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ProductCarousel;
