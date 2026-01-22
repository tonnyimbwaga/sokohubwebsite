"use client"; // Make this a Client Component

import React from "react";
import { LuFilter } from "react-icons/lu";
import { MdOutlineFilterList, MdSearch } from "react-icons/md";

import ProductCard from "@/components/ProductCard";
import SidebarFilters from "@/components/SideBarFilter";
import { products } from "@/data/content";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import Input from "@/shared/Input/Input";

const page = () => {
  return (
    <div className="">
      <div className="container relative flex flex-col lg:flex-row" id="body">
        <div className="pr-4 pt-10 lg:basis-1/3 xl:basis-1/4">
          <SidebarFilters />
        </div>
        <div className="mb-10 shrink-0 border-t lg:mx-4 lg:mb-0 lg:border-t-0" />
        <div className="relative flex-1">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ButtonSecondary
                className="flex items-center gap-2 lg:hidden"
                onClick={() => {
                  const sidebar = document.getElementById("sidebar");
                  if (sidebar) {
                    sidebar.style.display =
                      sidebar.style.display === "none" ? "block" : "none";
                  }
                }}
              >
                <LuFilter />
                Filter
              </ButtonSecondary>
              <MdOutlineFilterList className="hidden text-2xl lg:block" />
              <span className="hidden text-gray-600 lg:block">
                Showing {products.length} results
              </span>
            </div>
            <div className="flex w-full items-center gap-2 lg:w-auto">
              <div className="relative flex flex-1 lg:w-80 lg:flex-none">
                <Input
                  type="text"
                  placeholder="Search products..."
                  className="pr-10"
                />
                <MdSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-400" />
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
