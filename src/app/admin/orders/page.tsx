"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import StatusSelect from "@/components/Admin/StatusSelect";
import { FiCopy, FiEye, FiShoppingBag } from "react-icons/fi";
import { toast } from "react-hot-toast";

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  delivery_zone: string;
  location: string;
  items: any[];
  total: number;
  status: string;
  created_at: string;
  is_immediate_payment: boolean;
  discount_percentage: number;
  original_amount: number;
  discounted_amount: number;
  order_confirmed: boolean;
}

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const perPage = 10;

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["orders", page, search],
    queryFn: async () => {
      try {
        let query = supabase
          .from("orders")
          .select(
            "id, customer_name, phone, delivery_zone, location, items, total, status, created_at, is_immediate_payment, discount_percentage, original_amount, discounted_amount, order_confirmed",
          )
          .range((page - 1) * perPage, page * perPage - 1)
          .order("created_at", { ascending: false });

        if (search) {
          query = query.or(
            `id.ilike.%${search}%,customer_name.ilike.%${search}%`,
          );
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching orders:", error);
          throw error;
        }

        return data as Order[];
      } catch (error) {
        console.error("Error in orders query:", error);
        throw error;
      }
    },
  });

  const { data: totalCount } = useQuery({
    queryKey: ["orders-count", search],
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select("*", { count: "exact", head: true });

      if (search) {
        query = query.or(
          `id.ilike.%${search}%,customer_name.ilike.%${search}%`,
        );
      }

      const { count, error } = await query;

      if (error) {
        console.error("Error counting orders:", error);
        throw error;
      }

      return count;
    },
  });

  const totalPages = Math.ceil((totalCount || 0) / perPage);

  // Function to copy order details
  const copyOrderDetails = async (order: any) => {
    try {
      // Format items for copy with clickable links
      const itemsText =
        order.items
          ?.map((item: any) => {
            const productUrl = `https://sokohubkenya.com/products/${item.slug || "product"
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

  // Function to get order items summary
  const getOrderItemsSummary = (items: any[]) => {
    if (!items || items.length === 0) return "No items";

    const itemCount = items.length;
    const totalQuantity = items.reduce(
      (sum, item) => sum + (item.quantity || 1),
      0,
    );

    return `${itemCount} item${itemCount > 1 ? "s" : ""
      } (${totalQuantity} total)`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Orders
          </h1>
          <p className="mt-2 text-slate-600">
            View and manage all customer orders
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search orders by ID or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200/50 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Orders Display */}
      {isLoading ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-200/30 p-8">
          <div className="text-center text-slate-600">Loading orders...</div>
        </div>
      ) : orders?.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-200/30 p-8">
          <div className="text-center text-slate-600">No orders found</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {orders?.map((order) => (
            <div
              key={order.id}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-200/30 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-200/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-2xl bg-slate-100/80 p-3 shadow-sm">
                      <FiShoppingBag className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-lg font-bold text-slate-900 hover:text-slate-700 transition-colors duration-200"
                      >
                        #{order.id.substring(0, 8)}...
                      </Link>
                      <p className="text-sm text-slate-500">
                        {new Date(order.created_at).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                  </div>
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
                    className="min-w-[120px]"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Customer Info */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-600">
                      Customer:
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {order.customer_name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-600">
                      Phone:
                    </span>
                    <span className="text-sm text-slate-700">
                      {order.phone}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-semibold text-slate-600">
                      Location:
                    </span>
                    <span className="text-sm text-slate-700 text-right max-w-[60%]">
                      {order.delivery_zone} {order.location}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="pt-3 border-t border-slate-200/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-600">
                      Items:
                    </span>
                    <span className="text-sm text-slate-700">
                      {getOrderItemsSummary(order.items)}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-24 overflow-y-auto">
                    {order.items
                      ?.slice(0, 3)
                      .map((item: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-xs"
                        >
                          <Link
                            href={`/products/${item.slug || "product"}`}
                            target="_blank"
                            className="text-slate-600 truncate max-w-[70%] hover:text-slate-900 hover:underline transition-colors duration-200"
                            title={item.name}
                          >
                            {item.name?.length > 25
                              ? `${item.name.substring(0, 25)}...`
                              : item.name}
                          </Link>
                          <span className="text-slate-700 font-medium">
                            x{item.quantity}
                          </span>
                        </div>
                      ))}
                    {order.items?.length > 3 && (
                      <div className="text-xs text-slate-500 italic">
                        +{order.items.length - 3} more items
                      </div>
                    )}
                  </div>
                </div>

                {/* Total */}
                <div className="pt-3 border-t border-slate-200/30">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-600">
                      Total:
                    </span>
                    <span className="text-lg font-bold text-slate-900">
                      {order.is_immediate_payment &&
                        order.discount_percentage > 0 ? (
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className="line-through text-slate-400 text-sm">
                              KES {order.original_amount?.toFixed(2)}
                            </span>
                            <span className="text-emerald-600">
                              KES {order.discounted_amount?.toFixed(2)}
                            </span>
                          </div>
                          <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                            {order.discount_percentage}% off
                          </span>
                        </div>
                      ) : (
                        `KES ${order.total.toFixed(2)}`
                      )}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-200/30">
                  <div className="flex items-center justify-between space-x-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all duration-200 font-semibold"
                    >
                      <FiEye className="h-4 w-4" />
                      <span>View Details</span>
                    </Link>
                    <button
                      onClick={() => copyOrderDetails(order)}
                      className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                      title="Copy order details"
                    >
                      <FiCopy className="h-4 w-4" />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200/50 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-3xl shadow-lg border border-slate-200/30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-200 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="relative inline-flex items-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
