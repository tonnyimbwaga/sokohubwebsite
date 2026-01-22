"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";

import ProductCarousel from "@/components/ProductCarousel";
import SectionHeading from "@/components/SectionHeading";
import type { Product } from "@/data/types";

const SECTION_CONTENT = {
  title: "New Arrivals",
  description: "Check out our latest toys and games",
} as const;

const fetchNewArrivals = async (): Promise<Product[]> => {
  const res = await fetch("/api/products/new-arrivals", {
    cache: "force-cache",
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(payload?.error || "Unable to load new arrivals at this time.");
  }

  return (await res.json()) as Product[];
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
