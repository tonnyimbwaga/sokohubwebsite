"use client";

/**
 * Static Homepage Component
 *
 * This component loads pre-generated static data for blazing fast homepage performance.
 * Perfect for Cloudflare edge caching and maximum user experience.
 */

import React from "react";
import { useStaticHomepageData } from "@/hooks/useStaticHomepageData";
import type { StaticProduct, StaticCategory } from "@/lib/static-homepage-data";
import Link from "next/link";
import Image from "next/image";

// Optimized Product Card Component
const StaticProductCard: React.FC<{ product: StaticProduct }> = ({
  product,
}) => (
  <Link
    href={`/products/${product.slug}`}
    className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
  >
    <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-100">
      <Image
        src={product.image}
        alt={product.name}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-300"
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
        loading="lazy"
      />
      {product.isDiscounted && product.discountPercentage && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
          -{product.discountPercentage}%
        </div>
      )}
      {product.isFeatured && (
        <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">
          Featured
        </div>
      )}
    </div>
    <div className="p-4">
      <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
      <p className="text-sm text-gray-500 mt-1">{product.category}</p>
      <div className="mt-2">
        <span className="text-lg font-bold text-gray-900">
          Ksh {product.price.toLocaleString("en-KE")}
        </span>
      </div>
    </div>
  </Link>
);

// Category Section Component
const CategorySection: React.FC<{ category: StaticCategory }> = ({
  category,
}) => (
  <section className="py-8">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
      <Link
        href={`/category/${category.slug}`}
        className="text-primary hover:text-gray-900 font-medium"
      >
        View All ({category.productCount})
      </Link>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {category.products.slice(0, 6).map((product) => (
        <StaticProductCard key={product.id} product={product} />
      ))}
    </div>
  </section>
);

// Featured Products Section
const FeaturedSection: React.FC<{ products: StaticProduct[] }> = ({
  products,
}) => (
  <section className="py-8 bg-gray-50 rounded-lg">
    <div className="px-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Featured Products
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.slice(0, 6).map((product) => (
          <StaticProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  </section>
);

// Deals Section
const DealsSection: React.FC<{ products: StaticProduct[] }> = ({
  products,
}) => (
  <section className="py-8 bg-red-50 rounded-lg">
    <div className="px-6">
      <h2 className="text-2xl font-bold text-red-900 mb-6">🔥 Best Deals</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.slice(0, 6).map((product) => (
          <StaticProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  </section>
);

// Loading Skeleton
const LoadingSkeleton: React.FC = () => (
  <div className="space-y-8">
    {[1, 2, 3].map((i) => (
      <div key={i} className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((j) => (
            <div key={j} className="bg-gray-200 aspect-square rounded-lg"></div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// Main Static Homepage Component
export default function StaticHomepage() {
  const { data, isLoading, error, source } = useStaticHomepageData();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error && !data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load homepage data</p>
        <p className="text-sm text-gray-500 mt-2">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Performance indicator (remove in production) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mb-4 p-2 bg-green-100 text-green-800 text-sm rounded">
          ⚡ Loaded from: {source} | Last updated:{" "}
          {new Date(data.lastUpdated).toLocaleString()}
        </div>
      )}

      {/* Featured Products */}
      {data.featuredProducts.length > 0 && (
        <FeaturedSection products={data.featuredProducts} />
      )}

      {/* Deals Section */}
      {data.dealProducts.length > 0 && (
        <div className="mt-8">
          <DealsSection products={data.dealProducts} />
        </div>
      )}

      {/* Category Sections */}
      <div className="mt-8 space-y-8">
        {data.categories.map((category) => (
          <CategorySection key={category.id} category={category} />
        ))}
      </div>

      {/* Trending Products */}
      {data.trendingProducts.length > 0 && (
        <section className="py-8 mt-8 bg-blue-50 rounded-lg">
          <div className="px-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">
              📈 Trending Now
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {data.trendingProducts.slice(0, 6).map((product) => (
                <StaticProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
