"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";

import ProductCarousel from "@/components/ProductCarousel";
import SectionHeading from "@/components/SectionHeading";
import type { Product } from "@/data/types";

const SECTION_CONTENT = {
  title: "Best Deals",
  description: "Save big on these amazing items",
} as const;

const fetchDeals = async () => {
  const res = await fetch("/api/products/best-deals", {
    cache: "force-cache",
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(payload?.error || "Unable to load deals at this time.");
  }

  return (await res.json()) as Product[];
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
