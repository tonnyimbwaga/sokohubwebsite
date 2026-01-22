import { NextRequest, NextResponse } from "next/server";
import { generateStaticDataFiles } from "@/lib/static-data-layer";

// This route serves the pre-generated static data manifest
// It's cached aggressively by Cloudflare CDN

export async function GET(request: NextRequest) {
  try {
    // Import the function to generate manifest from database
    const { generateManifestFromDatabase } = await import(
      "@/lib/static-data-layer"
    );

    // Generate fresh manifest from database
    const manifest = await generateManifestFromDatabase();

    // Create response with aggressive caching
    const response = NextResponse.json(manifest);

    // Set cache headers for CDN
    response.headers.set(
      "Cache-Control",
      "public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200",
    );
    response.headers.set("CDN-Cache-Control", "public, max-age=86400");
    response.headers.set("Vercel-CDN-Cache-Control", "public, max-age=86400");

    // Add ETag for better caching
    const etag = `"manifest-${Date.now()}"`;
    response.headers.set("ETag", etag);

    return response;
  } catch (error) {
    console.error("Failed to generate static data manifest:", error);

    return NextResponse.json(
      { error: "Failed to generate manifest" },
      { status: 500 },
    );
  }
}

// Enable edge runtime for faster response times

// Revalidate every hour in production
export const revalidate = 3600;
