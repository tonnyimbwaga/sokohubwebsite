"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { RiSearch2Line } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useCart } from "@/hooks/useCart";
import { getProductImageUrl } from "@/utils/product-images";

import { siteConfig } from "@/config/site";
import { formatPrice } from "@/utils/format";

const CartSlideOver = dynamic(() => import("@/components/Cart/CartSlideOver"), {
  ssr: false,
});

import MenuBar from "./MenuBar";

import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";

const SEARCH_STALE_TIME = 60 * 60 * 1000; // 1 hour

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[] | { url: string }[];
  slug: string;
}

const fetchProducts = async (q: string, supabase: any) => {
  if (!q.trim()) return [];
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, images, slug")
    .ilike("name", `%${q}%`)
    .limit(8);
  if (error) {
    console.error("Supabase search error", error, { query: q });
    return [];
  }
  return data || [];
};

const MainNav = () => {
  const { itemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(handler);
  }, [search]);

  // React Query for search
  const { data: results = [], isLoading: loading } = useQuery<
    Product[],
    Error,
    Product[],
    string[]
  >({
    queryKey: ["search-products", debouncedSearch],
    queryFn: () => fetchProducts(debouncedSearch, supabase),
    enabled: !!debouncedSearch,
    staleTime: SEARCH_STALE_TIME,
    placeholderData: (previousData: Product[] | undefined) => previousData,
  });



  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setDebouncedSearch(search);
    } else if (e.key === "Escape") {
      setShowSearch(false);
    }
  };

  useEffect(() => {
    if (showSearch) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [showSearch]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowSearch(false);
    }
  };

  return (
    <>
      <div className="bg-primary py-2.5 px-4 text-center overflow-hidden whitespace-nowrap border-b border-primary-dark/10">
        <p className="text-sm font-bold text-slate-900 tracking-wide animate-pulse inline-flex items-center gap-2">
          <span className="bg-slate-900 rounded-full px-2.5 py-0.5 text-[10px] uppercase text-white font-black">Flash</span>
          ⚡ Cash on Delivery / Payment after delivery available in Nairobi! ⚡
        </p>
      </div>
      <div className="main-layout flex items-center justify-between py-4 sm:py-6 lg:py-8 mx-auto">
        {/* Left: Mobile menu */}
        <div className="flex-1 lg:hidden">
          <MenuBar />
        </div>

        {/* Center: Title and Search Bar */}
        <div className="flex flex-1 flex-col lg:flex-row items-center justify-center gap-1 sm:gap-2">
          <Link
            href="/"
            className="text-lg sm:text-xl lg:text-2xl font-bold text-primary tracking-normal text-center lg:text-left whitespace-nowrap"
          >
            <span className="tracking-tight sm:tracking-normal">
              {siteConfig.name}
            </span>
          </Link>
          <div className="hidden lg:block w-full max-w-lg px-4">
            <div className="relative">
              <input
                ref={inputRef}
                value={search}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSearch(true)}
                placeholder="Search for toys..."
                className="w-full rounded-full bg-gray-50 border border-gray-200 py-2 pl-5 pr-12 text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/30 shadow-sm transition-all duration-200"
              />
              <RiSearch2Line className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Right: Cart and Mobile Search */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            className="rounded-full p-2 hover:bg-gray-100 lg:hidden touch-manipulation"
            aria-label="Search"
            onClick={() => setShowSearch(true)}
          >
            <RiSearch2Line className="text-lg sm:text-xl" />
          </button>

          <motion.button
            type="button"
            className="relative rounded-full p-2 hover:bg-gray-100 touch-manipulation"
            onClick={() => setIsCartOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaShoppingCart className="text-lg sm:text-xl" />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Keep search modal mounted, just toggle visibility */}
      <div
        style={{ display: showSearch ? "flex" : "none" }}
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm px-2 flex items-center justify-center"
        onClick={handleOverlayClick} // Close modal on overlay click
      >
        <div
          className="relative w-full max-w-sm sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl rounded-2xl sm:rounded-3xl bg-white p-0 shadow-xl flex flex-col items-center justify-center"
          style={{
            minHeight: "min(360px, 80vh)",
            maxHeight: "90vh",
            boxShadow:
              "0 4px 32px 0 rgba(80, 80, 120, 0.10), 0 1.5px 8px 0 rgba(80, 80, 120, 0.08)",
          }}
          onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
        >
          <form className="w-full flex flex-col items-center justify-center px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6 lg:pt-8 pb-2 sm:pb-3">
            <div className="relative w-full max-w-xl">
              <input
                ref={inputRef}
                value={search}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Search for toys..."
                className="w-full rounded-xl sm:rounded-2xl border border-transparent px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/60 shadow-sm hover:shadow transition-all duration-200 placeholder-gray-400 text-gray-800"
                autoFocus
                style={{
                  boxShadow:
                    "0 1px 3px 0 rgba(0, 0, 0, 0.03), 0 1px 2px -1px rgba(0, 0, 0, 0.03)",
                }} // More subtle shadow
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary rounded-full p-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 touch-manipulation"
                onClick={() => setShowSearch(false)}
                aria-label="Close search"
                tabIndex={0}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </form>

          {/* Subtle Separator Line */}
          <div className="w-full max-w-5xl px-3 sm:px-4 lg:px-6">
            <hr className="h-px border-0 bg-gray-100 my-1" />
          </div>

          <div
            className="mt-1 flex-1 w-full max-w-5xl overflow-y-auto rounded-b-2xl sm:rounded-b-3xl bg-white scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
            style={{ minHeight: "180px", maxHeight: "calc(90vh - 140px)" }} // Adjusted for mobile
          >
            {loading ? (
              <div className="p-4 sm:p-8 text-center text-gray-500 text-base sm:text-lg">
                Searching...
              </div>
            ) : results.length === 0 && search ? (
              <div className="p-4 sm:p-8 text-center text-gray-500 text-base sm:text-lg">
                No products found
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 p-2 sm:p-4">
                {results.map((product: Product) => {
                  // Log slug for debugging 404s
                  if (process.env.NODE_ENV === "development") {
                    console.log(
                      "Search result product slug:",
                      product.slug,
                      "for product:",
                      product.name,
                    );
                  }
                  const firstImage =
                    Array.isArray(product.images) && product.images.length > 0
                      ? product.images[0]
                      : null;
                  const imageUrl = getProductImageUrl(firstImage);
                  return (
                    <a
                      key={product.id}
                      href={product.slug ? `/products/${product.slug}` : "#"}
                      className="group flex flex-col items-stretch rounded-lg sm:rounded-xl border border-transparent bg-white shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/60"
                      style={{ minHeight: "100px" }}
                      tabIndex={0}
                      onMouseDown={(e) => {
                        if (product.slug) {
                          e.preventDefault();
                          setShowSearch(false);
                          setSearch("");
                          setDebouncedSearch("");
                          queryClient.removeQueries({
                            queryKey: ["search-products"],
                          });
                          router.push(`/products/${product.slug}`);
                        }
                      }}
                    >
                      <div className="relative w-full aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                        {imageUrl &&
                          imageUrl.trim() &&
                          !imageUrl.includes("placeholder") ? (
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-lg sm:rounded-t-xl"
                            loading="lazy"
                            placeholder="blur"
                            blurDataURL={getProductImageUrl(null)} // Use placeholder from utility
                            onError={(e) =>
                              (e.currentTarget.src = getProductImageUrl(null))
                            }
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-xs sm:text-sm">
                              No Image
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between p-2 sm:p-4">
                        <div className="font-semibold text-gray-800 text-xs sm:text-base truncate group-hover:text-primary transition-colors duration-200 leading-tight">
                          {product.name}
                        </div>
                        <div className="mt-1 text-primary font-bold text-sm sm:text-lg">
                          {formatPrice(product.price)}
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <CartSlideOver isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default MainNav;
