import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import SectionHeading from "@/components/SectionHeading";
import { productQueries } from "@/lib/supabase/products";
import { transformProductData } from "@/utils/product-transforms";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/utils/seo";

// Utility to convert slug to tag (e.g., "best-indoor-games" -> "Best Indoor Games")
function slugToTag(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function tagEquals(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

// Generate metadata for the tag page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ tagSlug: string }>;
}): Promise<Metadata> {
  const { tagSlug } = await params;
  const tag = decodeURIComponent(tagSlug);
  const formattedTag = tag
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return constructMetadata({
    title: `${formattedTag} Products`,
    description: `Discover our collection of ${formattedTag.toLowerCase()} products at ${siteConfig.name}.`,
  });
}

// This is a Server Component
export default async function TagPage({
  params,
}: {
  params: Promise<{ tagSlug: string }>;
}) {
  const { tagSlug: rawTagSlug } = await params;
  const tagSlug = decodeURIComponent(rawTagSlug);
  const normalizedTag = slugToTag(tagSlug);
  const formattedTag = normalizedTag;

  // Fetch ALL products with tags (pagination not applied for tag pages)
  const { products: allProducts } = await productQueries.getProducts({});
  const filtered = (allProducts || []).filter(
    (p: any) =>
      Array.isArray(p.tags) &&
      p.tags.some((tag: string) => tagEquals(tag, normalizedTag)),
  );

  // If tag is not present in any product, show 404
  const tagExists = (allProducts || []).some(
    (p: any) =>
      Array.isArray(p.tags) &&
      p.tags.some((tag: string) => tagEquals(tag, normalizedTag)),
  );
  if (!tagExists) {
    return notFound();
  }

  // Transform products that match the tag
  const transformedProducts = filtered.map(transformProductData);

  return (
    <div className="container py-12">
      <SectionHeading
        title={`${formattedTag} Products`}
        description={`Discover our collection of ${formattedTag.toLowerCase()} products at ${siteConfig.name}.`}
        className="mb-8"
      />

      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${formattedTag} Products | ${siteConfig.name}`,
            description: `Discover our collection of ${formattedTag.toLowerCase()} products at ${siteConfig.name}.`,
            url: `${siteConfig.url}/tag/${rawTagSlug}`,
            numberOfItems: transformedProducts.length,
          }),
        }}
      />

      {/* Products grid */}
      <ProductGrid products={transformedProducts} />
    </div>
  );
}
