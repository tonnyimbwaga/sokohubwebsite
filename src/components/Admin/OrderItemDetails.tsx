"use client";

import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";

interface OrderItemDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string | null;
    description?: string | null;
    options?: Record<string, any>;
  } | null;
}

export default function OrderItemDetails({
  isOpen,
  onClose,
  item,
}: OrderItemDetailsProps) {
  if (!item) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-xl relative">
          <button
            type="button"
            className="absolute right-4 top-4 rounded-md text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <X className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900"
              >
                {item.name}
              </Dialog.Title>

              <div className="mt-4">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={400}
                      height={400}
                      className="h-full w-full object-cover object-center"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Price:</span>{" "}
                    {formatCurrency(item.price)}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Quantity:</span>{" "}
                    {item.quantity}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Total:</span>{" "}
                    {formatCurrency(item.price * item.quantity)}
                  </p>

                  {item.description && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">
                        Description:
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.description}
                      </p>
                    </div>
                  )}

                  {item.options && Object.keys(item.options).length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">
                        Options:
                      </p>
                      <ul className="text-sm text-gray-500">
                        {Object.entries(item.options).map(([key, value]) => (
                          <li key={key}>
                            {key}: {String(value)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
