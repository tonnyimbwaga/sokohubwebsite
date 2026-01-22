"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaArrowLeft,
  FaArrowRight,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";
import toast from "react-hot-toast";

import type { CartItem } from "@/hooks/useCart";
import { useCart } from "@/hooks/useCart";
import { createOrder } from "@/lib/orders";
import FormItem from "@/shared/FormItem";
import Radio from "@/shared/Radio/Radio";
import Input from "@/shared/Input/Input";

interface OrderDetails {
  deliveryZone: "nairobi" | "outside" | "";
  location: string;
  name: string;
  phone: string;
  confirmPhone: string;
  transactionCode: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
}

const CheckoutModal = ({ isOpen, onClose, items, total }: Props) => {
  const { clearCart } = useCart();
  const [orderComplete, setOrderComplete] = useState(false);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    deliveryZone: "",
    location: "",
    name: "",
    phone: "",
    confirmPhone: "",
    transactionCode: "",
  });
  const [errors, setErrors] = useState<Partial<OrderDetails>>({});

  const validateStep = (currentStep: number) => {
    const newErrors: Partial<OrderDetails> = {};

    if (currentStep === 1) {
      if (!orderDetails.deliveryZone) {
        newErrors.deliveryZone = "";
      }
      if (!orderDetails.location) {
        newErrors.location = "Please enter your location";
      }
    } else if (currentStep === 2) {
      if (!orderDetails.name) {
        newErrors.name = "Please enter your name";
      }
      if (!orderDetails.phone) {
        newErrors.phone = "Please enter your phone number";
      } else if (!/^(?:\+254|0)\d{9}$/.test(orderDetails.phone)) {
        newErrors.phone = "Please enter a valid Kenyan phone number";
      }
      if (orderDetails.phone !== orderDetails.confirmPhone) {
        newErrors.confirmPhone = "Phone numbers do not match";
      }
    } else if (currentStep === 3) {
      // No validation needed for order summary step
    } else if (currentStep === 4) {
      if (!orderDetails.transactionCode) {
        newErrors.transactionCode = "Please enter your M-Pesa transaction code";
      } else if (!/^[a-zA-Z0-9]{9,}$/.test(orderDetails.transactionCode)) {
        newErrors.transactionCode =
          "Transaction code must be alphanumeric and at least 9 characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    // Validate transaction code in step 4
    if (!validateStep(4)) {
      return;
    }

    setLoading(true);
    try {
      // Create order in Supabase with transaction code
      const { success, orderId, error } = await createOrder({
        customer_name: orderDetails.name,
        phone: orderDetails.phone,
        delivery_zone: orderDetails.deliveryZone as "nairobi" | "outside",
        location: orderDetails.location,
        items,
        total,
        mpesa_transaction_code: orderDetails.transactionCode,
      });

      if (!success || !orderId) {
        throw new Error(error || "Failed to create order");
      }

      // Format WhatsApp message
      const message =
        `🛍️ New Order from ${orderDetails.name}\n\n` +
        `Order #: ${orderId}\n` +
        `M-Pesa Code: ${orderDetails.transactionCode}\n\n` +
        `Please confirm my order. Thank you!`;

      // Open WhatsApp
      window.open(
        `https://wa.me/254113794389?text=${encodeURIComponent(message)}`,
        "_blank",
      );

      // Clear the cart
      clearCart();
      setOrderComplete(true);
      toast.success("Order placed successfully!");

      // Automatic redirection after 3 seconds
      setTimeout(() => {
        window.location.href = "/"; // Redirect to homepage
      }, 3000);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => !loading && onClose()}
      className="relative z-50"
    >
      {/* Order Complete Overlay */}
      {orderComplete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-primary/10 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 12 }}
            className="rounded-xl bg-white px-10 py-12 text-center shadow-2xl"
          >
            <FaCheckCircle className="mx-auto mb-6 text-6xl text-green-500" />
            <h2 className="mb-4 text-3xl font-bold text-primary">
              Thank you for your order!
            </h2>
            <p className="mb-3 text-xl">
              We've received your order and are processing it.
            </p>
            <p className="mb-6 text-gray-600">
              You will be redirected to the homepage shortly...
            </p>
            <div className="mx-auto h-2 w-64 overflow-hidden rounded-full bg-gray-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 3 }}
                className="h-full bg-primary"
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Full-screen container */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="relative w-full max-w-2xl rounded-xl bg-white">
            {/* Close button */}
            {!loading && (
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="text-xl" />
              </button>
            )}

            {/* Content */}
            <div className="p-6">
              {/* Steps indicator */}
              <div className="mb-8">
                <div className="relative mx-auto flex max-w-xs justify-between">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                        i <= step
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {i}
                    </div>
                  ))}
                  <div className="absolute top-4 -z-0 h-[2px] w-full bg-gray-200">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${((step - 1) / 3) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Step content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {step === 1 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Delivery Zone</h3>
                      <div className="space-y-4">
                        <FormItem
                          label="Select your delivery zone"
                          error={errors.deliveryZone}
                        >
                          <div className="space-y-2">
                            <Radio
                              name="delivery-zone"
                              label="Within Nairobi"
                              checked={orderDetails.deliveryZone === "nairobi"}
                              onChange={() =>
                                setOrderDetails({
                                  ...orderDetails,
                                  deliveryZone: "nairobi",
                                  location: "",
                                })
                              }
                            />
                            <Radio
                              name="delivery-zone"
                              label="Outside Nairobi"
                              checked={orderDetails.deliveryZone === "outside"}
                              onChange={() =>
                                setOrderDetails({
                                  ...orderDetails,
                                  deliveryZone: "outside",
                                  location: "",
                                })
                              }
                            />
                          </div>
                        </FormItem>

                        {orderDetails.deliveryZone && (
                          <FormItem
                            label={
                              orderDetails.deliveryZone === "nairobi"
                                ? "Enter your Nairobi neighborhood"
                                : "Enter your city/town in Kenya"
                            }
                            error={errors.location}
                          >
                            <Input
                              value={orderDetails.location}
                              onChange={(e) =>
                                setOrderDetails({
                                  ...orderDetails,
                                  location: e.target.value,
                                })
                              }
                              placeholder={
                                orderDetails.deliveryZone === "nairobi"
                                  ? "e.g., Westlands, Kilimani"
                                  : "e.g., Mombasa, Nakuru"
                              }
                            />
                          </FormItem>
                        )}
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">
                        Contact Information
                      </h3>
                      <div className="space-y-4">
                        <FormItem label="Your Name" error={errors.name}>
                          <Input
                            value={orderDetails.name}
                            onChange={(e) =>
                              setOrderDetails({
                                ...orderDetails,
                                name: e.target.value,
                              })
                            }
                            placeholder="Enter your full name"
                          />
                        </FormItem>

                        <FormItem label="Phone Number" error={errors.phone}>
                          <Input
                            value={orderDetails.phone}
                            onChange={(e) =>
                              setOrderDetails({
                                ...orderDetails,
                                phone: e.target.value,
                              })
                            }
                            placeholder="e.g., +254712345678"
                          />
                        </FormItem>

                        <FormItem
                          label="Confirm Phone Number"
                          error={errors.confirmPhone}
                        >
                          <Input
                            value={orderDetails.confirmPhone}
                            onChange={(e) =>
                              setOrderDetails({
                                ...orderDetails,
                                confirmPhone: e.target.value,
                              })
                            }
                            placeholder="Re-enter your phone number"
                          />
                        </FormItem>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Order Summary</h3>
                      <div className="space-y-4">
                        <div className="rounded-lg bg-gray-50 p-4">
                          <h4 className="font-medium">Delivery Details</h4>
                          <dl className="mt-2 space-y-1 text-sm">
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Zone:</dt>
                              <dd>
                                {orderDetails.deliveryZone === "nairobi"
                                  ? "Within Nairobi"
                                  : "Outside Nairobi"}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Location:</dt>
                              <dd>{orderDetails.location}</dd>
                            </div>
                          </dl>
                        </div>

                        {/* Contact Details */}
                        <div className="rounded-lg bg-gray-50 p-4">
                          <h4 className="font-medium">Contact Details</h4>
                          <dl className="mt-2 space-y-1 text-sm">
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Name:</dt>
                              <dd>{orderDetails.name}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Phone:</dt>
                              <dd>{orderDetails.phone}</dd>
                            </div>
                          </dl>
                        </div>

                        {/* Order Details */}
                        <div className="rounded-lg bg-gray-50 p-4">
                          <h4 className="font-medium">Order Details</h4>
                          <div className="mt-2 space-y-2">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between text-sm"
                              >
                                <span>
                                  {item.name} (x{item.quantity})
                                </span>
                                <span className="font-medium">
                                  Ksh.{" "}
                                  {(
                                    item.price * item.quantity
                                  ).toLocaleString()}
                                </span>
                              </div>
                            ))}
                            <div className="border-t border-gray-200 pt-2">
                              <div className="flex justify-between font-medium">
                                <span>Total:</span>
                                <span>Ksh. {total.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Payment</h3>
                      <div className="space-y-4">
                        {/* M-Pesa Instructions */}
                        <div className="rounded-lg bg-gray-50 p-4">
                          <h4 className="font-medium">Lipa na M-Pesa</h4>
                          <div className="mt-2 space-y-2 text-sm">
                            <p>1. Go to M-Pesa on your phone</p>
                            <p>2. Select "Lipa na M-Pesa"</p>
                            <p>3. Select "Pay Bill"</p>
                            <p>
                              4. Enter Business Number:{" "}
                              <span className="font-semibold">123456</span>
                            </p>
                            <p>
                              5. Enter Account Number:{" "}
                              <span className="font-semibold">TOTO</span>
                            </p>
                            <p>
                              6. Enter Amount:{" "}
                              <span className="font-semibold">
                                Ksh. {total.toLocaleString()}
                              </span>
                            </p>
                            <p>7. Enter your M-Pesa PIN</p>
                            <p>
                              8. Confirm payment and enter the transaction code
                              below
                            </p>
                          </div>
                        </div>

                        {/* Transaction Code Input */}
                        <FormItem
                          label="M-Pesa Transaction Code"
                          error={errors.transactionCode}
                        >
                          <Input
                            value={orderDetails.transactionCode}
                            onChange={(e) =>
                              setOrderDetails({
                                ...orderDetails,
                                transactionCode: e.target.value.toUpperCase(),
                              })
                            }
                            placeholder="e.g., PXL12345678"
                            className="uppercase"
                          />
                        </FormItem>

                        {/* Order Summary */}
                        <div className="rounded-lg bg-gray-50 p-4">
                          <h4 className="font-medium">Order Summary</h4>
                          <div className="mt-2 space-y-2">
                            <div className="flex justify-between font-medium">
                              <span>Total Amount:</span>
                              <span>Ksh. {total.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="mt-8 flex justify-between">
                {step > 1 && !loading && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  >
                    <FaArrowLeft />
                    Back
                  </button>
                )}

                {step < 4 && !loading && (
                  <button
                    onClick={() => handleNext()}
                    className="ml-auto flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-semibold text-white hover:bg-primary-dark"
                  >
                    Next
                    <FaArrowRight />
                  </button>
                )}

                {step === 4 && (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="ml-auto flex items-center gap-2 rounded-lg bg-green-500 px-6 py-2 font-semibold text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Processing...
                      </>
                    ) : (
                      <>Complete Order</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};
export default CheckoutModal;
