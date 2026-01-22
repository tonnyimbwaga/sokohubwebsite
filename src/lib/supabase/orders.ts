import { supabase } from "./config";
import { Database } from "@/types/supabase";

// Using any for order types since the table structure may vary
type OrderSubmission = any;
type OrderSubmissionInsert = any;

const ORDERS_PER_PAGE = 20;

export const orderQueries = {
  // Get all orders with pagination (admin only)
  getOrders: async ({
    page = 1,
    status,
  }: {
    page?: number;
    status?: string;
  }) => {
    let query = supabase
      .from("order_submissions")
      .select(
        "id, customer_name, customer_phone, shipping_area, shipping_address, total_price, status, created_at",
        { count: "exact" },
      )
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    // Apply pagination
    const start = (page - 1) * ORDERS_PER_PAGE;
    query = query.range(start, start + ORDERS_PER_PAGE - 1);

    const { data: orders, count, error } = await query;

    if (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }

    return {
      orders,
      totalPages: count ? Math.ceil(count / ORDERS_PER_PAGE) : 0,
      totalOrders: count || 0,
    };
  },

  // Get a single order by ID (admin only)
  getOrderById: async (id: string) => {
    const { data: order, error } = await supabase
      .from("order_submissions")
      .select(
        "id, customer_name, customer_phone, shipping_area, shipping_address, cart_items, total_price, status, created_at",
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching order:", error);
      throw error;
    }

    return order;
  },
};

export const orderMutations = {
  // Update order status (admin only)
  updateOrderStatus: async (id: string, status: string) => {
    const { data, error } = await supabase
      .from("order_submissions")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating order status:", error);
      throw error;
    }

    return data;
  },

  // Format order details for WhatsApp message
  formatOrderForWhatsApp: (order: OrderSubmission): string => {
    const items = order.cart_items as Array<{
      name: string;
      quantity: number;
      price: number;
    }>;

    let message = "🛍️ *New Order*\n\n";
    message += `*Customer Details*\n`;
    message += `Name: ${order.customer_name}\n`;
    message += `Phone: ${order.customer_phone}\n`;
    message += `Shipping Area: ${order.shipping_area}\n`;
    message += `Address: ${order.shipping_address}\n\n`;

    message += "*Order Items*\n";
    items.forEach((item) => {
      message += `• ${item.name} x${item.quantity} @ KSH ${item.price.toFixed(
        2,
      )}\n`;
    });

    message += `\n*Total: KSH ${order.total_price.toFixed(2)}*\n\n`;
    // Removed consented_to_terms as it's not present in the new 'orders' table

    return encodeURIComponent(message);
  },
};
