"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { getStaticTrendingProducts } from "@/lib/static-data-layer";

import ProductCarousel from "@/components/ProductCarousel";
import SectionHeading from "@/components/SectionHeading";
import type { Product } from "@/data/types";
import { getProductImageUrl } from "@/utils/product-images";

const SECTION_CONTENT = {
  title: "Top Selling Products",
  description: "Discover the most popular items this season",
} as const;

interface DatabaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  status: string;
  is_featured: boolean;
  is_trending: boolean;
  trending_order: number | null;
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

const fetchTrending = async (): Promise<Product[]> => {
  try {
    // Try static data first (blazing fast!)
    const staticProducts = await getStaticTrendingProducts(12);

    if (staticProducts && staticProducts.length > 0) {
      // Convert static products to Product format
      return staticProducts.map((product, index) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        salePrice:
          product.compareAtPrice && product.price < product.compareAtPrice
            ? product.price
            : undefined,
        images: [{ url: product.images.primary.mobile }], // Use static image URLs
        sku: product.id, // Use ID as fallback SKU
        slug: product.slug,
        category: product.category,
        categorySlug: product.categorySlug,
        ageRange: "",
        inStock: true, // Assume in stock for static data
        isFeatured: false,
        rating: 5,
        reviews: 0,
        index: index + 1,
        sizes: [
          {
            value: "0-2",
            label: "0-2 years",
            price: product.price,
            inStock: true,
          },
          {
            value: "2-4",
            label: "2-4 years",
            price: product.price,
            inStock: true,
          },
          {
            value: "4-6",
            label: "4-6 years",
            price: product.price,
            inStock: true,
          },
          {
            value: "6+",
            label: "6+ years",
            price: product.price,
            inStock: true,
          },
        ],
      })) as Product[];
    }
  } catch (error) {
    console.log("Static data not available, falling back to database...");
  }

  // Fallback to database query if static data fails
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
      is_trending,
      trending_order,
      sku,
      slug,
      category_id,
      images,
      categories:categories!products_category_id_fkey(name, slug)
    `,
    )
    .eq("status", "active")
    .eq("is_trending", true)
    .order("trending_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(12);

  if (fetchError) {
    throw new Error("Unable to load trending products at this time.");
  }

  if (!rawData || rawData.length === 0) {
    return [];
  }

  const fetchedProducts = rawData as unknown as DatabaseProduct[];
  const productsWithImages = fetchedProducts.map((product, index) => ({
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
    index: index + 1,
    sizes: [
      { value: "0-2", label: "0-2 years", price: product.price, inStock: true },
      { value: "2-4", label: "2-4 years", price: product.price, inStock: true },
      { value: "4-6", label: "4-6 years", price: product.price, inStock: true },
      { value: "6+", label: "6+ years", price: product.price, inStock: true },
    ],
  })) as Product[];
  return productsWithImages;
};

const SectionTrending = () => {
  const {
    data: products = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["trending-products"],
    queryFn: fetchTrending,
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
    <div id="top-selling" className="container scroll-mt-20">
      <SectionHeading
        title={
          <>
            <span
              className="inline-block align-middle animate-pulse mr-2"
              style={{ verticalAlign: "middle" }}
            >
              <svg
                width="28"
                height="24"
                viewBox="0 0 28 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14 3C14 3 10 6 10 9.5C10 11.5 11 13 14 13C17 13 18 11.5 18 9.5C18 6 14 3 14 3Z"
                  fill="#FDF000"
                />
                <path
                  d="M14 3C14 3 18 6 18 9.5C18 11.5 17 13 14 13C11 13 10 11.5 10 9.5C10 6 14 3 14 3Z"
                  fill="#FEEE00"
                />
                <path
                  d="M14 5C14 5 8 9 8 13C8 16.5 11 19 14 19C17 19 20 16.5 20 13C20 9 14 5 14 5Z"
                  fill="#FDF000"
                />
                <path
                  d="M14 5C20 9 20 13 20 13C20 16.5 17 19 14 19C17 19 20 16.5 20 13C20 9 14 5 14 5Z"
                  fill="#FEEE00"
                  fillOpacity="0.8"
                />
              </svg>
            </span>
            {SECTION_CONTENT.title}
          </>
        }
        description={SECTION_CONTENT.description}
      />
      <div className="mt-8">
        {isLoading && (
          <div className="text-center text-gray-500">
            Loading trending products...
          </div>
        )}
        {error && (
          <div className="text-center text-red-500">Error: {error.message}</div>
        )}
        {!isLoading && !error && products.length === 0 && (
          <div className="text-center text-gray-500">
            No trending products available at the moment.
          </div>
        )}
        {!isLoading && !error && products.length > 0 && (
          <ProductCarousel
            products={products}
            showIndex={true}
            priorityCount={6}
          />
        )}
      </div>
    </div>
  );
};

export default SectionTrending;
