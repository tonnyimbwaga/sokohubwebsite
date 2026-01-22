// src/lib/supabaseImageLoader.ts
interface SupabaseLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function supabaseImageLoader({
  src,
  width,
  quality,
}: SupabaseLoaderProps): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // If src is already an absolute URL (e.g. placeholder, external image), return it directly.
  if (src.startsWith("http")) {
    return src;
  }

  // Handle local public paths (like placeholders or other public assets)
  // These should not be processed by the Supabase loader.
  if (src.startsWith("/")) {
    // Example: /assets/images/placeholder.png or /images/some-public-image.jpg
    return src;
  }

  if (!supabaseUrl) {
    console.error(
      "Supabase URL (NEXT_PUBLIC_SUPABASE_URL) is not configured. Cannot optimize image:",
      src,
    );
    // Fallback to src, or a generic placeholder if preferred
    return src;
  }

  // The src for Supabase storage is expected to be in the format "bucket-name/path/to/image.png"
  // Example: "product-images/cool-product.webp"

  // Ensure quality is a number between 20 and 100, default to 75.
  const q = quality || 75;
  const effectiveQuality = Math.max(20, Math.min(q, 100));

  // Construct the Supabase image transformation URL
  // Docs: https://supabase.com/docs/guides/storage/image-transformations#image-loader-nextjs
  // Example: https://<project_id>.supabase.co/storage/v1/render/image/public/bucket-name/path/to/image.png?width=...&quality=...&resize=cover&format=webp

  const transformationParams = `width=${width}&quality=${effectiveQuality}&resize=cover&format=webp`;

  // `src` should be "bucket-name/path/to/image.png"
  const imagePath = src;

  return `${supabaseUrl}/storage/v1/render/image/public/${imagePath}?${transformationParams}`;
}
