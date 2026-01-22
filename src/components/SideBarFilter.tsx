"use client";

import "rc-slider/assets/index.css";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Heading from "@/shared/Heading/Heading";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface SidebarFiltersProps {
  categories: Category[];
  activeCategory?: string;
}

const SidebarFilters = ({ categories, activeCategory }: SidebarFiltersProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryClick = (slug: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (activeCategory === slug) {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/products");
  };

  const renderTabsCategories = () => {
    return (
      <div className="relative flex flex-col space-y-4 pb-8">
        <h3 className="mb-2.5 text-xl font-medium uppercase tracking-wider text-gray-900">Categories</h3>
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams(searchParams?.toString() || "");
              params.delete("category");
              params.delete("page");
              router.push(`/products?${params.toString()}`);
            }}
            className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${!activeCategory
              ? "bg-primary text-black shadow-md ring-2 ring-primary ring-offset-2"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
          >
            All Products
          </button>
          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleCategoryClick(item.slug)}
              className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${activeCategory === item.slug
                ? "bg-primary text-black shadow-md ring-2 ring-primary ring-offset-2"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="top-28 lg:sticky">
      <div className="mb-6 flex items-center justify-between">
        <Heading className="mb-0">Filter</Heading>
        {(activeCategory || searchParams?.get("q")) && (
          <button
            onClick={clearFilters}
            className="text-xs font-semibold uppercase tracking-widest text-primary hover:text-primary-dark"
          >
            Clear All
          </button>
        )}
      </div>
      <div className="divide-y divide-neutral-200">
        {renderTabsCategories()}
      </div>
    </div>
  );
};

export default SidebarFilters;
