"use client";

import { Dialog, Transition } from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { FiX } from "react-icons/fi";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";

import { useCart } from "@/hooks/useCart";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import { getProductImageUrl } from "@/utils/product-images";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSlideOver({ isOpen, onClose }: Props) {
  const { items, total, removeFromCart, updateQuantity } = useCart();

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          Shopping cart
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={onClose}
                          >
                            <span className="absolute -inset-0.5" />
                            <span className="sr-only">Close panel</span>
                            <FiX className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="flow-root">
                          <AnimatePresence mode="popLayout">
                            {items.length > 0 ? (
                              <ul role="list" className="space-y-4">
                                {items.map((item) => (
                                  <motion.li
                                    key={item.id}
                                    className="flex flex-col sm:flex-row gap-3 sm:gap-4 bg-white shadow-md rounded-lg p-3 sm:p-4 transition-shadow hover:shadow-lg"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 shadow-sm hover:shadow transition-shadow duration-200 self-center sm:self-start">
                                      <Image
                                        src={getProductImageUrl(item.images?.[0], { width: 120, quality: 75 })}
                                        alt={item.name}
                                        className="h-full w-full object-contain p-1"
                                        width={120}
                                        height={120}
                                        unoptimized={true} // Add unoptimized to bypass Next.js image optimization if needed for dynamic Supabase URLs
                                      />

                                    </div>

                                    <div className="ml-0 sm:ml-4 flex flex-1 flex-col gap-2">
                                      <div>
                                        <div className="flex justify-between text-sm sm:text-base font-medium text-gray-800 items-start">
                                          <h3 className="line-clamp-2">
                                            <Link
                                              href={`/products/${item.slug}`}
                                              onClick={onClose}
                                              className="hover:text-primary transition-colors"
                                            >
                                              {item.name}
                                            </Link>
                                          </h3>
                                          <p className="ml-2 sm:ml-4 font-semibold text-primary shrink-0">
                                            KES{" "}
                                            {(
                                              item.price * item.quantity
                                            ).toLocaleString()}
                                          </p>
                                        </div>
                                        <div className="flex flex-col gap-1 mt-1">
                                          {item.selectedSize && (
                                            <p className="text-xs sm:text-sm text-gray-500">
                                              Size: <span className="font-medium text-gray-700">{item.selectedSize}</span>
                                            </p>
                                          )}
                                        </div>

                                      </div>
                                      <div className="flex flex-1 items-center sm:items-end justify-between text-xs sm:text-sm">
                                        <div className="flex items-center gap-1 sm:gap-2">
                                          <label
                                            htmlFor={`slideover-quantity-${item.id}`}
                                            className="text-gray-600"
                                          >
                                            Qty:
                                          </label>
                                          <select
                                            id={`slideover-quantity-${item.id}`}
                                            value={item.quantity}
                                            onChange={(e) =>
                                              updateQuantity(
                                                item.id,
                                                Number(e.target.value),
                                              )
                                            }
                                            className="rounded-md border-gray-300 py-1 text-gray-900 shadow-sm focus:ring-1 focus:ring-primary-focus focus:border-primary-focus transition-all duration-200 cursor-pointer"
                                          >
                                            {[
                                              1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                                            ].map((num) => (
                                              <option key={num} value={num}>
                                                {num}
                                              </option>
                                            ))}
                                          </select>
                                        </div>

                                        <motion.button
                                          type="button"
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          className="text-gray-500 hover:text-red-600 transition-colors duration-200 p-1 rounded-full focus:outline-none focus:ring-1 focus:ring-red-500 focus:ring-offset-1"
                                          onClick={() =>
                                            removeFromCart(item.id)
                                          }
                                          aria-label="Remove item"
                                        >
                                          <XCircleIcon className="h-5 w-5" />
                                        </motion.button>
                                      </div>
                                    </div>
                                  </motion.li>
                                ))}
                              </ul>
                            ) : (
                              <motion.div
                                className="text-center py-12"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <HiOutlineShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                  Your cart is empty
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                  Start adding some items to your cart!
                                </p>
                                <div className="mt-6">
                                  <ButtonSecondary onClick={onClose}>
                                    Continue Shopping
                                  </ButtonSecondary>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    {items.length > 0 && (
                      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <p>Subtotal</p>
                          <p>KES {total.toLocaleString()}</p>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500">
                          Shipping and taxes calculated at checkout.
                        </p>
                        <div className="mt-6 space-y-3">
                          <Link href="/checkout" onClick={onClose}>
                            <ButtonPrimary className="w-full">
                              Checkout
                            </ButtonPrimary>
                          </Link>
                          <ButtonSecondary className="w-full" onClick={onClose}>
                            Continue Shopping
                          </ButtonSecondary>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
