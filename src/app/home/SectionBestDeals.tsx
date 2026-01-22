"use client";

import React from "react";
import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

import ProductCarousel from "@/components/ProductCarousel";
import SectionHeading from "@/components/SectionHeading";
import type { Product } from "@/data/types";
import { getProductImageUrl } from "@/utils/product-images";

const SECTION_CONTENT = {
  title: "Best Deals",
  description: "Save big on these amazing items",
} as const;

interface DatabaseProduct {
  id: string;
  name: string;
  price: number;
  compare_at_price?: number | null;
  stock: number;
  sku: string;
  images: Array<{
    web_image_url?: string;
    feed_image_url?: string;
    url?: string;
    alt?: string;
  }>;
  categories: {
    name: string;
    slug: string;
  } | null;
  slug: string;
}

// Optimized fetcher with minimal data transfer
const fetchDeals = async () => {
  try {
    // Use direct query for reliability
    const { data: rawData, error: fetchError } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        price,
        compare_at_price,
        stock,
        sku,
        slug,
        images,
        categories:categories(name, slug)
      `,
      )
      .eq("status", "active")
      .not("compare_at_price", "is", null)
      .gt("stock", 0)
      .order("deal_order", { ascending: true })
      .limit(12);

    if (fetchError) throw new Error("Unable to load deals at this time.");

    if (!rawData || rawData.length === 0) {
      return [];
    }

    // Process data efficiently - sort by discount percentage first
    const productsWithImages = (rawData as any[])
      .filter(
        (product: any) =>
          product.compare_at_price && product.compare_at_price > product.price,
      )
      .sort((a: any, b: any) => {
        // Sort by largest discount percentage first
        const discountA =
          ((a.compare_at_price - a.price) / a.compare_at_price) * 100;
        const discountB =
          ((b.compare_at_price - b.price) / b.compare_at_price) * 100;
        return discountB - discountA;
      })
      .map((product: any, index: number) => {
        const discountPercentage = product.compare_at_price
          ? ((product.compare_at_price - product.price) /
              product.compare_at_price) *
            100
          : 0;

        // Optimize image processing - handle JSONB image objects
        const validImages =
          Array.isArray(product.images) && product.images.length > 0
            ? [getProductImageUrl(product.images[0])].filter(Boolean) // Only process first image
            : [];

        return {
          id: product.id,
          name: product.name,
          description: "", // Don't load description for performance
          price: product.compare_at_price || product.price,
          salePrice: product.price,
          images:
            validImages.length > 0
              ? [{ url: validImages[0] }]
              : [{ url: "/images/placeholder.png" }],
          sku: product.sku || `TOT-${product.id.slice(0, 8)}`,
          category: product.categories?.name || "",
          categorySlug: "",
          ageRange: "",
          inStock: product.stock > 0,
          isFeatured: false, // Don't need this for deals
          rating: 5,
          reviews: 0,
          index: index + 1,
          slug: product.slug,
          // Minimal sizes array
          sizes: [
            {
              value: "default",
              label: "Standard",
              price: product.price,
              inStock: true,
            },
          ],
        };
      }) as Product[];

    return productsWithImages;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to load deals",
    );
  }
};

const SectionBestDeals = () => {
  const {
    data: products = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["best-deals"],
    queryFn: fetchDeals,
    staleTime: 60 * 60 * 1000, // 1 hour - EMERGENCY: prevent excessive requests
    gcTime: 4 * 60 * 60 * 1000, // 4 hours
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });

  return (
    <>
      <SectionHeading
        title={SECTION_CONTENT.title}
        description={SECTION_CONTENT.description}
      />
      <div className="mt-8">
        {isLoading && (
          <div className="text-center text-gray-500 py-8">Loading deals...</div>
        )}
        {error && (
          <div className="text-center text-red-500 py-8">
            Error: {error.message}
          </div>
        )}
        {!isLoading && !error && products.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No deals available at the moment.
          </div>
        )}
        {!isLoading && !error && products.length > 0 && (
          <ProductCarousel products={products} priorityCount={6} />
        )}
      </div>
    </>
  );
};

export default SectionBestDeals;
