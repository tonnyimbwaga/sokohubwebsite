import { NextRequest, NextResponse } from "next/server";
import { onProductUpdate } from "@/lib/cache-invalidation";

/**
 * Cache Invalidation API Route
 *
 * This endpoint handles comprehensive cache invalidation when products are updated.
 * Optimized for Cloudflare Workers environment.
 */

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Cache invalidation API called");

    const body = await request.json();
    const { productId, action } = body;

    console.log("📦 Request body:", { productId, action });

    if (!productId || !action) {
      console.error("❌ Missing required parameters:", { productId, action });
      return NextResponse.json(
        { error: "productId and action are required" },
        { status: 400 },
      );
    }

    console.log(
      `🚀 Cache invalidation triggered for product ${productId} (${action})`,
    );

    // Trigger cache invalidation
    const result = await onProductUpdate(productId, action);

    console.log("📊 Cache invalidation result:", result);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Cache invalidation completed successfully",
        operations: result.operations,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.error("❌ Cache invalidation failed:", result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          operations: result.operations,
          message: "Cache invalidation failed",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("❌ Cache invalidation API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Cache invalidation failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
