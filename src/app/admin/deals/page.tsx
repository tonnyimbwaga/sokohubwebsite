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
  is_deal: boolean;
  deal_order?: number | null;
  slug: string;
  discount_percentage?: number;
}

export default function DealsProductsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Fetch deals products
  const { data: dealsProducts, isLoading: loadingDeals } = useQuery({
    queryKey: ["deals-products"],
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
          is_deal,
          deal_order,
          images,
          slug
        `,
        )
        .eq("is_deal", true)
        .eq("status", "active")
        .not("compare_at_price", "is", null)
        .order("deal_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Calculate discount percentage for sorting
      const productsWithDiscount = (data || []).map((product: any) => {
        const discountPercentage =
          product.compare_at_price && product.price
            ? ((product.compare_at_price - product.price) /
                product.compare_at_price) *
              100
            : 0;

        return {
          ...product,
          discount_percentage: discountPercentage,
        };
      });

      // Sort by discount percentage (highest first)
      return productsWithDiscount.sort((a: any, b: any) => {
        return b.discount_percentage - a.discount_percentage;
      });
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
          is_deal,
          images,
          slug
        `,
        )
        .ilike("name", `%${searchTerm}%`)
        .eq("status", "active")
        .limit(10);

      if (error) throw error;

      // Calculate discount percentage for display
      return (data || []).map((product) => {
        const discountPercentage =
          product.compare_at_price && product.price
            ? ((product.compare_at_price - product.price) /
                product.compare_at_price) *
              100
            : 0;

        return {
          ...product,
          discount_percentage: discountPercentage,
        };
      });
    },
    enabled: searchTerm.length >= 2,
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({
      id,
      is_deal,
      deal_order,
    }: {
      id: string;
      is_deal: boolean;
      deal_order?: number | null;
    }) => {
      const { error } = await supabase
        .from("products")
        .update({ is_deal, deal_order })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals-products"] });
    },
  });

  // Update multiple products' display order - optimized for Workers
  const updateOrderMutation = useMutation({
    mutationFn: async (updates: { id: string; deal_order: number }[]) => {
      // Use batch update RPC for better performance
      const { error } = await supabase.rpc("batch_update_deal_order", {
        updates: updates,
      });

      if (error) {
        // Fallback to sequential updates to avoid overwhelming Workers
        for (const { id, deal_order } of updates) {
          const { error: updateError } = await supabase
            .from("products")
            .update({ deal_order })
            .eq("id", id);

          if (updateError) throw updateError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals-products"] });
    },
  });

  // Handle drag and drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination || !dealsProducts) return;

    const items = Array.from(dealsProducts || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the deal_order of all items
    const updates = items.map((item, index) => ({
      id: item.id,
      deal_order: index + 1, // Use 1-based indexing for order
    }));

    // Persist the new order to the database
    updateOrderMutation.mutate(updates);
  };

  // Toggle deal status
  const toggleDeal = (product: Product) => {
    updateProductMutation.mutate({
      id: product.id,
      is_deal: !product.is_deal,
      // When adding a product to deals, give it the last position
      deal_order: product.is_deal ? null : (dealsProducts?.length || 0) + 1,
    });
  };

  // Format discount percentage
  const formatDiscount = (percentage: number | undefined) => {
    if (percentage === undefined || isNaN(percentage)) return "";
    return `${Math.round(percentage)}% OFF`;
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Best Deals</h1>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
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
                    product.is_deal
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
                      {product.compare_at_price &&
                        product.price &&
                        product.compare_at_price > product.price && (
                          <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] px-1 py-0.5">
                            {formatDiscount(product.discount_percentage)}
                          </div>
                        )}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{product.name}</h3>
                      <p className="text-xs text-gray-500">
                        KSh {product.price?.toLocaleString()}
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
                    onClick={() => toggleDeal(product)}
                    className={`px-3 py-1 text-xs rounded-md ${
                      product.is_deal
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    {product.is_deal ? "Remove" : "Add"}
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
        <h2 className="text-xl font-semibold mb-4">Current Deal Products</h2>

        {loadingDeals && (
          <div className="text-center py-8">Loading deal products...</div>
        )}

        {dealsProducts && dealsProducts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No deal products yet. Use the search above to add products.
          </div>
        )}

        {dealsProducts && dealsProducts.length > 0 && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="deals-products">
              {(provided: any) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {dealsProducts.map((product, index) => (
                    <Draggable
                      key={product.id}
                      draggableId={product.id}
                      index={index}
                    >
                      {(provided: any) => (
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
                              {product.compare_at_price &&
                                product.price &&
                                product.compare_at_price > product.price && (
                                  <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] px-1 py-0.5">
                                    {formatDiscount(
                                      product.discount_percentage,
                                    )}
                                  </div>
                                )}
                            </div>
                            <div>
                              <Link
                                href={`/admin/products/edit/${product.id}`}
                                className="font-medium text-sm hover:text-primary"
                              >
                                {product.name}
                              </Link>
                              <div className="flex items-center">
                                <p className="text-xs text-gray-500">
                                  KSh {product.price?.toLocaleString()}
                                  {product.compare_at_price &&
                                    product.compare_at_price >
                                      product.price && (
                                      <span className="ml-2 line-through">
                                        KSh{" "}
                                        {product.compare_at_price.toLocaleString()}
                                      </span>
                                    )}
                                </p>
                                {product.discount_percentage &&
                                  product.discount_percentage > 0 && (
                                    <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                                      {formatDiscount(
                                        product.discount_percentage,
                                      )}
                                    </span>
                                  )}
                              </div>
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
                              onClick={() => toggleDeal(product)}
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
