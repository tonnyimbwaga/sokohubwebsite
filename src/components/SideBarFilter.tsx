"use client";

import "rc-slider/assets/index.css";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Heading from "@/shared/Heading/Heading";
import Slider from "rc-slider";

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

  const [rangePrices, setRangePrices] = useState([0, 50000]);

  useEffect(() => {
    if (!searchParams) return;
    const min = searchParams.get("minPrice");
    const max = searchParams.get("maxPrice");
    if (min || max) {
      setRangePrices([
        min ? parseInt(min) : 0,
        max ? parseInt(max) : 50000
      ]);
    }
  }, [searchParams]);

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

  const handlePriceChange = (value: number | number[]) => {
    if (Array.isArray(value)) {
      setRangePrices(value);
    }
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    const min = rangePrices[0] ?? 0;
    const max = rangePrices[1] ?? 50000;
    params.set("minPrice", min.toString());
    params.set("maxPrice", max.toString());
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/products");
    setRangePrices([0, 50000]);
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

  const renderPriceSection = () => {
    const minVal = rangePrices[0] ?? 0;
    const maxVal = rangePrices[1] ?? 50000;

    return (
      <div className="relative flex flex-col space-y-5 py-8">
        <h3 className="mb-2.5 text-xl font-medium uppercase tracking-wider text-gray-900">Price Range</h3>
        <div className="px-2">
          <Slider
            range
            min={0}
            max={50000}
            step={500}
            defaultValue={[0, 50000]}
            value={[minVal, maxVal]}
            onChange={handlePriceChange}
            allowCross={false}
            trackStyle={[{ backgroundColor: "var(--primary)" }]}
            handleStyle={[
              { borderColor: "var(--primary)", backgroundColor: "white" },
              { borderColor: "var(--primary)", backgroundColor: "white" },
            ]}
            railStyle={{ backgroundColor: "#e5e7eb" }}
          />
        </div>
        <div className="flex justify-between text-sm font-medium text-gray-700">
          <span>Ksh. {minVal.toLocaleString()}</span>
          <span>Ksh. {maxVal.toLocaleString()}</span>
        </div>
        <button
          onClick={applyPriceFilter}
          className="w-full rounded-xl bg-black py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
        >
          Apply Price Filter
        </button>
      </div>
    );
  };

  return (
    <div className="top-28 lg:sticky">
      <div className="mb-6 flex items-center justify-between">
        <Heading className="mb-0">Filter</Heading>
        {(activeCategory || (searchParams && searchParams.get("q")) || (searchParams && searchParams.get("minPrice"))) && (
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
        {renderPriceSection()}
      </div>
    </div>
  );
};

export default SidebarFilters;
