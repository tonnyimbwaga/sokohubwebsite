"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Image from "next/image";
import Link from "next/link";

import { getProductImageUrl } from "@/utils/product-images";

interface Product {
  id: string;
  name: string;
  price: number;
  compare_at_price?: number | null;
  stock: number;
  status: string;
  images: string[];
  is_trending: boolean;
  trending_order?: number | null;
  slug: string;
}

export default function TrendingProductsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Fetch trending products
  const { data: trendingProducts, isLoading: loadingTrending } = useQuery({
    queryKey: ["trending-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          id,
          name,
          price,
          compare_at_price,
          stock,
          status,
          is_trending,
          trending_order,
          images,
          slug
        `,
        )
        .eq("is_trending", true)
        .order("trending_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
  });

  // Fetch all products for search
  const { data: searchResults, isLoading: loadingSearch } = useQuery({
    queryKey: ["products-search", searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];

      const { data, error } = await supabase
        .from("products")
        .select(
          `
          id,
          name,
          price,
          compare_at_price,
          stock,
          status,
          is_trending,
          images,
          slug
        `,
        )
        .ilike("name", `%${searchTerm}%`)
        .eq("status", "active")
        .limit(10);

      if (error) throw error;
      return data as Product[];
    },
    enabled: searchTerm.length >= 2,
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({
      id,
      is_trending,
      trending_order,
    }: {
      id: string;
      is_trending: boolean;
      trending_order?: number | null;
    }) => {
      const { error } = await supabase
        .from("products")
        .update({ is_trending, trending_order })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trending-products"] });
    },
  });

  // Update multiple products' display order
  const updateOrderMutation = useMutation({
    mutationFn: async (updates: { id: string; trending_order: number }[]) => {
      // Use Promise.all to perform multiple updates in parallel
      await Promise.all(
        updates.map(({ id, trending_order }) =>
          supabase.from("products").update({ trending_order }).eq("id", id),
        ),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trending-products"] });
    },
  });

  // Handle drag and drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination || !trendingProducts) return;

    const items = Array.from(trendingProducts || []).filter(
      (item): item is Product => item !== null && item !== undefined,
    );
    const [reorderedItem] = items.splice(result.source.index, 1);
    if (reorderedItem) {
      items.splice(result.destination.index, 0, reorderedItem);
    }

    // Update the trending_order of all items
    const updates = items.map((item, index) => ({
      id: item.id,
      trending_order: index + 1, // Use 1-based indexing for order
    }));

    // Persist the new order to the database
    updateOrderMutation.mutate(updates);
  };

  // Toggle trending status
  const toggleTrending = (product: Product) => {
    updateProductMutation.mutate({
      id: product.id,
      is_trending: !product.is_trending,
      // When adding a product to trending, give it the last position
      trending_order: product.is_trending
        ? null
        : (trendingProducts?.length || 0) + 1,
    });
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🔥 Trending Products</h1>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
        >
          {showSearch ? "Hide Search" : "Add Products"}
        </button>
      </div>

      {showSearch && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {loadingSearch && searchTerm.length >= 2 && (
            <div className="text-center py-4">Searching...</div>
          )}

          {searchResults && searchResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {searchResults.map((product) => (
                <div
                  key={product.id}
                  className={`p-3 border rounded-md flex items-center justify-between ${
                    product.is_trending
                      ? "bg-green-50 border-green-200"
                      : "bg-white"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 relative bg-gray-100 rounded overflow-hidden">
                      <Image
                        src={getProductImageUrl(product.images?.[0])}
                        alt={product.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{product.name}</h3>
                      <p className="text-xs text-gray-500">
                        KSh {product.price.toLocaleString()}
                        {product.compare_at_price &&
                          product.compare_at_price > product.price && (
                            <span className="ml-2 line-through">
                              KSh {product.compare_at_price.toLocaleString()}
                            </span>
                          )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleTrending(product)}
                    className={`px-3 py-1 text-xs rounded-md ${
                      product.is_trending
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    {product.is_trending ? "Remove" : "Add"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {searchResults &&
            searchResults.length === 0 &&
            searchTerm.length >= 2 &&
            !loadingSearch && (
              <div className="text-center py-4 text-gray-500">
                No products found
              </div>
            )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">
          Current Trending Products
        </h2>

        {loadingTrending && (
          <div className="text-center py-8">Loading trending products...</div>
        )}

        {trendingProducts && trendingProducts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No trending products yet. Use the search above to add products.
          </div>
        )}

        {trendingProducts && trendingProducts.length > 0 && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="trending-products">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {trendingProducts.map((product, index) => (
                    <Draggable
                      key={product.id}
                      draggableId={product.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="p-3 border border-gray-200 rounded-md bg-white flex items-center justify-between hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-gray-500 font-semibold w-6 text-center">
                              {index + 1}
                            </div>
                            <div className="w-12 h-12 relative bg-gray-100 rounded overflow-hidden">
                              <Image
                                src={getProductImageUrl(product.images?.[0])}
                                alt={product.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <Link
                                href={`/admin/products/edit/${product.id}`}
                                className="font-medium text-sm hover:text-primary"
                              >
                                {product.name}
                              </Link>
                              <p className="text-xs text-gray-500">
                                KSh {product.price.toLocaleString()}
                                {product.compare_at_price &&
                                  product.compare_at_price > product.price && (
                                    <span className="ml-2 line-through">
                                      KSh{" "}
                                      {product.compare_at_price.toLocaleString()}
                                    </span>
                                  )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/admin/products/edit/${product.id}`}
                              className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => toggleTrending(product)}
                              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}
