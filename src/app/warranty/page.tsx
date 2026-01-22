import React from "react";
import { FaShieldAlt, FaHandshake, FaTools } from "react-icons/fa";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/utils/seo";

export const metadata = constructMetadata({
  title: "Warranty Policy",
  description: `At ${siteConfig.name}, we stand behind the quality of our products. Our warranty policy is designed to give you peace of mind with your purchase.`,
});

export default function WarrantyPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="mb-8 text-3xl font-bold md:text-4xl">
        Warranty Policy
      </h1>

      {/* Introduction */}
      <div className="mb-8">
        <p className="text-gray-600">
          At {siteConfig.name}, we stand behind the quality of our products. Our
          warranty policy is designed to give you peace of mind with your
          purchase and ensure your complete satisfaction.
        </p>
      </div>

      {/* Key Features */}
      <div className="mb-12 grid gap-8 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md transition-transform hover:-translate-y-1">
          <FaShieldAlt className="mb-4 text-4xl text-primary" />
          <h2 className="mb-3 text-xl font-semibold">Product Protection</h2>
          <p className="text-gray-600">
            Standard warranty coverage against manufacturing defects on all our premium products.
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md transition-transform hover:-translate-y-1">
          <FaHandshake className="mb-4 text-4xl text-primary" />
          <h2 className="mb-3 text-xl font-semibold">Easy Claims Process</h2>
          <p className="text-gray-600">
            Simple and hassle-free warranty claims process with our dedicated
            customer service team.
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md transition-transform hover:-translate-y-1">
          <FaTools className="mb-4 text-4xl text-primary" />
          <h2 className="mb-3 text-xl font-semibold">Repair & Replace</h2>
          <p className="text-gray-600">
            We offer repair or replacement options depending on the nature of
            the product and any identified issues.
          </p>
        </div>
      </div>

      {/* Warranty Details */}
      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-2xl font-semibold">What's Covered</h2>
          <ul className="list-inside list-disc space-y-2 text-gray-600">
            <li>Manufacturing defects in materials and workmanship</li>
            <li>Structural integrity issues</li>
            <li>Non-functioning electronic components (where applicable)</li>
            <li>Missing parts upon delivery</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">What's Not Covered</h2>
          <ul className="list-inside list-disc space-y-2 text-gray-600">
            <li>Normal wear and tear</li>
            <li>Damage caused by misuse or accidents</li>
            <li>Unauthorized modifications or repairs</li>
            <li>Products without proof of purchase</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">How to Claim</h2>
          <ol className="list-inside list-decimal space-y-2 text-gray-600">
            <li>Contact our customer service team via email</li>
            <li>Provide your order number and proof of purchase</li>
            <li>Describe the issue and provide photos if possible</li>
            <li>
              Follow the instructions provided by our team for returns or
              repairs
            </li>
          </ol>
        </section>
      </div>

      {/* Contact Information */}
      <div className="mt-12 rounded-lg bg-gray-50 p-6">
        <h2 className="mb-4 text-2xl font-semibold">Need Help?</h2>
        <p className="text-gray-600">
          Our customer service team is here to help with any warranty-related
          questions. Contact us at:
        </p>
        <ul className="mt-4 space-y-2 text-gray-600">
          <li>Email: {siteConfig.contact.email}</li>
          <li>Phone: {siteConfig.contact.phone}</li>
          {siteConfig.contact.businessHours && (
            <li>Hours: {siteConfig.contact.businessHours}</li>
          )}
        </ul>
        <p className="mt-4 text-gray-600">Thank you for choosing {siteConfig.name}!</p>
      </div>
    </div>
  );
}
