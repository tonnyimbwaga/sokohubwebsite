import { Metadata } from "next";
import { serverCategoryQueries } from "@/lib/supabase/categories.server";
import ProductGrid from "@/components/ProductGrid";
import CategoryHero from "@/components/CategoryHero";
import { notFound } from "next/navigation";
import { PLACEHOLDER_IMAGE } from "@/utils/product-images";
import { constructMetadata } from "@/utils/seo";

export const revalidate = 600; // Revalidate every 10 minutes
const PRODUCTS_PER_PAGE = 12; // Define products per page

// Define Props type for CategoryPage
interface Props {
  params: Promise<{
    id: string; // 'id' is actually the slug
  }>;
  searchParams?: Promise<{
    // Add searchParams for pagination
    page?: string;
  }>;
}

// Generate static paths for categories
export async function generateStaticParams() {
  const categories = (await serverCategoryQueries.getAllCategorySlugs()) as {
    slug: string;
  }[];
  return categories.map((category) => ({
    id: category.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  // Fetch category details for metadata (pagination not needed here)
  const categoryDetails = await serverCategoryQueries.getCategoryBySlug(
    id,
    1,
    0,
  ); // page 1, 0 items for metadata

  if (!categoryDetails) {
    notFound();
  }

  return constructMetadata({
    title: categoryDetails.name,
    description: categoryDetails.description || `Explore our collection of ${categoryDetails.name}`,
    image: categoryDetails.image_url || undefined,
    canonicalPath: `/category/${id}`,
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams?.page as string) || 1;

  const categoryData = await serverCategoryQueries.getCategoryBySlug(
    id,
    currentPage,
    PRODUCTS_PER_PAGE,
  );

  if (!categoryData) {
    notFound();
  }

  const {
    name: categoryName,
    description: categoryDescriptionText,
    image_url: categoryImageUrl,
    products, // These are now paginated
    totalProductCount,
  } = categoryData;

  const description =
    categoryDescriptionText || `Explore our collection of ${categoryName}`;
  const imageUrl = categoryImageUrl || PLACEHOLDER_IMAGE;
  const totalPages = Math.ceil(totalProductCount / PRODUCTS_PER_PAGE);

  return (
    <div>
      <CategoryHero
        title={categoryName}
        description={description}
        imageUrl={imageUrl}
      />
      <div className="container mx-auto px-4 py-8">
        <ProductGrid
          products={products}
          isCategoryPage
          currentPage={currentPage}
          totalPages={totalPages}
          categorySlug={id} // Pass category slug for pagination links
        />
      </div>
    </div>
  );
}
