import { NextResponse } from "next/server";

/**
 * Static Homepage Data API
 *
 * This API route redirects to the static JSON file served directly by Cloudflare CDN.
 * This approach is Edge-compatible and eliminates the need for Node.js fs/path APIs.
 *
 * For best performance, clients should fetch /data/homepage.json directly,
 * but this route exists for backward compatibility.
 */

export async function GET(request: Request) {
  try {
    // Get the origin from the request URL for building the redirect
    const url = new URL(request.url);
    const staticDataUrl = `${url.origin}/data/homepage.json`;

    // Fetch the static data from the public directory (served by CDN)
    const response = await fetch(staticDataUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch static data: ${response.status}`);
    }

    const data = await response.json();

    // Return with aggressive caching headers
    return NextResponse.json(data, {
      status: 200,
      headers: {
        // Cache for 1 hour in browser, 1 day on CDN
        "Cache-Control":
          "public, s-maxage=86400, max-age=3600, stale-while-revalidate=604800",
        // Cloudflare specific headers
        "CF-Cache-Tag": "homepage-static",
        // CORS headers for CDN
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Max-Age": "86400",
      },
    });
  } catch (error) {
    console.error("Failed to serve static homepage data:", error);

    // Fallback to empty data structure
    const fallbackData = {
      categories: [],
      featuredProducts: [],
      dealProducts: [],
      trendingProducts: [],
      lastUpdated: new Date().toISOString(),
      version: "2.0",
      error: "Static data not available",
    };

    return NextResponse.json(fallbackData, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=60", // Short cache for fallback
      },
    });
  }
}
