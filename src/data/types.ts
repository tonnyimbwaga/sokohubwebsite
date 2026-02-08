import type { StaticImageData } from "next/image";

// Blog Post Type
export interface BlogPost {
  title: string;
  brief: string;
  date: string;
  coverImage: string | StaticImageData;
  tag: string;
  slug: string;
  // Add other properties as needed, e.g., content, author, etc.
  content?: any; // Placeholder for actual content structure
  _id?: string; // Example: ID if fetched from DB
  id?: string; // Example: ID if fetched from DB
  href?: string; // Example: Link if needed elsewhere
  commentCount?: number; // Example
  viewCount?: number; // Example
  readingTime?: number; // Example
  bookmark?: { count: number; isBookmarked: boolean }; // Example
  like?: { count: number; isLiked: boolean }; // Example
  author?: any; // Placeholder for author type
  categories?: any[]; // Placeholder for category type
  postType?: "standard" | "video" | "gallery" | "audio"; // Example
  featuredImage?: string | StaticImageData; // Example, might be same as coverImage
  galleryImgs?: (string | StaticImageData)[]; // Example
  audioUrl?: string; // Example
  videoUrl?: string; // Example
  blogData?: any;
}

export type BlogType = BlogPost;

export interface NavItemType {
  id: string;
  name: string;
  href: string;
}

// Product Types
export interface ProductImage {
  url?: string;
  src?: string;
  web_image_url?: string;
  web_optimized_image_url?: string;
  feed_image_url?: string;
  alt?: string;
}

export interface Color {
  label: string;
  value: string;
  price: number;
  available: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  images: ProductImage[];
  sku: string;
  slug: string;
  category: string;
  categorySlug: string;
  ageRange?: string;
  inStock: boolean;
  isFeatured: boolean;
  rating: number;
  reviews: number;
  category_id?: string;
  index?: number; // For numbering products in listings
  discountPercentage?: number; // For displaying discount badges
  sizes?: {
    value: string;
    label: string;
    price: number;
    inStock: boolean;
  }[];
  colors?: Color[];
  options?: Record<string, any>;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  image: string;
  slug?: string;
  parentId?: string;
  children?: ProductCategory[];
  productCount?: number;
  featured?: boolean;
  icon?: string;
}

// Cart/Order Item Type
export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: Color;
  giftWrap?: boolean;
  personalizedMessage?: string;
}
