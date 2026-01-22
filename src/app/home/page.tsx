import React from "react";
import StaticHomepageLayout from "./StaticHomepageLayout";

/**
 * Blazing Fast Homepage
 *
 * This page uses pre-generated static data for maximum performance.
 * Perfect for Cloudflare edge caching and instant loading.
 */

const HomePage = () => {
  return <StaticHomepageLayout />;
};

// Aggressive caching for maximum performance
export const revalidate = 3600; // Revalidate every hour
export const dynamic = "force-static"; // Force static generation
export const fetchCache = "force-cache"; // Aggressive caching

export default HomePage;
