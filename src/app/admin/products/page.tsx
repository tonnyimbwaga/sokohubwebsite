"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

import ProductForm, { ImageInfo } from "./product-form";
import BulkUpload from "./BulkUpload";
import { toast } from "react-hot-toast";
import { getProductImageUrl } from "@/utils/product-images";

// Define Size and SizeType to match ProductForm's expectations
export type SizeType = "bicycle" | "skates" | "general";
export interface Size {
  value: string;
  label: string;
  type: SizeType;
  price: number;
  available: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  status: "draft" | "active" | "archived";
  category_id: string;
  is_featured: boolean;
  is_trending: boolean;
  is_deal: boolean;
  category?: {
    id: string;
    name: string;
  } | null;
  created_at: string;
  slug?: string;
  compare_at_price?: number | null;
  images?: (string | ImageInfo)[];
  sizes?: Size[];
  tags?: string[];
  category_ids?: string[];
}

type ProductResponse = Omit<Product, "category"> & {
  category: { id: string; name: string }[];
};

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 50);

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const perPage = 10;
  const supabase = createClient();

  // Fetch all categories for mapping
  const { data: categoriesList } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["categories-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name");
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  // Helper to resolve category name
  const categoryMap: Record<string, string> = {};
  categoriesList?.forEach((cat) => {
    categoryMap[cat.id] = cat.name;
  });
  function resolveCategoryName(product: Product) {
    if (product.category && product.category.name) return product.category.name;
    if (product.category_id && categoryMap[product.category_id])
      return categoryMap[product.category_id];
    return "Uncategorized";
  }

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", page, search],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(
          `
          id,
          name,
          description,
          price,
          compare_at_price,
          stock,
          status,
          category_id,
          is_featured,
          is_trending,
          is_deal,
          created_at,
          slug,
          images,
          sizes,
          tags,
          category:categories!products_category_id_fkey(id, name),
          product_categories(category_id, categories(id, name))
        `,
        )
        .range((page - 1) * perPage, page * perPage - 1)
        .order("created_at", { ascending: false });

      if (search) {
        query = query.filter("name", "ilike", `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as ProductResponse[]).map((product) => ({
        ...product,
        category: Array.isArray(product.category) ? product.category[0] : null,
        category_ids:
          (product as any).product_categories?.map(
            (pc: any) => pc.category_id,
          ) || (product.category_id ? [product.category_id] : []),
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: totalCount } = useQuery({
    queryKey: ["products-count", search],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*", { count: "exact", head: true });
      if (search) {
        query = query.filter("name", "ilike", `%${search}%`);
      }
      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const totalPages = Math.ceil((totalCount || 0) / perPage);

  // Add delete handler
  const handleDelete = async (productId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone.",
      )
    )
      return;
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);
    if (error) {
      toast.error("Failed to delete product: " + error.message);
    } else {
      toast.success("Product deleted successfully");
      // Optionally, refetch products or remove from local state
      window.location.reload(); // Simple way to refresh for now
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-purple-700 bg-clip-text text-transparent">
            Products
          </h1>
          <p className="mt-2 text-slate-600">
            Manage your product catalog and inventory
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <button
            onClick={() => setShowBulkUpload(!showBulkUpload)}
            className="inline-flex items-center px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 font-semibold hover:bg-slate-50 transition-all duration-200 shadow-md"
          >
            {showBulkUpload ? "Hide Bulk Upload" : "Bulk Upload"}
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center px-4 py-2.5 rounded-2xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Add Product
          </button>
        </div>
      </div>

      {showBulkUpload && (
        <BulkUpload onSuccess={() => {
          setShowBulkUpload(false);
          window.location.reload();
        }} />
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200/50 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-200/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200/50">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/30 bg-white/50">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    Loading products...
                  </td>
                </tr>
              ) : products?.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No products found
                  </td>
                </tr>
              ) : (
                products?.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50/50 transition-colors duration-200"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0">
                          <img
                            className="h-12 w-12 rounded-2xl object-cover shadow-sm"
                            src={getProductImageUrl(product.images?.[0])}
                            alt={product.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-slate-900">
                            {product.name.length > 25
                              ? `${product.name.substring(0, 25)}...`
                              : product.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {resolveCategoryName(product)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900">
                      Ksh {product.price.toLocaleString("en-KE")}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {product.stock}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${product.status === "active"
                          ? "bg-purple-100 text-purple-800"
                          : product.status === "draft"
                            ? "bg-slate-100 text-slate-800"
                            : "bg-red-100 text-red-800"
                          }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsFormOpen(true);
                        }}
                        className="text-slate-600 hover:text-slate-900 font-semibold mr-4 transition-colors duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-800 font-semibold transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/20 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl border border-slate-200/30 my-8">
            <div className="px-8 py-6 border-b border-slate-200/30">
              <h2 className="text-2xl font-bold text-slate-900">
                {selectedProduct ? "Edit Product" : "Add New Product"}
              </h2>
            </div>
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-8">
              <ProductForm
                product={
                  selectedProduct
                    ? {
                      ...selectedProduct,
                      slug:
                        selectedProduct.slug ||
                        generateSlug(selectedProduct.name),
                      category_ids: selectedProduct.category_ids || [],
                      compare_at_price:
                        selectedProduct.compare_at_price || null,
                      images: Array.isArray(selectedProduct.images)
                        ? (selectedProduct.images as any[]).map((img) => ({
                          web_image_url:
                            img.web_image_url || img.webp_url || "",
                          feed_image_url:
                            img.feed_image_url || img.feed_url || "",
                          alt: img.alt || "",
                        }))
                        : [],
                      sizes: selectedProduct.sizes || [],
                      tags: selectedProduct.tags || [],
                    }
                    : undefined
                }
                onClose={() => {
                  setIsFormOpen(false);
                  setSelectedProduct(null);
                }}
                isModal={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200/50 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-3xl shadow-lg border border-slate-200/30">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-200"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="relative ml-3 inline-flex items-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-200"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-600">
                Showing{" "}
                <span className="font-semibold">
                  {(page - 1) * perPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold">
                  {Math.min(page * perPage, totalCount || 0)}
                </span>{" "}
                of <span className="font-semibold">{totalCount}</span> results
              </p>
            </div>
            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-2xl shadow-lg"
                aria-label="Pagination"
              >
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-l-2xl px-3 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 transition-all duration-200"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold transition-all duration-200 ${pageNum === page
                        ? "z-10 bg-slate-900 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                        : "text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0"
                        }`}
                    >
                      {pageNum}
                    </button>
                  ),
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center rounded-r-2xl px-3 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 transition-all duration-200"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
