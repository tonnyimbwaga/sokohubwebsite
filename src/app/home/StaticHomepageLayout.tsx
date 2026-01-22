"use client";

/**
 * Blazing Fast Static Homepage Layout
 *
 * This component provides the fastest possible homepage experience by:
 * 1. Loading pre-generated static data (1-5ms)
 * 2. Aggressive caching with Cloudflare edge
 * 3. Optimized rendering with minimal re-renders
 * 4. Progressive enhancement for better UX
 */

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import StaticHomepage from "./StaticHomepage";
import SectionHeader from "./SectionHeader";

// Dynamically import heavy components for better performance
const SectionNewArrivals = dynamic(() => import("./SectionNewArrivals"), {
  loading: () => (
    <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
  ),
  ssr: false, // Skip SSR for this component to prioritize static content
});

const SectionTrending = dynamic(() => import("./SectionTrending"), {
  loading: () => (
    <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
  ),
  ssr: false,
});

const SectionBestDeals = dynamic(() => import("./SectionBestDeals"), {
  loading: () => (
    <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
  ),
  ssr: false,
});

// Loading skeleton for the entire page
const PageSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    {/* Header skeleton */}
    <div className="h-64 bg-gray-200 rounded-lg"></div>

    {/* Category sections skeleton */}
    {[1, 2, 3].map((i) => (
      <div key={i} className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-64"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((j) => (
            <div key={j} className="aspect-square bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default function StaticHomepageLayout() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Always render immediately */}
      <div className="my-7">
        <SectionHeader />
      </div>

      {/* Static Content - Loads blazing fast from pre-generated data */}
      <Suspense fallback={<PageSkeleton />}>
        <StaticHomepage />
      </Suspense>

      {/* Progressive Enhancement - Load additional dynamic content */}
      <div className="space-y-16 mt-16">
        {/* New Arrivals - Loads after static content */}
        <Suspense
          fallback={
            <div className="h-64 bg-gray-50 rounded-lg animate-pulse"></div>
          }
        >
          <SectionNewArrivals />
        </Suspense>

        {/* Trending - Loads after new arrivals */}
        <Suspense
          fallback={
            <div className="h-64 bg-gray-50 rounded-lg animate-pulse"></div>
          }
        >
          <SectionTrending />
        </Suspense>

        {/* Best Deals - Loads last */}
        <Suspense
          fallback={
            <div className="h-64 bg-gray-50 rounded-lg animate-pulse"></div>
          }
        >
          <SectionBestDeals />
        </Suspense>
      </div>

      {/* Performance indicator (development only) */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg">
          ⚡ Blazing Fast Mode
        </div>
      )}
    </div>
  );
}
