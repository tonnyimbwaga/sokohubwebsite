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

// Dynamically import sections for better performance
const SectionNewArrivals = dynamic(() => import("./SectionNewArrivals"), {
  loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded-lg"></div>,
  ssr: true,
});

const SectionBestDeals = dynamic(() => import("./SectionBestDeals"), {
  loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded-lg"></div>,
  ssr: true,
});

// Category sections are server-side rendered as the primary content
import HomepageCategorySections from "./HomepageCategorySections";

// Loading skeleton for the entire page
const PageSkeleton = () => (
  <div className="space-y-16 animate-pulse">
    <div className="h-64 bg-gray-200 rounded-lg"></div>
    <div className="h-96 bg-gray-100 rounded-lg"></div>
    <div className="h-96 bg-gray-100 rounded-lg"></div>
  </div>
);

export default function StaticHomepageLayout() {
  return (
    <div className="min-h-screen">
      {/* 1. Hero Section - Always render immediately */}
      <div className="my-7">
        <SectionHeader />
      </div>

      {/* 2. Main Content Order: New Arrivals -> Best Deals -> Categories */}
      <div className="space-y-16 mt-8">

        {/* New Arrivals */}
        <Suspense fallback={<div className="h-64 bg-gray-50 rounded-lg animate-pulse"></div>}>
          <SectionNewArrivals />
        </Suspense>

        {/* Best Deals */}
        <Suspense fallback={<div className="h-64 bg-gray-50 rounded-lg animate-pulse"></div>}>
          <SectionBestDeals />
        </Suspense>

        {/* Dynamic Category Sections - The source of truth for categories */}
        <Suspense fallback={<PageSkeleton />}>
          <HomepageCategorySections />
        </Suspense>
      </div>

      {/* Static Content - Optional legacy landing components if any */}
      <div className="mt-16">
        <Suspense fallback={null}>
          <StaticHomepage />
        </Suspense>
      </div>

      {/* Performance indicator (development only) */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 bg-yellow-400 text-black px-3 py-2 rounded-lg text-sm font-bold shadow-lg z-50">
          🚀 SOKOHUB DYNAMIC MODE
        </div>
      )}
    </div>
  );
}

{/* Performance indicator (development only) */ }
{
  process.env.NODE_ENV === "development" && (
    <div className="fixed bottom-4 right-4 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg">
      ⚡ Blazing Fast Mode
    </div>
  )
}
    </div >
  );
}
