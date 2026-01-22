import { NextRequest, NextResponse } from "next/server";
import {
  optimizeNewProduct,
  handleProductUpdate,
  handleProductWebhook,
} from "@/lib/dynamic-optimization";

/**
 * API Route for automatic product optimization
 *
 * This endpoint can be called when:
 * 1. A new product is uploaded
 * 2. An existing product is updated
 * 3. From webhooks or admin actions
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, productId, updates, webhook } = body;

    // Handle webhook events (recommended approach)
    if (webhook) {
      const result = await handleProductWebhook(webhook);
      return NextResponse.json({
        success: true,
        message: `Webhook processed: ${webhook.eventType}`,
        result,
      });
    }

    // Handle direct optimization requests
    switch (action) {
      case "optimize-new":
        if (!productId) {
          return NextResponse.json(
            { error: "productId is required for optimize-new action" },
            { status: 400 },
          );
        }

        const optimizedProduct = await optimizeNewProduct(productId);
        return NextResponse.json({
          success: true,
          message: `Product ${productId} optimized successfully`,
          product: optimizedProduct,
        });

      case "update":
        if (!productId || !updates) {
          return NextResponse.json(
            { error: "productId and updates are required for update action" },
            { status: 400 },
          );
        }

        const updatedProduct = await handleProductUpdate(productId, updates);
        return NextResponse.json({
          success: true,
          message: `Product ${productId} updated successfully`,
          product: updatedProduct,
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Product optimization failed:", error);

    return NextResponse.json(
      {
        error: "Product optimization failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * GET endpoint to check optimization status
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json(
      { error: "productId query parameter is required" },
      { status: 400 },
    );
  }

  try {
    // Check if product is in the optimized manifest
    const manifestResponse = await fetch(
      `${request.nextUrl.origin}/api/static-data/manifest`,
    );

    if (!manifestResponse.ok) {
      throw new Error("Failed to fetch manifest");
    }

    const manifest = await manifestResponse.json();
    const isOptimized = !!manifest.products[productId];

    return NextResponse.json({
      productId,
      isOptimized,
      lastOptimized:
        manifest.products[productId]?.metadata?.optimizedAt || null,
      lastModified:
        manifest.products[productId]?.metadata?.lastModified || null,
    });
  } catch (error) {
    console.error("Failed to check optimization status:", error);

    return NextResponse.json(
      {
        error: "Failed to check optimization status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
