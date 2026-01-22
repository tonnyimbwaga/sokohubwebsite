"use client";

import Link from "next/link";
import { generateCategoryAnchor } from "@/lib/static-category-data";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Skeleton } from "@/components/ui";
import { getProductImageUrl } from "@/utils/product-images";

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

interface CategoryCarouselProps {
  categories: Category[];
}

const CategoryCarousel = ({ categories }: CategoryCarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const isLoading = !categories || categories.length === 0;

  const checkScrollButtons = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener("resize", checkScrollButtons);
    return () => window.removeEventListener("resize", checkScrollButtons);
  }, [categories]); // Re-run when categories load

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;

      // Mobile-friendly scroll distance
      const isMobile = window.innerWidth <= 640;
      const scrollDistance = isMobile ? clientWidth * 0.8 : clientWidth / 2;

      const scrollTo =
        direction === "left"
          ? scrollLeft - scrollDistance
          : scrollLeft + scrollDistance;

      carouselRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth",
      });

      setTimeout(checkScrollButtons, 300);
    }
  };

  // Helper to get optimized category image URL
  const getCategoryImageUrl = (imageUrl: string | null): string => {
    return getProductImageUrl(imageUrl);
  };

  return (
    <div className="relative py-3 sm:py-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="w-full">
        <div className="relative group">
          {/* Gradient scroll shadows */}
          {canScrollLeft && (
            <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-white/95 to-transparent" />
          )}
          {canScrollRight && (
            <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-white/95 to-transparent" />
          )}

          {/* Desktop arrows only */}
          {canScrollLeft && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => scroll("left")}
              className="absolute -left-3 top-1/2 z-20 hidden sm:flex h-10 w-10 lg:h-12 lg:w-12 -translate-y-1/2 items-center justify-center rounded-full bg-gray-50/90 backdrop-blur-sm shadow-sm border border-gray-200/40 transition-all hover:scale-105 hover:shadow-md hover:bg-gray-100/90 hover:border-gray-300/60 active:scale-95 group-hover:opacity-100 opacity-70"
              aria-label="Previous categories"
            >
              <FiChevronLeft className="text-sm lg:text-lg text-gray-500" />
            </motion.button>
          )}

          <div
            ref={carouselRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth swipe-indicator px-4"
            style={{ scrollPaddingLeft: "1rem", scrollPaddingRight: "1rem" }}
            onScroll={checkScrollButtons}
          >
            {isLoading
              ? // Loading skeletons
                Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="shrink-0 snap-start">
                    <div className="group relative flex flex-col items-center">
                      <Skeleton className="h-20 w-20 sm:h-28 sm:w-28 lg:h-32 lg:w-32 rounded-full" />
                      <Skeleton className="mt-2 sm:mt-4 h-4 sm:h-6 w-16 sm:w-24 lg:w-32" />
                    </div>
                  </div>
                ))
              : categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`#${generateCategoryAnchor(category.slug)}`}
                    className="shrink-0 snap-start w-20 sm:w-28 lg:w-32"
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById(
                        generateCategoryAnchor(category.slug),
                      );
                      if (element) {
                        element.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="group relative flex flex-col items-center"
                    >
                      <div className="relative h-20 w-20 sm:h-28 sm:w-28 lg:h-32 lg:w-32 overflow-hidden rounded-full ring-2 sm:ring-4 ring-white shadow-md sm:shadow-lg transition-all duration-300 group-hover:ring-primary/20 group-hover:shadow-xl">
                        <Image
                          src={getCategoryImageUrl(category.image_url)}
                          alt={category.name}
                          width={80}
                          height={80}
                          className="h-full w-full object-cover transition-all duration-300 group-hover:scale-110 group-hover:brightness-110"
                          loading="lazy"
                          unoptimized
                        />
                      </div>
                      <h3 className="mt-2 sm:mt-4 text-center font-normal text-xs sm:text-base lg:text-lg text-gray-900 transition-colors duration-300 group-hover:text-primary leading-tight">
                        {category.name}
                      </h3>
                    </motion.div>
                  </Link>
                ))}
          </div>

          {/* Desktop arrows only */}
          {canScrollRight && !isLoading && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => scroll("right")}
              className="absolute -right-3 top-1/2 z-20 hidden sm:flex h-10 w-10 lg:h-12 lg:w-12 -translate-y-1/2 items-center justify-center rounded-full bg-gray-50/90 backdrop-blur-sm shadow-sm border border-gray-200/40 transition-all hover:scale-105 hover:shadow-md hover:bg-gray-100/90 hover:border-gray-300/60 active:scale-95 group-hover:opacity-100 opacity-70"
              aria-label="Next categories"
            >
              <FiChevronRight className="text-sm lg:text-lg text-gray-500" />
            </motion.button>
          )}

          {/* Mobile: Subtle scroll indicator - centered relative to category images */}
          <div className="sm:hidden">
            {canScrollRight && !isLoading && (
              <div className="absolute top-1/2 right-4 -translate-y-1/2 flex items-center gap-1 text-gray-400">
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                >
                  <div className="flex gap-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
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

export default CategoryCarousel;
