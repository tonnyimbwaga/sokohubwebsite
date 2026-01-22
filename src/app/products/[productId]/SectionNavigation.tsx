"use client";

import Link from "next/link";
import React from "react";
import { MdArrowBack } from "react-icons/md";
import { Product } from "@/data/types";

import ButtonCircle3 from "@/shared/Button/ButtonCircle3";

interface Props {
  product: Product;
}

const SectionNavigation = ({ product }: Props) => {
  return (
    <div className="container">
      <div className="my-10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/products">
            <ButtonCircle3
              size="w-10 h-10"
              className="border border-neutral-300"
            >
              <MdArrowBack className="text-2xl" />
            </ButtonCircle3>
          </Link>
          <div className="text-sm text-gray-500">
            <Link href="/products" className="hover:text-primary">
              Products
            </Link>
            {product.category && (
              <>
                <span className="mx-2">/</span>
                <Link
                  href={`/category/${product.categorySlug}`}
                  className="hover:text-primary"
                >
                  {product.category}
                </Link>
              </>
            )}
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionNavigation;
