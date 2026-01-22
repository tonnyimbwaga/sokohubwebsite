"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

import ProductCarousel from "@/components/ProductCarousel";
import SectionHeading from "@/components/SectionHeading";
import type { Product } from "@/data/types";
import { getProductImageUrl } from "@/utils/product-images";

const SECTION_CONTENT = {
  title: "New Arrivals",
  description: "Check out our latest toys and games",
} as const;

interface DatabaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  status: string;
  is_featured: boolean;
  sku: string;
  slug: string;
  category_id: string;
  images: Array<{
    web_image_url?: string;
    feed_image_url?: string;
    url?: string;
    alt?: string;
  }>;
  category_name?: string;
  category_slug?: string;
}

const fetchNewArrivals = async (): Promise<Product[]> => {
  // Use direct query for reliability
  const { error: tableError } = await supabase
    .from("products")
    .select("id")
    .limit(1);

  if (tableError?.message?.includes("does not exist")) {
    throw new Error("Store is being set up. Please check back soon.");
  }

  const { data: rawData, error: fetchError } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      description,
      price,
      stock,
      status,
      is_featured,
      sku,
      slug,
      category_id,
      images,
      categories:categories(name, slug)
    `,
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(12);

  if (fetchError) {
    throw new Error("Unable to load new arrivals at this time.");
  }

  if (!rawData || rawData.length === 0) {
    return [];
  }

  const fetchedProducts = rawData as unknown as DatabaseProduct[];
  const productsWithImages = fetchedProducts.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    salePrice: undefined,
    images:
      Array.isArray(product.images) && product.images.length > 0
        ? [{ url: getProductImageUrl(product.images[0]) }] // Only process first image
        : [{ url: "/images/placeholder.png" }],
    sku: product.sku,
    slug: product.slug || product.sku.toLowerCase(),
    category: (product as any).categories?.name || "",
    categorySlug: (product as any).categories?.slug || "",
    ageRange: "",
    inStock: product.stock > 0,
    isFeatured: product.is_featured || false,
    rating: 5,
    reviews: 0,
    sizes: [
      { value: "0-2", label: "0-2 years", price: product.price, inStock: true },
      { value: "2-4", label: "2-4 years", price: product.price, inStock: true },
      { value: "4-6", label: "4-6 years", price: product.price, inStock: true },
      { value: "6+", label: "6+ years", price: product.price, inStock: true },
    ],
  })) as Product[];
  return productsWithImages;
};

const SectionNewArrivals = () => {
  const {
    data: products = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["new-arrivals"],
    queryFn: fetchNewArrivals,
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
          <div className="text-center text-gray-500 py-8">
            Loading new arrivals...
          </div>
        )}
        {error && (
          <div className="text-center text-red-500 py-8">
            Error: {error.message}
          </div>
        )}
        {!isLoading && !error && products.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No new arrivals available at the moment.
          </div>
        )}
        {!isLoading && !error && products.length > 0 && (
          <ProductCarousel products={products} priorityCount={6} />
        )}
      </div>
    </>
  );
};

export default SectionNewArrivals;
