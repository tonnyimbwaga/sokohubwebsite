"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { XCircleIcon } from "@heroicons/react/24/solid";

import { useCart } from "@/hooks/useCart";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import { getProductImageUrl } from "@/utils/product-images";

export default function CartPage() {
  const { items, total, removeFromCart, updateQuantity } = useCart();

  if (items.length === 0) {
    return (
      <div className="container py-16">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <HiOutlineShoppingBag className="mx-auto h-20 w-20 text-gray-400" />
          <h2 className="mt-6 text-2xl font-medium text-gray-900">
            Your cart is empty
          </h2>
          <p className="mt-3 text-gray-500 max-w-md mx-auto">
            Looks like you haven't added any items to your cart yet. Explore our
            products to find something you'll love!
          </p>
          <div className="mt-6">
            <Link href="/">
              <ButtonSecondary className="px-8 py-3 shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-2px]">
                Continue Shopping
              </ButtonSecondary>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container py-16">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white shadow-md rounded-lg p-4 mb-6 transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-square h-24 w-24 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-lg bg-gray-100 self-center sm:self-start shadow-sm hover:shadow transition-shadow duration-200">
                  <Image
                    src={
                      item.images && item.images.length > 0
                        ? getProductImageUrl(item.images[0])
                        : getProductImageUrl(null)
                    }
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-medium text-gray-800 hover:text-primary text-base sm:text-lg transition-colors duration-200 line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      {item.selectedSize && (
                        <p className="mt-1 text-xs sm:text-sm text-gray-500">
                          Size: {item.selectedSize}
                        </p>
                      )}
                    </div>
                    <p className="font-semibold text-primary text-base sm:text-lg ml-2 sm:ml-4 shrink-0">
                      KES {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2 sm:mt-0">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={`quantity-${item.id}`}
                        className="text-xs sm:text-sm text-gray-600"
                      >
                        Qty:
                      </label>
                      <select
                        id={`quantity-${item.id}`}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, Number(e.target.value))
                        }
                        className="rounded-md border-gray-300 py-1 sm:py-1.5 text-gray-900 shadow-sm focus:ring-2 focus:ring-primary-focus focus:border-primary-focus transition-all duration-200 cursor-pointer text-xs sm:text-sm"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-500 hover:text-red-600 transition-colors duration-200 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                      aria-label="Remove item"
                    >
                      <XCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <motion.div
          layout
          className="rounded-lg border border-gray-200 p-6 lg:col-span-4 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white"
        >
          <h2 className="text-xl font-medium text-gray-900 border-b border-gray-100 pb-2">
            Order Summary
          </h2>

          <div className="mt-6 space-y-4">
            <div className="flex justify-between">
              <p className="text-gray-600">Subtotal</p>
              <p className="font-medium">KES {total.toLocaleString()}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-600">Shipping</p>
              <p className="font-medium">Calculated at checkout</p>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <p className="text-base font-medium text-gray-900">Total</p>
                <p className="text-xl font-bold text-primary">
                  KES {total.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Link href="/checkout">
              <ButtonPrimary className="w-full transition-transform hover:translate-y-[-2px] shadow-md hover:shadow-lg">
                Proceed to Checkout
              </ButtonPrimary>
            </Link>
            <Link href="/">
              <ButtonSecondary className="w-full transition-transform hover:translate-y-[-2px]">
                Continue Shopping
              </ButtonSecondary>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
