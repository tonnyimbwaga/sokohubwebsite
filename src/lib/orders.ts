import { supabase } from "./supabase/client";

interface OrderDetails {
  id: string;
  customer_name: string;
  phone: string;
  delivery_zone: string;
  location: string;
  items: any[];
  total: number;
  status: string;
  created_at: string;
  is_immediate_payment?: boolean;
  discount_percentage?: number;
  original_amount?: number;
  discounted_amount?: number;
  payment_status?: string;
  payment_date?: string;
  order_confirmed?: boolean;
  order_confirmation_date?: string;
}

export async function createOrder(orderData: {
  customer_name: string;
  customer_email?: string | null;

  phone: string;
  delivery_zone: string;
  location: string;
  items: any[];
  total_amount: number;
  status?: string;
  metadata?: Record<string, any>;
  is_immediate_payment?: boolean;
  discount_percentage?: number;
  original_amount?: number;
  discounted_amount?: number;
  payment_status?: string;
  payment_method?: string;
  order_confirmed?: boolean;
}): Promise<{ success: boolean; orderId?: string; error?: string }> {

  try {
    // Calculate discount if immediate payment
    const isImmediatePayment = orderData.is_immediate_payment || false;
    const discountPercentage = isImmediatePayment
      ? orderData.discount_percentage || 5
      : 0;
    const originalAmount = orderData.total_amount;
    const discountedAmount = isImmediatePayment
      ? Number((originalAmount * (1 - discountPercentage / 100)).toFixed(2))
      : originalAmount;

    // Set payment status based on immediate payment preference
    const paymentStatus = orderData.payment_status || "pending";

    // Prepare payment date if payment is completed
    const paymentDate =
      paymentStatus === "paid" ? new Date().toISOString() : null;

    const { data, error } = await (supabase
      .from("orders") as any)
      .insert({
        ...orderData,
        total: orderData.total_amount, // Ensure 'total' is also populated
        status: orderData.status || "pending",
        is_immediate_payment: isImmediatePayment,
        discount_percentage: discountPercentage,
        original_amount: originalAmount,
        discounted_amount: discountedAmount,
        payment_status: paymentStatus,
        payment_date: paymentDate,
        order_confirmed: orderData.order_confirmed || false,
        order_confirmation_date: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) throw error;
    return { success: true, orderId: data?.id };

  } catch (error) {


    console.error("Error creating order:", error);
    return {
      success: false,
      error: "Failed to create order. Please try again.",
    };
  }
}

export async function getOrder(orderId: string): Promise<OrderDetails | null> {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      customer_name,
      phone,
      delivery_zone,
      location,
      items,
      total,
      status,
      created_at,
      is_immediate_payment,
      discount_percentage,
      original_amount,
      discounted_amount,
      payment_status,
      payment_date,
      order_confirmed,
      order_confirmation_date
    `,
    )
    .eq("id", orderId)
    .single();

  if (error || !data) {
    console.error("Error fetching order:", error);
    return null;
  }

  // Return the order data
  return data as unknown as OrderDetails;
}

export async function getAllOrders(): Promise<OrderDetails[]> {
  const { data, error } = await (supabase
    .from("orders") as any)
    .select(

      `
      id,
      customer_name,
      phone,
      delivery_zone,
      location,
      items,
      total,
      status,
      created_at,
      is_immediate_payment,
      discount_percentage,
      original_amount,
      discounted_amount,
      payment_status,
      payment_date,
      order_confirmed,
      order_confirmation_date
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }

  return (data || []).map((order: any) => ({
    id: order.id,
    customer_name: order.customer_name,
    items: order.items,
    total: order.total_amount || order.total,
    status: order.status,
    created_at: order.created_at,
    phone: order.phone || "",
    delivery_zone: order.delivery_zone || "",
    location: order.location || "",
    is_immediate_payment: order.is_immediate_payment || false,
    discount_percentage: order.discount_percentage || 0,
    original_amount: order.original_amount || order.total,
    discounted_amount: order.discounted_amount || order.total,
    payment_status: order.payment_status || "pending",
    payment_date: order.payment_date || "",
    order_confirmed: order.order_confirmed || false,
    order_confirmation_date: order.order_confirmation_date || "",
  }));
}

export async function confirmOrder(orderId: string): Promise<boolean> {
  try {
    const { error } = await (supabase
      .from("orders") as any)
      .update({
        order_confirmed: true,
        order_confirmation_date: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error confirming order:", error);
    return false;
  }
}

export async function updatePaymentStatus(
  orderId: string,
  paymentData: {
    is_immediate_payment?: boolean;
    payment_status?: string;
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the original order to calculate discount
    const order = await getOrder(orderId);
    if (!order) {
      console.error("Order not found:", orderId);
      return { success: false, error: "Order not found" };
    }

    // Calculate discount if immediate payment
    const isImmediatePayment = paymentData.is_immediate_payment || false;
    const discountPercentage = isImmediatePayment ? 5 : 0;
    const originalAmount = order.total;
    const discountedAmount = isImmediatePayment
      ? Number((originalAmount * (1 - discountPercentage / 100)).toFixed(2))
      : originalAmount;

    // Map 'completed' to 'paid' to match the database enum
    const paymentStatus =
      paymentData.payment_status === "completed"
        ? "paid"
        : paymentData.payment_status || "paid";

    const { error } = await (supabase
      .from("orders") as any)
      .update({
        is_immediate_payment: isImmediatePayment,
        discount_percentage: discountPercentage,
        original_amount: originalAmount,
        discounted_amount: discountedAmount,
        payment_status: paymentStatus,
        payment_date: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) {
      console.error("Supabase error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    console.error("Error updating payment status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
