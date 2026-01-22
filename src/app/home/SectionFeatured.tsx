"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

import ProductCarousel from "@/components/ProductCarousel";
import SectionHeading from "@/components/SectionHeading";
import type { Product } from "@/data/types";
import { getProductImageUrl } from "@/utils/product-images";
import { getStaticFeaturedProducts } from "@/lib/static-data-layer";

const SECTION_CONTENT = {
  title: "Featured Products",
  description: "Handpicked selections just for you",
} as const;

interface DatabaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number | null;
  stock: number;
  status: string;
  is_featured: boolean;
  featured_order: number | null;
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

const fetchFeatured = async (): Promise<Product[]> => {
  try {
    // Try static data first (blazing fast!)
    const staticProducts = await getStaticFeaturedProducts(12);

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
        isFeatured: true,
        rating: 5,
        reviews: 0,
        index: index + 1,
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

  // Query featured products
  const { data: rawData, error: fetchError } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      description,
      price,
      compare_at_price,
      stock,
      status,
      is_featured,
      featured_order,
      sku,
      slug,
      category_id,
      images,
      categories:categories(name, slug)
    `,
    )
    .eq("status", "active")
    .eq("is_featured", true)
    .order("featured_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(12);

  if (fetchError) {
    throw new Error("Unable to load featured products at this time.");
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
    salePrice: product.compare_at_price || undefined,
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
  })) as Product[];
  return productsWithImages;
};

const SectionFeatured = () => {
  const {
    data: products = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["featured-products"],
    queryFn: fetchFeatured,
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
    <div className="container">
      <SectionHeading
        title={SECTION_CONTENT.title}
        description={SECTION_CONTENT.description}
      />
      <div className="mt-8">
        {isLoading && (
          <div className="text-center text-gray-500">
            Loading featured products...
          </div>
        )}
        {error && (
          <div className="text-center text-red-500">Error: {error.message}</div>
        )}
        {!isLoading && !error && products.length === 0 && (
          <div className="text-center text-gray-500">
            No featured products available at the moment.
          </div>
        )}
        {!isLoading && !error && products.length > 0 && (
          <ProductCarousel products={products} priorityCount={6} />
        )}
      </div>
    </div>
  );
};

export default SectionFeatured;
