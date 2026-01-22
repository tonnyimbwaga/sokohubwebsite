"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import StatusSelect from "@/components/Admin/StatusSelect";
import OrderItemDetails from "@/components/Admin/OrderItemDetails";
import { FiCopy } from "react-icons/fi";
import { toast } from "react-hot-toast";

interface OrderDetails {
  id: string;
  customer_name: string;
  phone: string;
  delivery_zone: string;
  location: string;
  items: any; // array of cart items
  total: number;
  status: string;
  created_at: string;
  mpesa_phone_number?: string;
  mpesa_transaction_code?: string;
  is_immediate_payment?: boolean;
  discount_percentage?: number;
  original_amount?: number;
  discounted_amount?: number;
  payment_status?: string;
  payment_date?: string;
  order_confirmed?: boolean;
  order_confirmation_date?: string;
}

const truncateTitle = (title: string, limit: number = 6) => {
  const words = title.split(" ");
  if (words.length > limit) {
    return words.slice(0, limit).join(" ") + "...";
  }
  return title;
};

export default function OrderDetailsPage() {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : null;

  const closeDetails = () => {
    setIsDetailsOpen(false);
  };

  // Function to copy order details
  const copyOrderDetails = async () => {
    if (!order) return;

    try {
      // Format items for copy with clickable links
      const itemsText =
        order.items
          ?.map((item: any) => {
            const productUrl = `https://toto.co.ke/products/${
              item.slug || "product"
            }`;
            return `• ${item.name} (${item.quantity}x) - ${productUrl}`;
          })
          .join("\n") || "No items";

      const orderText = `Order Details:
Customer: ${order.customer_name}
Phone: ${order.phone}
Delivery Location: ${order.delivery_zone} ${order.location}
Order ID: ${order.id}
Total: KES ${order.total.toFixed(2)}
Items:
${itemsText}`;

      await navigator.clipboard.writeText(orderText);
      toast.success("Order details copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy order details:", error);
      toast.error("Failed to copy order details");
    }
  };

  const { data: order, isLoading } = useQuery<OrderDetails | null>({
    queryKey: ["order", id],
    queryFn: async () => {
      if (!id) {
        throw new Error("Order ID is required");
      }

      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, customer_name, phone, delivery_zone, location, items, total, status, created_at, mpesa_phone_number, mpesa_transaction_code, is_immediate_payment, discount_percentage, original_amount, discounted_amount, payment_status, payment_date, order_confirmed, order_confirmation_date",
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching order details:", error);
        throw error;
      }

      return data as OrderDetails;
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Order not found
          </h2>
          <p className="mt-2 text-gray-600">
            The order you're looking for doesn't exist.
          </p>
          <Link
            href="/admin/orders"
            className="mt-4 inline-block text-primary hover:underline"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const truncateTitle = (title: string, limit: number = 6) => {
    const words = title.split(" ");
    if (words.length > limit) {
      return words.slice(0, limit).join(" ") + "...";
    }
    return title;
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="text-primary hover:underline mb-4 inline-flex items-center"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Orders
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2">
          <h1 className="text-2xl font-semibold text-gray-900">
            Order #{order.id.slice(0, 8)}
          </h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={copyOrderDetails}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              title="Copy order details"
            >
              <FiCopy className="h-4 w-4" />
              <span>Copy</span>
            </button>
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                order.payment_status === "paid"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {order.payment_status
                ? `${order.payment_status
                    .charAt(0)
                    .toUpperCase()}${order.payment_status.slice(1)}`
                : "Pending"}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(order.created_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Order Summary
              </h2>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Order Date
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(order.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Order ID
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">
                    {order.id}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Order Status
                  </dt>
                  <dd className="mt-1">
                    <StatusSelect
                      orderId={order.id}
                      currentStatus={order.status}
                      type="status"
                      options={[
                        { value: "pending", label: "Pending" },
                        { value: "confirmed", label: "Confirmed" },
                        { value: "processing", label: "Processing" },
                        { value: "shipped", label: "Shipped" },
                        { value: "delivered", label: "Delivered" },
                        { value: "cancelled", label: "Cancelled" },
                      ]}
                      className="w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Payment Status
                  </dt>
                  <dd className="mt-1">
                    <StatusSelect
                      orderId={order.id}
                      currentStatus={order.payment_status || "pending"}
                      type="paymentStatus"
                      options={[
                        { value: "pending", label: "Pending" },
                        { value: "paid", label: "Paid" },
                        { value: "completed", label: "Completed" },
                        { value: "failed", label: "Failed" },
                        { value: "refunded", label: "Refunded" },
                      ]}
                      className="w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    {order.payment_date && (
                      <span className="block sm:inline-block mt-1 sm:mt-0 sm:ml-2 text-xs text-gray-500">
                        on{" "}
                        {new Date(order.payment_date).toLocaleDateString(
                          "en-GB",
                          { day: "2-digit", month: "short", year: "numeric" },
                        )}
                      </span>
                    )}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">
                    Total Amount
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {order.is_immediate_payment &&
                    order.discount_percentage &&
                    order.discount_percentage > 0 ? (
                      <div className="flex items-baseline space-x-2">
                        <span className="line-through text-gray-500 text-base">
                          KES {order.original_amount?.toFixed(2)}
                        </span>
                        <span className="text-primary">
                          KES {order.discounted_amount?.toFixed(2)}
                        </span>
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full font-medium">
                          {order.discount_percentage}% OFF
                        </span>
                      </div>
                    ) : (
                      `KES ${order.total.toFixed(2)}`
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Order Items Card */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Order Items ({order.items?.length || 0})
              </h2>
            </div>
            <div className="p-0 sm:p-2 md:p-4">
              {/* Desktop Table View for Order Items */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items &&
                      Array.isArray(order.items) &&
                      order.items.map((item: any, index: number) => (
                        <tr key={item.id || index}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              {item.image && (
                                <div className="flex-shrink-0 h-12 w-12 mr-3">
                                  <img
                                    className="h-12 w-12 rounded-md object-cover"
                                    src={item.image}
                                    alt={item.name}
                                  />
                                </div>
                              )}
                              <div>
                                <a
                                  href={`/products/${item.slug || item.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-medium text-gray-900 hover:text-primary transition-colors truncate block"
                                  style={{ maxWidth: "250px" }}
                                  title={item.name}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {item.name}
                                </a>
                                {item.variant && (
                                  <div className="text-xs text-gray-500">
                                    {item.variant}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                            KES {item.price?.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium text-right">
                            KES {(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                  {order.is_immediate_payment &&
                    order.discount_percentage &&
                    order.discount_percentage > 0 &&
                    order.original_amount &&
                    order.discounted_amount && (
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td
                            colSpan={3}
                            className="px-4 py-3 text-right text-sm font-medium text-gray-600"
                          >
                            Subtotal
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-gray-800">
                            KES {order.original_amount.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td
                            colSpan={3}
                            className="px-4 py-3 text-right text-sm font-medium text-green-600"
                          >
                            Discount ({order.discount_percentage}%)
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-green-600">
                            - KES{" "}
                            {(
                              order.original_amount - order.discounted_amount
                            ).toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td
                            colSpan={3}
                            className="px-4 py-3 text-right text-base font-bold text-gray-700"
                          >
                            Grand Total
                          </td>
                          <td className="px-4 py-3 text-right text-base font-bold text-gray-900">
                            KES {order.discounted_amount.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                </table>
              </div>

              {/* Mobile Card View for Order Items */}
              <div className="block sm:hidden space-y-3 p-4">
                {order.items &&
                  Array.isArray(order.items) &&
                  order.items.map((item: any, index: number) => {
                    return (
                      <div
                        key={item.id || index}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          {item.image && (
                            <img
                              className="h-16 w-16 rounded-md object-cover flex-shrink-0"
                              src={item.image}
                              alt={item.name}
                            />
                          )}
                          <div className="flex-grow">
                            <a
                              href={`/products/${item.slug || item.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-semibold text-gray-800 hover:text-primary transition-colors block"
                              title={item.name}
                            >
                              {truncateTitle(item.name, 5)}
                            </a>
                            {item.variant && (
                              <p className="text-xs text-gray-500">
                                {item.variant}
                              </p>
                            )}
                            <p className="text-xs text-gray-600">
                              Unit Price: KES {item.price?.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            Quantity:{" "}
                            <span className="font-medium text-gray-800">
                              {item.quantity}
                            </span>
                          </span>
                          <span className="font-semibold text-gray-800">
                            KES {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                {order.is_immediate_payment &&
                  order.discount_percentage &&
                  order.discount_percentage > 0 &&
                  order.original_amount &&
                  order.discounted_amount && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="text-gray-800 font-medium">
                          KES {order.original_amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-green-600 mb-1">
                        <span className="font-medium">
                          Discount ({order.discount_percentage}%):
                        </span>
                        <span className="font-medium">
                          - KES{" "}
                          {(
                            order.original_amount - order.discounted_amount
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-base font-bold mt-2">
                        <span className="text-gray-700">Grand Total:</span>
                        <span className="text-gray-900">
                          KES {order.discounted_amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer & Shipping Info - takes 1/3 width on md and up, full width on mobile */}
        <div className="space-y-6">
          {/* Combined Customer & Shipping Information Card */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Customer & Shipping Information
              </h2>
            </div>
            <div className="p-6">
              <dl className="space-y-4">
                <div className="pb-4 border-b border-gray-100">
                  <dt className="text-sm font-medium text-gray-500">
                    Customer Name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {order.customer_name || "Guest"}
                  </dd>
                </div>

                <div className="pb-4 border-b border-gray-100">
                  <dt className="text-sm font-medium text-gray-500">
                    Contact Information
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {order.phone || "Not provided"}
                    {order.mpesa_phone_number &&
                      order.mpesa_phone_number !== order.phone && (
                        <div className="mt-1 text-sm text-gray-500">
                          M-Pesa: {order.mpesa_phone_number}
                        </div>
                      )}
                    {order.mpesa_transaction_code && (
                      <div className="mt-1 text-sm">
                        <span className="font-medium">Transaction:</span>{" "}
                        <span className="font-mono text-gray-900">
                          {order.mpesa_transaction_code}
                        </span>
                      </div>
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Shipping Address
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 space-y-1">
                    {order.location && <div>{order.location}</div>}
                    {order.delivery_zone && (
                      <div className="text-gray-600">
                        {order.delivery_zone} Zone
                      </div>
                    )}
                    {!order.location && !order.delivery_zone && (
                      <div className="text-gray-500 italic">
                        No shipping information provided
                      </div>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Order Item Details Modal */}
      <OrderItemDetails
        isOpen={isDetailsOpen}
        onClose={closeDetails}
        item={selectedItem}
      />
    </div>
  );
}
