"use client";

import { useEffect } from "react";
import { trackPurchase } from "@/lib/fpixel";

// Replicate or import the OrderDetails and OrderItem types
interface OrderItem {
  id: string | number;
  name: string;
  quantity: number;
  price: number;
  size?: string;
  images?: { url: string }[];
  // slug?: string;
}

interface OrderDetails {
  id: string | number;
  customer_name: string;
  phone: string;
  delivery_zone: string;
  location: string;
  total: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

interface Props {
  order: OrderDetails | null;
  isNewPurchase: boolean;
}

const OrderPurchaseTracker = ({ order, isNewPurchase }: Props) => {
  useEffect(() => {
    if (isNewPurchase && order) {
      console.log("Tracking Purchase event for order:", order.id);
      trackPurchase({
        content_ids: order.items.map((item) => String(item.id)),
        content_type: "product",
        num_items: order.items.reduce((sum, item) => sum + item.quantity, 0),
        order_id: String(order.id),
        value: order.total,
        currency: "KES",
      });

      // Remove the query param after tracking to prevent re-firing on refresh
      // Using window.history.replaceState to avoid triggering a full page reload
      const url = new URL(window.location.href);
      if (url.searchParams.has("new_purchase")) {
        url.searchParams.delete("new_purchase");
        window.history.replaceState({}, "", url.toString());
        console.log("Removed new_purchase query param.");
      }
    }
  }, [order, isNewPurchase]); // Dependencies

  // This component doesn't render anything visible
  return null;
};

export default OrderPurchaseTracker;
