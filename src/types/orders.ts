import type { CartItem } from "@/hooks/useCart";

export interface OrderDetails {
  id: string;
  customer_name: string;
  phone: string;
  delivery_zone: "nairobi" | "outside";
  location: string;
  items: CartItem[];
  total: number;
  status:
    | "pending"
    | "confirmed"
    | "paid"
    | "shipped"
    | "delivered"
    | "cancelled";
  created_at: string;
  delivery_fee: number;
  grand_total: number;
  payment_method?: string;
  mpesaPhoneNumber?: string;
  mpesaTransactionCode?: string;
}
