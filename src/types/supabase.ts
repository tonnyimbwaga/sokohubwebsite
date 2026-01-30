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
          description: string | null;
          price: number;
          compare_at_price: number | null;
          cost_price: number | null;
          sku: string | null;
          barcode: string | null;
          stock: number | null;
          is_published: boolean | null;
          status: string | null;
          is_featured: boolean | null;
          is_trending: boolean | null;
          trending_order: number | null;
          featured_order: number | null;
          deal_order: number | null;
          category_id: string | null;
          images: Json | null;
          metadata: Json | null;
          created_at: string | null;
          updated_at: string | null;
          is_deal: boolean | null;
          sizes: Json | null;
          tags: Json | null;
          colors: string[] | null;
          options: Json | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          price: number;
          compare_at_price?: number | null;
          cost_price?: number | null;
          sku?: string | null;
          barcode?: string | null;
          stock?: number | null;
          is_published?: boolean | null;
          status?: string | null;
          is_featured?: boolean | null;
          is_trending?: boolean | null;
          trending_order?: number | null;
          featured_order?: number | null;
          deal_order?: number | null;
          category_id?: string | null;
          images?: Json | null;
          metadata?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
          is_deal?: boolean | null;
          sizes?: Json | null;
          tags?: Json | null;
          colors?: string[] | null;
          options?: Json | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          price?: number;
          compare_at_price?: number | null;
          cost_price?: number | null;
          sku?: string | null;
          barcode?: string | null;
          stock?: number | null;
          is_published?: boolean | null;
          status?: string | null;
          is_featured?: boolean | null;
          is_trending?: boolean | null;
          trending_order?: number | null;
          featured_order?: number | null;
          deal_order?: number | null;
          category_id?: string | null;
          images?: Json | null;
          metadata?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
          is_deal?: boolean | null;
          sizes?: Json | null;
          tags?: Json | null;
          colors?: string[] | null;
          options?: Json | null;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          is_active: boolean | null;
          parent_id: string | null;
          metadata: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean | null;
          parent_id?: string | null;
          metadata?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean | null;
          parent_id?: string | null;
          metadata?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
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
