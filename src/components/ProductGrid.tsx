import Link from "next/link"; // Keep for pagination, but not for individual grid items if ProductCard handles its own Link
import ProductCard from "./ProductCard"; // Import ProductCard
import type { TransformedProduct } from "@/utils/product-transforms";

const ITEMS_TO_PRIORITIZE = 4; // Number of items to prioritize loading for

interface ProductGridProps {
  products: TransformedProduct[];
  isCategoryPage?: boolean;
  currentPage?: number;
  totalPages?: number;
  categorySlug?: string; // To build pagination links for category pages
}

const ProductGrid = ({
  products,
  isCategoryPage = false,
  currentPage,
  totalPages,
  categorySlug,
}: ProductGridProps) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">No products found.</div>
    );
  }

  const renderPagination = () => {
    if (!isCategoryPage || !currentPage || !totalPages || totalPages <= 1) {
      return null;
    }

    const pageNumbers = [];
    const maxPageButtons = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div className="flex space-x-1">
          {currentPage > 1 && (
            <Link
              href={`/category/${categorySlug}?page=${currentPage - 1}`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Previous
            </Link>
          )}
          {pageNumbers.map((number) => (
            <Link
              key={number}
              href={`/category/${categorySlug}?page=${number}`}
              className={`px-4 py-2 text-sm font-medium border rounded-md ${currentPage === number
                  ? "bg-primary text-white border-primary"
                  : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                }`}
            >
              {number}
            </Link>
          ))}
          {currentPage < totalPages && (
            <Link
              href={`/category/${categorySlug}?page=${currentPage + 1}`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Next
            </Link>
          )}
        </div>
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 ${isCategoryPage ? "xl:grid-cols-5" : "xl:grid-cols-5"
          } gap-3 sm:gap-4`}
      >
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={
              isCategoryPage &&
              (!currentPage || currentPage === 1) &&
              index < ITEMS_TO_PRIORITIZE
            }
          // Add any other props ProductCard might need from the grid context
          />
        ))}
      </div>
      {renderPagination()}
    </div>
  );
};

export default ProductGrid;
