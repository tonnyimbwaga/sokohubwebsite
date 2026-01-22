import React from "react";
import { FaGavel } from "react-icons/fa";
import { MdSecurity } from "react-icons/md";
import { RiShieldCheckLine } from "react-icons/ri";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/utils/seo";

export const metadata = constructMetadata({
  title: "Terms and Conditions",
  description: `Welcome to ${siteConfig.name}. These terms and conditions outline the rules and regulations for purchasing and using our products.`,
});

export default function TermsAndConditions() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="mb-8 text-3xl font-bold md:text-4xl">
        Terms and Conditions
      </h1>

      {/* Introduction */}
      <div className="mb-8">
        <p className="text-gray-600">
          Welcome to {siteConfig.name}. These terms and conditions outline the
          rules and regulations for purchasing and using our products. As
          a premier retailer of quality goods, we strive to provide clear
          guidelines for a smooth shopping experience.
        </p>
      </div>

      {/* Key Points */}
      <div className="mb-12 grid gap-8 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <FaGavel className="mb-4 text-4xl text-primary" />
          <h2 className="mb-3 text-xl font-semibold">Legal Agreement</h2>
          <p className="text-gray-600">
            By shopping with us, you agree to these terms and conditions in
            accordance with local laws of {siteConfig.localization.country}.
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <MdSecurity className="mb-4 text-4xl text-primary" />
          <h2 className="mb-3 text-xl font-semibold">Secure Shopping</h2>
          <p className="text-gray-600">
            We ensure secure transactions and protect your personal information.
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <RiShieldCheckLine className="mb-4 text-4xl text-primary" />
          <h2 className="mb-3 text-xl font-semibold">Quality Guarantee</h2>
          <p className="text-gray-600">
            We stand behind the quality of our products and ensure customer
            satisfaction.
          </p>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-2xl font-semibold">1. General Terms</h2>
          <div className="rounded-lg bg-gray-50 p-6">
            <ul className="space-y-4">
              <li>
                <p className="text-gray-600">
                  By accessing and placing an order with {siteConfig.name}, you
                  confirm that you are legally capable of entering into binding
                  contracts and are at least 18 years of age.
                </p>
              </li>
              <li>
                <p className="text-gray-600">
                  All prices are listed in {siteConfig.localization.currencyCode} ({siteConfig.localization.currency}) and include
                  applicable taxes.
                </p>
              </li>
              <li>
                <p className="text-gray-600">
                  We reserve the right to modify these terms at any time without
                  prior notice.
                </p>
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            2. Products and Pricing
          </h2>
          <div className="rounded-lg bg-gray-50 p-6">
            <ul className="space-y-4">
              <li>
                <p className="text-gray-600">
                  All products are subject to availability. We reserve the right
                  to discontinue any product at any time.
                </p>
              </li>
              <li>
                <p className="text-gray-600">
                  Prices are subject to change without notice. However, changes
                  will not affect orders that have already been confirmed.
                </p>
              </li>
              <li>
                <p className="text-gray-600">
                  Product images are for illustration purposes only. Actual
                  products may vary slightly from description or images.
                </p>
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">3. Orders and Payment</h2>
          <div className="rounded-lg bg-gray-50 p-6">
            <ul className="space-y-4">
              <li>
                <p className="text-gray-600">
                  Orders are confirmed only after payment verification or order confirmation
                  from our team.
                </p>
              </li>
              <li>
                <p className="text-gray-600">
                  Full payment may be required before shipping depending on your location.
                </p>
              </li>
              <li>
                <p className="text-gray-600">
                  We accept various payment methods including secure online transfers and
                  mobile payments applicable in {siteConfig.localization.country}.
                </p>
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">4. Delivery</h2>
          <div className="rounded-lg bg-gray-50 p-6">
            <ul className="space-y-4">
              <li>
                <p className="text-gray-600">
                  Delivery charges are calculated based on location and weight of the order.
                </p>
              </li>
              <li>
                <p className="text-gray-600">
                  Delivery timeframes are estimates and may vary based on
                  location and product availability.
                </p>
              </li>
              <li>
                <p className="text-gray-600">
                  Risk of loss and damage passes to you upon delivery of
                  products.
                </p>
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            5. Returns and Refunds
          </h2>
          <div className="rounded-lg bg-gray-50 p-6">
            <ul className="space-y-4">
              <li>
                <p className="text-gray-600">
                  We accept returns of unused products in original packaging
                  within our specified return window (refer to Returns Policy).
                </p>
              </li>
              <li>
                <p className="text-gray-600">
                  Refunds are processed through the original payment method
                  within standard business processing times.
                </p>
              </li>
              <li>
                <p className="text-gray-600">
                  Damaged or defective items must be reported within 24 hours of
                  delivery.
                </p>
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            6. Intellectual Property
          </h2>
          <div className="rounded-lg bg-gray-50 p-6">
            <p className="text-gray-600">
              All content on our website, including images, text, and logos, is
              the property of {siteConfig.name} and is protected by local and
              international copyright laws.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Contact Information</h2>
          <div className="rounded-lg bg-gray-50 p-6">
            <p className="mb-4">
              For any questions about these terms and conditions, please contact
              us:
            </p>
            <ul className="space-y-2">
              <li>Email: {siteConfig.contact.email}</li>
              <li>Phone: {siteConfig.contact.phone}</li>
              <li>Address: {siteConfig.contact.address}</li>
            </ul>
          </div>
        </section>
      </div>

      {/* Last Updated */}
      <div className="mt-12 text-sm text-gray-500">
        Last updated: {currentDate}
      </div>
    </div>
  );
}
