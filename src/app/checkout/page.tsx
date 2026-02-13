"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
// Using Heroicons for a more modern feel, aligned with Material Design principles
import {
  ChevronLeftIcon,
  MapPinIcon,
  UserCircleIcon,
  CheckCircleIcon as SolidCheckCircleIcon,
  TruckIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";

import { useCart } from "@/hooks/useCart";
import type { CartItem } from "@/data/types"; // CartItem is from global types
import { createOrder } from "@/lib/orders";
import OptimizedImage from "@/components/OptimizedImage";
import { getProductImageUrl as getImageUrl } from "@/utils/product-images"; // Corrected import alias
// import { Radio } from '@/components/ui/Radio'; // Temporarily commented out

// Define OrderDetails and OrderErrors locally as they are specific to this page
interface OrderDetails {
  deliveryZone?: "nairobi" | "outside" | "";
  deliveryLocation?: string;
  nairobiSpecificLocation?: string;
  outsideNairobiLocation?: string;
  name?: string;
  email?: string;
  phone?: string;
  confirmPhone?: string;
  orderId?: string;
}

// Re-assert OrderErrors type definition to include an optional 'general' property
type OrderErrors = Partial<Record<keyof OrderDetails, string | undefined>> & {
  general?: string;
};

// Define MotionWrapper outside the CheckoutPage component
interface MotionWrapperProps {
  children: React.ReactNode;
  motionKey: string | number;
  animationDirection: number; // 1 for next, -1 for prev
}

const MotionWrapper: React.FC<MotionWrapperProps> = ({
  children,
  motionKey,
  animationDirection,
}) => (
  <motion.div
    key={motionKey}
    initial={{ opacity: 0, x: animationDirection === 1 ? 150 : -150 }} // Reduced distance
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: animationDirection === 1 ? -150 : 150 }} // Reduced distance
    transition={{ type: "tween", ease: "easeOut", duration: 0.25 }} // Adjusted transition
    className="w-full"
  >
    {children}
  </motion.div>
);

const PROGRESS_STEPS = [
  { id: 1, title: "Delivery Options", icon: MapPinIcon },
  { id: 2, title: "Contact Information", icon: UserCircleIcon },
  { id: 3, title: "Confirm Order", icon: SolidCheckCircleIcon },
];

interface OrderSummaryProps {
  cartItems: CartItem[];
  totalAmount: number;
}

// Local helper function to extract the correct image URL from cart items
function extractImageUrl(item: CartItem): string {
  return getImageUrl(item.images?.[0] || (item as any).image);
}



// Helper function to truncate text by words
const truncateWords = (text: string | undefined, limit: number): string => {
  if (!text) return "";
  const words = text.split(" ");
  if (words.length > limit) {
    return words.slice(0, limit).join(" ") + "...";
  }
  return text;
};

const OrderSummaryComponent: React.FC<OrderSummaryProps> = ({
  cartItems,
  totalAmount,
}) => (
  <div className="bg-primary bg-opacity-5 p-6 md:p-8 rounded-xl shadow-lg">
    <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-4">
      Order Summary
    </h2>
    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
      {cartItems.length > 0 ? (
        cartItems.map((item, index) => (
          <div
            key={item.id || index}
            className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0"
          >
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <OptimizedImage
                src={extractImageUrl(item)}
                alt={item.name || "Product Image"}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex-grow">
              <h3 className="text-sm font-medium text-gray-800">
                {truncateWords(item.name, 5)}
              </h3>
              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-semibold text-primary whitespace-nowrap">
              Ksh {(item.price * (item.quantity || 1)).toLocaleString()}
            </p>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-500 py-4">Your cart is empty.</p>
      )}
    </div>
    {cartItems.length > 0 && (
      <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Subtotal</span>
          <span>Ksh {totalAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Shipping within Nairobi</span>
          <span>Ksh 400</span>
        </div>
        <div className="flex justify-between items-center text-lg font-semibold text-gray-800 pt-2 border-t border-gray-100">
          <span>Total</span>
          <span>Ksh {(totalAmount + 400).toLocaleString()}</span>
        </div>
      </div>
    )}
  </div>
);


const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const { items: cart, total, clearCart, isCartLoading } = useCart();
  const formRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const initialOrderDetails: OrderDetails = {
    deliveryZone: "",
    deliveryLocation: "",
    nairobiSpecificLocation: "",
    outsideNairobiLocation: "",
    name: "",
    phone: "",
    confirmPhone: "",
    orderId: undefined,
  };
  const [orderDetails, setOrderDetails] =
    useState<OrderDetails>(initialOrderDetails);
  const [errors, setErrors] = useState<OrderErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [animationDirection, setAnimationDirection] = useState(1); // 1 for next, -1 for prev

  // Scroll to form on mobile, top on desktop
  useEffect(() => {
    if (formRef.current) {
      if (window.innerWidth < 768) {
        window.scrollTo({
          top: formRef.current.offsetTop - 20,
          behavior: "smooth",
        });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [step]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setOrderDetails((prev: OrderDetails) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific location if delivery zone changes
    if (name === "deliveryZone") {
      setOrderDetails((prev: OrderDetails) => ({
        ...prev,
        nairobiSpecificLocation: "",
        outsideNairobiLocation: "",
        // Always set deliveryLocation to home_office_delivery for Nairobi
        deliveryLocation: value === "nairobi" ? "home_office_delivery" : "",
      }));
    }

    if (errors[name as keyof OrderDetails]) {
      setErrors((prev: OrderErrors) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateStep1 = (details: OrderDetails): Partial<OrderErrors> => {
    const newErrors: Partial<OrderErrors> = {};
    // Validate delivery zone
    if (!details.deliveryZone) {
      newErrors.deliveryZone = "Please select a delivery zone.";
    }
    // Validate specific location for Nairobi
    if (
      details.deliveryZone === "nairobi" &&
      !details.nairobiSpecificLocation?.trim()
    ) {
      newErrors.nairobiSpecificLocation =
        "Please provide your specific location in Nairobi (e.g., street name, building, landmark).";
    }
    if (
      details.deliveryZone === "outside" &&
      !details.outsideNairobiLocation?.trim()
    ) {
      newErrors.outsideNairobiLocation =
        "Please provide your location outside Nairobi.";
    }

    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors: OrderErrors = {};
    if (!orderDetails.name?.trim()) {
      newErrors.name = "Full name is required.";
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (orderDetails.email?.trim() && !emailRegex.test(orderDetails.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    const kenyanPhoneRegex = /^(?:\+254|0)(?:1|7)\d{8}$/;
    if (!orderDetails.phone?.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!kenyanPhoneRegex.test(orderDetails.phone.trim())) {
      newErrors.phone =
        "Invalid Kenyan phone. Use format +254X XX XXX XXX, 07XXXXXXXX or 01XXXXXXXX.";
    }
    if (!orderDetails.confirmPhone?.trim()) {
      newErrors.confirmPhone = "Please confirm your phone number.";
    } else if (
      orderDetails.phone?.trim() !== orderDetails.confirmPhone?.trim()
    ) {
      newErrors.confirmPhone = "Phone numbers do not match.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  // Navigation functions
  // Note: These functions are used in the JSX but the linter doesn't detect it
  // @ts-ignore - False positive for unused functions
  const handleNextStep = () => {
    if (step === 1) {
      const step1Errors = validateStep1(orderDetails);
      setErrors(step1Errors);
      if (Object.keys(step1Errors).length > 0) return;
      setAnimationDirection(1);
      setStep(2);
    } else if (step === 2) {
      const step2Valid = validateStep2();
      if (!step2Valid) return;
      setAnimationDirection(1);
      setStep(3);
    } else if (step === PROGRESS_STEPS.length) {
      handleSubmitOrder();
    }
  };

  // @ts-ignore - False positive for unused functions
  const handlePrevStep = () => {
    setAnimationDirection(-1);
    setStep((prev) => prev - 1);
  };

  const handleSubmitOrder = async () => {
    const step1Errors = validateStep1(orderDetails);
    const step2Errors = validateStep2(); // Assuming validateStep2 updates errors state internally or returns them

    if (Object.keys(step1Errors).length > 0 || !step2Errors) {
      setErrors((prev) => ({
        ...prev,
        ...step1Errors,
        general: "Please correct the errors before submitting.",
      }));
      // Force user to the first step with errors if step 1 is invalid
      if (Object.keys(step1Errors).length > 0) {
        setStep(1);
      } else if (!step2Errors) {
        setStep(2);
      }
      return;
    }
    setIsLoading(true);
    setErrors({});
    try {
      let locationDetail = "";
      if (orderDetails.deliveryZone === "nairobi") {
        locationDetail =
          orderDetails.nairobiSpecificLocation ||
          "Nairobi (Specific location not provided)";
      } else {
        locationDetail =
          orderDetails.outsideNairobiLocation ||
          "Nationwide (Other regions selected)";
      }


      const orderDataToSave = {
        customer_name: orderDetails.name || "",
        customer_email: orderDetails.email?.trim() || null,


        phone: orderDetails.phone || "",
        delivery_zone: orderDetails.deliveryZone || "",
        location: locationDetail,
        items: cart,
        total_amount: total,
        status: "pending",
        payment_status: "pending",
      };

      // Assuming createOrder now returns { success: boolean, orderId?: string, error?: string }
      const result = await createOrder(orderDataToSave);

      if (result && result.success && result.orderId) {
        setOrderDetails((prev) => ({ ...prev, orderId: result.orderId }));
        clearCart();
        setOrderPlaced(true);
        // Delay redirect to allow user to see success message
        setTimeout(() => {
          router.push("/"); // Redirect to homepage
        }, 3000); // 3-second delay
      } else {
        setErrors({
          general: result?.error || "Failed to create order. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      setErrors({
        general:
          "An unexpected error occurred while submitting your order. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (cart.length === 0 && !orderPlaced) {
      // only redirect if order is not placed yet
      router.replace("/cart");
    }
  }, [cart, router, orderPlaced, step]);

  // Renders checkout steps. Refactored for 3-step process, improved layout, removed payment and redundant summary.
  const renderStepContent = () => {
    const currentStepObj = PROGRESS_STEPS.find((s) => s.id === step);

    switch (step) {
      case 1: // Delivery Options
        return (
          <MotionWrapper
            motionKey={`step-${step}`}
            animationDirection={animationDirection}
          >
            {currentStepObj && (
              <div className="flex items-center text-2xl font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-200">
                <currentStepObj.icon className="w-7 h-7 text-primary mr-3" />
                {currentStepObj.title}
              </div>
            )}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Choose Delivery Zone
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div
                    whileTap={{ scale: 0.97 }}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors duration-200 ease-in-out flex justify-between items-center ${orderDetails.deliveryZone === "nairobi"
                      ? "border-primary ring-2 ring-primary bg-primary/10"
                      : "border-gray-300 hover:border-gray-400"
                      } ${errors.deliveryZone && !orderDetails.deliveryZone
                        ? "border-red-500 bg-red-50"
                        : ""
                      }`}
                    onClick={() =>
                      handleInputChange({
                        target: { name: "deliveryZone", value: "nairobi" },
                      } as any)
                    }
                  >
                    <span className="flex items-center">
                      <TruckIcon className="w-5 h-5 mr-2 text-primary" />{" "}
                      Nairobi Area
                    </span>
                    {orderDetails.deliveryZone === "nairobi" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <CheckIcon className="w-5 h-5 text-primary" />
                      </motion.div>
                    )}
                  </motion.div>
                  <motion.div
                    whileTap={{ scale: 0.97 }}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors duration-200 ease-in-out flex justify-between items-center ${orderDetails.deliveryZone === "outside"
                      ? "border-primary ring-2 ring-primary bg-primary/10"
                      : "border-gray-300 hover:border-gray-400"
                      } ${errors.deliveryZone && !orderDetails.deliveryZone
                        ? "border-red-500 bg-red-50"
                        : ""
                      }`}
                    onClick={() =>
                      handleInputChange({
                        target: { name: "deliveryZone", value: "outside" },
                      } as any)
                    }
                  >
                    <span className="flex items-center">
                      <MapPinIcon className="w-5 h-5 mr-2 text-primary" />{" "}
                      Other Regions (Nationwide)
                    </span>

                    {orderDetails.deliveryZone === "outside" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <CheckIcon className="w-5 h-5 text-primary" />
                      </motion.div>
                    )}
                  </motion.div>
                </div>
                {errors.deliveryZone && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.deliveryZone}
                  </p>
                )}
              </div>

              {orderDetails.deliveryZone === "nairobi" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 pt-3"
                >
                  <div className="space-y-2">
                    <label
                      htmlFor="nairobiSpecificLocation"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Your Location in Nairobi
                    </label>
                    <input
                      type="text"
                      id="nairobiSpecificLocation"
                      name="nairobiSpecificLocation"
                      value={orderDetails.nairobiSpecificLocation || ""}
                      onChange={handleInputChange}
                      placeholder="Enter your exact location (e.g., street, building, landmark)"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.nairobiSpecificLocation
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                        }`}
                    />
                    {errors.nairobiSpecificLocation && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.nairobiSpecificLocation}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Please be specific with your location to ensure smooth
                      delivery.
                    </p>
                  </div>
                </motion.div>
              )}

              {orderDetails.deliveryZone === "outside" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 pt-3 border-t border-gray-100"
                >
                  <label
                    htmlFor="outsideNairobiLocation"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Specify Town/Location outside Nairobi
                  </label>
                  <input
                    type="text"
                    id="outsideNairobiLocation"
                    name="outsideNairobiLocation"
                    value={orderDetails.outsideNairobiLocation || ""}
                    onChange={handleInputChange}
                    placeholder="e.g., Nakuru Town, Moi Avenue"
                    className={`w-full p-3 border rounded-lg focus:ring-2 transition-colors ${errors.outsideNairobiLocation
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-primary focus:border-primary"
                      }`}
                  />
                  {errors.outsideNairobiLocation && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.outsideNairobiLocation}
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          </MotionWrapper>
        );
      case 2: // Contact Information
        return (
          <MotionWrapper
            motionKey={`step-${step}`}
            animationDirection={animationDirection}
          >
            {currentStepObj && (
              <div className="flex items-center text-2xl font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-200">
                <currentStepObj.icon className="w-7 h-7 text-primary mr-3" />
                {currentStepObj.title}
              </div>
            )}
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={orderDetails.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Jane Doe"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                )}
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mt-4"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={orderDetails.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="jane@example.com (Optional)"

                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  We'll send your order receipt to this email.
                </p>
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={orderDetails.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="0712 345678"
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="confirmPhone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Phone Number
                </label>
                <input
                  type="tel"
                  name="confirmPhone"
                  id="confirmPhone"
                  value={orderDetails.confirmPhone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Confirm your phone number"
                />
                {errors.confirmPhone && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.confirmPhone}
                  </p>
                )}
              </div>
            </div>
          </MotionWrapper>
        );
      case 3: // Confirm Order (Formerly Review Order)
        return (
          <MotionWrapper
            motionKey={`step-${step}`}
            animationDirection={animationDirection}
          >
            {currentStepObj && (
              <div className="flex items-center text-2xl font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-200">
                <currentStepObj.icon className="w-7 h-7 text-primary mr-3" />
                {currentStepObj.title}
              </div>
            )}
            <p className="text-gray-700 mb-4">
              Please review your delivery and contact information. The order
              summary on the right shows the items in your cart.
            </p>
            <p className="text-gray-600 text-sm mb-6">
              Click "Place Order" to finalize your purchase. We will contact you
              shortly after to confirm delivery details and fees.
            </p>

            {/* Combined Card for Contact & Delivery Details */}
            <div className="bg-slate-50 rounded-xl shadow-md p-6 mb-8">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-primary mb-3 flex items-center">
                  <UserCircleIcon className="w-6 h-6 mr-2" /> Contact
                  Information
                </h3>
                <div className="space-y-1 text-sm text-gray-700 pl-8">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {orderDetails.name}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {orderDetails.phone}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-primary mb-3 flex items-center">
                  <MapPinIcon className="w-6 h-6 mr-2" /> Delivery Details
                </h3>
                <div className="space-y-1 text-sm text-gray-700 pl-8">
                  <p>
                    <span className="font-medium">Zone:</span>{" "}
                    {orderDetails.deliveryZone === "nairobi"
                      ? "Nairobi Area"
                      : "Outside Nairobi"}
                  </p>
                  {orderDetails.deliveryZone === "nairobi" && (
                    <>
                      <p>
                        <span className="font-medium">Option:</span>{" "}
                        {orderDetails.deliveryLocation === "pickup_cbd"
                          ? "Pickup from CBD"
                          : "Home or Office Delivery"}
                      </p>
                      {orderDetails.deliveryLocation ===
                        "home_office_delivery" &&
                        orderDetails.nairobiSpecificLocation && (
                          <p>
                            <span className="font-medium">
                              Specific Location:
                            </span>{" "}
                            {orderDetails.nairobiSpecificLocation}
                          </p>
                        )}
                    </>
                  )}
                  {orderDetails.deliveryZone === "outside" &&
                    orderDetails.outsideNairobiLocation && (
                      <p>
                        <span className="font-medium">Location:</span>{" "}
                        {orderDetails.outsideNairobiLocation}
                      </p>
                    )}
                </div>
              </div>
            </div>

            {errors.general && (
              <div className="my-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                <p>{errors.general}</p>
              </div>
            )}
          </MotionWrapper>
        );
      default:
        return null; // Or some fallback UI
    }
  };

  // Main return for the CheckoutPage component
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8 md:py-12 px-4 sm:px-6 lg:px-8 font-karla">
      <AnimatePresence>
        {isCartLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md w-full">
              <div className="bg-primary bg-opacity-10 rounded-full p-5 mb-5 inline-block">
                <SolidCheckCircleIcon className="w-16 h-16 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">
                Loading Cart...
              </h3>
              <p className="text-gray-600 mb-6 text-base">
                Please wait while we load your cart items.
              </p>
            </div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto">
        {/* Back to Cart / Continue Shopping Link - visible only if cart is not empty */}
        {cart.length > 0 && (
          <div className="flex justify-between items-center mb-4">
            <button
              type="button"
              onClick={() => router.replace("/cart")}
              className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-primary disabled:opacity-60 transition-all duration-200 px-4 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 w-full sm:w-auto order-2 sm:order-1 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Back to Cart
            </button>
          </div>
        )}
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 text-center font-karla">
          Checkout
        </h1>
        <p className="text-gray-600 text-center mb-8 md:mb-12 font-karla">
          Please fill in your details to complete your order.
        </p>

        {/* Main layout: Order Summary and Form/Steps */}
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Order Summary - Appears first on mobile, second (sidebar) on md+ */}
          <div className="w-full md:w-1/3 md:order-last">
            <OrderSummaryComponent cartItems={cart} totalAmount={total} />
          </div>

          {/* Checkout Form / Steps - Appears second on mobile, first on md+ */}
          <div
            ref={formRef}
            className="w-full md:w-2/3 md:order-first bg-white p-6 sm:p-8 rounded-xl shadow-xl"
          >
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between mb-1">
                {PROGRESS_STEPS.map((stepObj, idx) => (
                  <div key={stepObj.id} className="flex-1 flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-base font-bold transition-all duration-200 ${step >= stepObj.id
                        ? "bg-primary border-primary text-white"
                        : "bg-white border-gray-300 text-gray-400"
                        }`}
                    >
                      <stepObj.icon className="w-6 h-6" />
                    </div>
                    {idx < PROGRESS_STEPS.length - 1 && (
                      <div className="flex-1 h-1 bg-gray-200 mx-2 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Animated step content */}
            <AnimatePresence
              initial={false}
              custom={animationDirection}
              mode="wait"
            >
              {renderStepContent()}
            </AnimatePresence>

            {/* Navigation buttons (only if order is not placed and within defined steps) */}
            {!orderPlaced && step <= PROGRESS_STEPS.length && (
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={step === 1 || isLoading}
                  className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-primary disabled:opacity-60 transition-all duration-200 px-4 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 w-full sm:w-auto order-2 sm:order-1 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep} // This now handles 'Place Order' for the last step
                  disabled={isLoading}
                  className={`w-full sm:w-auto rounded-lg shadow-md hover:shadow-lg !py-3 !px-6 text-base order-1 sm:order-2 flex-grow disabled:cursor-not-allowed font-karla ${isLoading
                    ? "bg-gray-400"
                    : "bg-primary hover:bg-primary/90 text-white"
                    } disabled:bg-gray-300 disabled:text-gray-500`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : step === PROGRESS_STEPS.length ? (
                    "Place Order"
                  ) : (
                    "Next"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Success Message - only render AnimatePresence when orderPlaced is true */}
        {orderPlaced && (
          <AnimatePresence>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md w-full"
                initial={{ scale: 0.8, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.8, y: 50, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div
                  initial={{ scale: 0.7, rotate: -20, opacity: 0 }}
                  animate={{ scale: 1.1, rotate: 0, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 12,
                    delay: 0.2,
                  }}
                  className="bg-primary bg-opacity-10 rounded-full p-5 mb-5 inline-block"
                >
                  <SolidCheckCircleIcon className="w-16 h-16 text-primary" />
                </motion.div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">
                  Order Placed Successfully!
                </h3>
                <p className="text-gray-600 mb-6 text-base">
                  We will contact you shortly to confirm your order and arrange
                  delivery. Thank you for shopping with us!
                </p>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-75 transition-all duration-150 ease-in-out font-karla"
                  onClick={() => {
                    setOrderPlaced(false);
                    router.replace("/");
                  }}
                >
                  Continue Shopping
                </motion.button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
