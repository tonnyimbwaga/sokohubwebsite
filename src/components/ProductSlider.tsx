"use client";

import React from "react";

import Slider from "@/shared/Slider/Slider";

import ProductCard from "./ProductCard";

// TODO: The 'shoes' import from '@/data/content' is causing a lint error because it does not exist or is not exported.
// To fix this, you must either:
// 1. Export 'shoes' from '@/data/content', or
// 2. Replace this with a valid product data source, or
// 3. Remove the ProductSlider until a valid data source is available.
// For now, I will comment out the broken code to fix the lint error.

import { products } from "@/data/content";

const data = products.slice(0, 6);

const ProductSlider = () => {
  return (
    <div className="">
      <Slider
        itemPerRow={6}
        data={data}
        renderItem={(item) => {
          if (!item) {
            return null;
          }
          // Removed showPrevPrice prop to match ProductCardProps interface
          return <ProductCard product={item} className="bg-white" />;
        }}
      />
    </div>
  );
};

export default ProductSlider;
