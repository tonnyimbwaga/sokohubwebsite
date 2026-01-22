import type { StaticImageData } from "next/image";

export type ProductCategory =
  | "cookware"
  | "home-decor"
  | "furniture"
  | "wall-art"
  | "garden"
  | "storage"
  | "games"
  | "other";

export type Category = {
  id: ProductCategory;
  name: string;
  description: string;
  image: string;
  featured?: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  salePrice?: number;
  images: Array<{
    web_image_url?: string;
    feed_image_url?: string;
    url?: string;
    alt?: string;
  }>;
  inStock: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  rating: number;
  reviews: number;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
};
