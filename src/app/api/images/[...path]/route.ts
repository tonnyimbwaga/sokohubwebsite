import { type NextRequest } from "next/server";

export const revalidate = 31536000; // 1 year

// IMPORTANT: We cannot use the Supabase client here that uses the service_role
// key because that would expose it to the client. This route is public.
// OpenNext does not yet support middleware-based secret injection for routes.
//
// Instead, we will reconstruct the public URL manually, which is safe as it
// uses the publicly available URL and ANON key.
// This also makes the proxy faster as it doesn't need to invoke a Supabase client.

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const imagePath = path.join("/");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Detect bucket from path or fallback to default
  const knownBuckets = ["product-images", "categories", "hero-slides", "blog"];
  let finalBucket = bucketName;
  let finalPath = imagePath;

  if (path.length > 1 && knownBuckets.includes(path[0])) {
    finalBucket = path[0];
    finalPath = path.slice(1).join("/");
  }

  // Manually construct the public URL, which is the standard and safe way.
  const imageUrl = `${supabaseUrl}/storage/v1/object/public/${finalBucket}/${finalPath}`;

  try {
    const imageResponse = await fetch(imageUrl, {
      next: { revalidate: 31536000 }, // Cache the fetch itself for a year
    });

    if (!imageResponse.ok) {
      return new Response(imageResponse.body, {
        status: imageResponse.status,
        statusText: imageResponse.statusText,
      });
    }

    const contentType =
      imageResponse.headers.get("Content-Type") || "application/octet-stream";

    // Stream the image back with a long cache-control header
    return new Response(imageResponse.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to fetch image from Supabase:", error);
    return new Response("Error fetching image", { status: 500 });
  }
}
