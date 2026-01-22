"use client";

import React from "react";
import { FaTruckFast } from "react-icons/fa6";
import { FaMapMarkerAlt } from "react-icons/fa";
import { BiTimeFive } from "react-icons/bi";

export default function ShippingInformation() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="mb-8 text-3xl font-bold md:text-4xl">
        Shipping Information
      </h1>

      {/* SEO Description */}
      <div className="mb-8">
        <p className="text-gray-600">
          At Sokohub Kenya, we provide reliable shipping services across Kenya
          for our high-quality products. Based in Nairobi CBD and serving surrounding areas,
          we ensure your items reach you safely and
          promptly.
        </p>
      </div>

      {/* Key Features */}
      <div className="mb-12 grid gap-8 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <FaTruckFast className="mb-4 text-4xl text-primary" />
          <h2 className="mb-3 text-xl font-semibold">Free Delivery to CBD</h2>
          <p className="text-gray-600">
            Enjoy complimentary delivery to Nairobi CBD for all orders. We
            believe in making quality toys accessible to all families in the
            city center.
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <FaMapMarkerAlt className="mb-4 text-4xl text-primary" />
          <h2 className="mb-3 text-xl font-semibold">Nairobi Coverage</h2>
          <p className="text-gray-600">
            We offer extensive coverage throughout Nairobi with pay-on-delivery
            options available for all locations within the city limits.
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <BiTimeFive className="mb-4 text-4xl text-primary" />
          <h2 className="mb-3 text-xl font-semibold">Delivery Timeline</h2>
          <p className="text-gray-600">
            Most deliveries within Nairobi are completed within 24-48 hours.
            Outside Nairobi delivery times vary based on location.
          </p>
        </div>
      </div>

      {/* Detailed Information */}
      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            Delivery Areas & Costs
          </h2>
          <div className="rounded-lg bg-gray-50 p-6">
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="mr-2 font-semibold">Nairobi CBD:</span>
                <span className="text-gray-600">Free delivery</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 font-semibold">Within Nairobi:</span>
                <span className="text-gray-600">
                  KES 200-500 depending on location
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 font-semibold">Limuru Area:</span>
                <span className="text-gray-600">
                  KES 200-300 depending on location
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 font-semibold">Other Areas:</span>
                <span className="text-gray-600">
                  Calculated based on distance and package size
                </span>
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Payment Options</h2>
          <div className="rounded-lg bg-gray-50 p-6">
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="mr-2 font-semibold">Nairobi Customers:</span>
                <span className="text-gray-600">
                  Can opt for pay on delivery or advance payment via M-PESA
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 font-semibold">Outside Nairobi:</span>
                <span className="text-gray-600">
                  Advance payment required via M-PESA before shipping
                </span>
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Delivery Process</h2>
          <div className="rounded-lg bg-gray-50 p-6">
            <ol className="list-decimal space-y-4 pl-4">
              <li>Order confirmation and verification</li>
              <li>Payment processing (if applicable)</li>
              <li>Package preparation and quality check</li>
              <li>Dispatch notification with tracking details</li>
              <li>Delivery to your specified location</li>
            </ol>
          </div>
        </section>
      </div>

      {/* Contact Information */}
      <div className="mt-12 rounded-lg bg-primary/5 p-6">
        <h2 className="mb-4 text-2xl font-semibold">Need Help?</h2>
        <p className="mb-4">
          For any shipping-related queries or to track your order, please
          contact our customer service team:
        </p>
        <ul className="space-y-2">
          <li>Phone: +254 707 874 828</li>
          <li>Email: shipping@sokohubkenya.com</li>
          <li>WhatsApp: +254 707 874 828</li>
        </ul>
      </div>
    </div>
  );
}
