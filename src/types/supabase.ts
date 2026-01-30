export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          price: number;
          compare_at_price: number | null;
          cost_price: number | null;
          sku: string | null;
          barcode: string | null;
          stock: number;
          is_published: boolean;
          is_featured: boolean;
          is_trending: boolean;
          category_id: string;
          images: string[];
          metadata: Record<string, any> | null;
          colors: string[] | null;
          options: Record<string, any> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description: string;
          price: number;
          compare_at_price?: number | null;
          cost_price?: number | null;
          sku?: string | null;
          barcode?: string | null;
          stock?: number;
          is_published?: boolean;
          is_featured?: boolean;
          is_trending?: boolean;
          category_id: string;
          images?: string[];
          metadata?: Record<string, any> | null;
          colors?: string[] | null;
          options?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          price?: number;
          compare_at_price?: number | null;
          cost_price?: number | null;
          sku?: string | null;
          barcode?: string | null;
          stock?: number;
          is_published?: boolean;
          is_featured?: boolean;
          is_trending?: boolean;
          category_id?: string;
          images?: string[];
          metadata?: Record<string, any> | null;
          colors?: string[] | null;
          options?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          is_active: boolean;
          parent_id: string | null;
          metadata: Record<string, any> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          parent_id?: string | null;
          metadata?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          parent_id?: string | null;
          metadata?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          customer_email: string;
          status: string;
          total_amount: number;
          shipping_address: Record<string, any>;
          billing_address: Record<string, any>;
          payment_status: string;
          metadata: Record<string, any> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_email: string;
          status?: string;
          total_amount: number;
          shipping_address: Record<string, any>;
          billing_address: Record<string, any>;
          payment_status?: string;
          metadata?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_email?: string;
          status?: string;
          total_amount?: number;
          shipping_address?: Record<string, any>;
          billing_address?: Record<string, any>;
          payment_status?: string;
          metadata?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          role: string;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          metadata: Record<string, any> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          metadata?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          metadata?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          content: string;
          excerpt: string;
          featured_image: string | null;
          is_published: boolean;
          author_id: string;
          slug: string;
          tags: string[] | null;
          meta_title: string | null;
          meta_description: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          excerpt: string;
          featured_image?: string | null;
          is_published?: boolean;
          author_id: string;
          slug: string;
          tags?: string[] | null;
          meta_title?: string | null;
          meta_description?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          excerpt?: string;
          featured_image?: string | null;
          is_published?: boolean;
          author_id?: string;
          slug?: string;
          tags?: string[] | null;
          meta_title?: string | null;
          meta_description?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_categories: {
        Row: {
          product_id: string;
          category_id: string;
        };
        Insert: {
          product_id: string;
          category_id: string;
        };
        Update: {
          product_id?: string;
          category_id?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      search_products: {
        Args: {
          search_query: string;
          page_number?: number;
          items_per_page?: number;
        };
        Returns: {
          items: Json;
          total_count: number;
        }[];
      };
    };
    Enums: {
      user_role: "admin" | "customer";
      order_status: "pending" | "processing" | "completed" | "cancelled";
      product_status: "draft" | "published" | "out_of_stock";
    };
  };
}
