import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * API Route for ISR (Incremental Static Regeneration) revalidation
 *
 * Allows for dynamic revalidation of cached pages when content changes
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, tag, tags, secret } = body;

    // Verify the secret token (optional but recommended for security)
    if (secret && secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { error: "Invalid secret token" },
        { status: 401 },
      );
    }

    // Revalidate by path
    if (path) {
      revalidatePath(path);
      console.log(`✅ Revalidated path: ${path}`);

      return NextResponse.json({
        success: true,
        message: `Path ${path} revalidated successfully`,
        revalidated: true,
        now: Date.now(),
      });
    }

    // Revalidate by tag (single tag)
    if (tag) {
      // @ts-ignore - revalidateTag requires 2 arguments in Next.js 16
      revalidateTag(tag, "max");
      console.log(`✅ Revalidated tag: ${tag}`);

      return NextResponse.json({
        success: true,
        message: `Tag ${tag} revalidated successfully`,
        revalidated: true,
        now: Date.now(),
      });
    }

    // Revalidate by tags (multiple tags)
    if (tags && Array.isArray(tags)) {
      tags.forEach((tagName) => {
        // @ts-ignore - revalidateTag requires 2 arguments in Next.js 16
        revalidateTag(tagName, "max");
        console.log(`✅ Revalidated tag: ${tagName}`);
      });

      return NextResponse.json({
        success: true,
        message: `Tags ${tags.join(", ")} revalidated successfully`,
        revalidated: true,
        now: Date.now(),
      });
    }

    return NextResponse.json(
      { error: "Either path, tag, or tags must be provided" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Revalidation failed:", error);

    return NextResponse.json(
      {
        error: "Revalidation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * GET endpoint for manual revalidation via URL
 * Example: /api/revalidate?path=/products/some-product&secret=your-secret
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  const tag = searchParams.get("tag");
  const secret = searchParams.get("secret");

  // Verify the secret token (optional but recommended for security)
  if (secret && secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { error: "Invalid secret token" },
      { status: 401 },
    );
  }

  try {
    // Revalidate by path
    if (path) {
      revalidatePath(path);
      console.log(`✅ Revalidated path: ${path}`);

      return NextResponse.json({
        success: true,
        message: `Path ${path} revalidated successfully`,
        revalidated: true,
        now: Date.now(),
      });
    }

    // Revalidate by tag
    if (tag) {
      // @ts-ignore - revalidateTag requires 2 arguments in Next.js 16
      revalidateTag(tag, "max");
      console.log(`✅ Revalidated tag: ${tag}`);

      return NextResponse.json({
        success: true,
        message: `Tag ${tag} revalidated successfully`,
        revalidated: true,
        now: Date.now(),
      });
    }

    return NextResponse.json(
      { error: "Either path or tag query parameter must be provided" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Revalidation failed:", error);

    return NextResponse.json(
      {
        error: "Revalidation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
