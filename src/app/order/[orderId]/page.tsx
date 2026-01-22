import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import type { Database } from "@/types/supabase";
import { getOrder } from "@/lib/orders";
import { getProductImageUrl } from "@/utils/product-images";
import OrderPurchaseTracker from "@/components/OrderPurchaseTracker";

interface OrderItem {
  id: string | number;
  name: string;
  quantity: number;
  price: number;
  size?: string;
  images?: { url: string }[];
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

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { orderId } = await params;
  const { new_purchase } = await searchParams;
  const isNewPurchase = new_purchase === "true";

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const order: OrderDetails | null = await getOrder(orderId);

  if (!order) {
    console.error("Error fetching order:");
    return notFound();
  }

  // For admins, show full order details
  if (session?.user?.user_metadata?.role === "admin") {
    return (
      <div className="container max-w-3xl py-16">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold">Order Details</h1>
          <p className="mt-2 text-gray-600">
            Order ID: <span className="font-medium">{order.id}</span>
          </p>
        </div>

        <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold">Customer Details</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Name:</dt>
                <dd>{order.customer_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Phone:</dt>
                <dd>{order.phone}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Delivery Zone:</dt>
                <dd>
                  {order.delivery_zone === "nairobi"
                    ? "Within Nairobi"
                    : "Outside Nairobi"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Location:</dt>
                <dd>{order.location}</dd>
              </div>
            </dl>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-lg font-semibold">Order Summary</h2>
            <div className="mt-4 space-y-4">
              {order.items.map((item: OrderItem) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={getProductImageUrl(item.images?.[0])}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div>
                      <Link
                        href={`/products/${item.id}`}
                        className="font-medium text-primary underline hover:text-primary/80"
                        title={`View product: ${item.name}`}
                      >
                        {item.name}
                      </Link>
                      {/* SKU removed as per user preference */}
                      {item.size && (
                        <p className="text-sm text-gray-500">
                          Size: {item.size}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                      <p className="font-medium">
                        KES {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2 border-t border-gray-100 pt-4">
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span className="text-primary">
                  KES {order.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Determine if it's a new purchase from the server-side prop

  // For non-admins, show a simplified view
  return (
    <>
      <OrderPurchaseTracker order={order} isNewPurchase={isNewPurchase} />
      <div className="container max-w-3xl py-16">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-3 leading-tight">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
            Thank you for your order. We will contact you shortly to arrange for
            delivery.
          </p>

          <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 w-full max-w-2xl">
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-500">Payment Status:</span>
              <span
                className={`font-semibold px-3 py-1 rounded-full text-sm ${
                  order.status === "paid" || order.status === "confirmed"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {order.status === "paid" || order.status === "confirmed"
                  ? "Paid"
                  : "Pending Payment"}
                {/* Assuming 'confirmed' implies paid for this context, or adjust based on actual status flow */}
              </span>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Items Ordered
              </h3>
              {order.items.map((item: OrderItem) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={getProductImageUrl(item.images?.[0])}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div>
                      <Link
                        href={`/products/${item.id}`}
                        className="font-medium text-primary underline hover:text-primary/80"
                        title={`View product: ${item.name}`}
                      >
                        {item.name}
                      </Link>
                      {/* SKU removed as per user preference */}
                      {item.size && (
                        <p className="text-sm text-gray-500">
                          Size: {item.size}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                      <p className="font-medium">
                        KES {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/"
                className="w-full sm:w-auto px-8 py-3 text-lg bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Continue Shopping
              </Link>
              <p className="mt-4 text-sm text-gray-500">
                If you have any questions, please contact us at{" "}
                <a
                  href="tel:+254714645215"
                  className="text-primary hover:underline"
                >
                  +254 714 645215
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
