export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  stock_quantity: number;
  category_id?: string;
  status: "draft" | "active" | "archived";
  featured: boolean;
  sku: string;
  image_url?: string;
  images?: { url: string }[];
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
  slug: string;
  category: string;
  ageRange: string;
  inStock: boolean;
  tags?: string[]; // <-- Added for product tags
}
