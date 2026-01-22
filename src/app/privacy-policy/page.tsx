import React from "react";
import { FaShieldAlt } from "react-icons/fa";
import { MdSecurity } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/utils/seo";

export const metadata = constructMetadata({
  title: "Privacy Policy",
  description: `At ${siteConfig.name}, we take your privacy seriously. This policy outlines how we collect, use, and protect your personal information.`,
});

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="mb-8 text-3xl font-bold md:text-4xl">Privacy Policy</h1>

      {/* Introduction */}
      <div className="mb-8">
        <p className="text-gray-600">
          At {siteConfig.name}, we take your privacy seriously. This policy
          outlines how we collect, use, and protect your personal information
          when you shop with us through our online platform.
        </p>
      </div>

      {/* Key Features */}
      <div className="mb-12 grid gap-8 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <FaShieldAlt className="mb-4 text-4xl text-primary" />
          <h2 className="mb-3 text-xl font-semibold">Data Protection</h2>
          <p className="text-gray-600">
            We implement robust security measures to protect your personal
            information and ensure it&apos;s handled with care.
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <MdSecurity className="mb-4 text-4xl text-primary" />
          <h2 className="mb-3 text-xl font-semibold">Secure Transactions</h2>
          <p className="text-gray-600">
            All payment transactions are encrypted and processed through secure
            payment gateways.
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <RiLockPasswordLine className="mb-4 text-4xl text-primary" />
          <h2 className="mb-3 text-xl font-semibold">Information Control</h2>
          <p className="text-gray-600">
            You have full control over your personal information and how
            it&apos;s used.
          </p>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            Information We Collect
          </h2>
          <div className="rounded-lg bg-gray-50 p-6">
            <ul className="space-y-4">
              <li>
                <span className="font-semibold">Personal Information:</span>
                <p className="text-gray-600">
                  Name, delivery address, phone number, and email address for
                  order processing and delivery.
                </p>
              </li>
              <li>
                <span className="font-semibold">Payment Information:</span>
                <p className="text-gray-600">
                  Transaction details for payment processing through our secure partners.
                </p>
              </li>
              <li>
                <span className="font-semibold">Shopping Preferences:</span>
                <p className="text-gray-600">
                  Your shopping history and product preferences to improve our
                  service.
                </p>
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            How We Use Your Information
          </h2>
          <div className="rounded-lg bg-gray-50 p-6">
            <ul className="space-y-4">
              <li>Process and deliver your orders</li>
              <li>Communicate about your order status</li>
              <li>
                Send relevant product updates and promotions (with your consent)
              </li>
              <li>Improve our products and services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            Data Protection Measures
          </h2>
          <div className="rounded-lg bg-gray-50 p-6">
            <ul className="space-y-4">
              <li>Secure storage of personal information</li>
              <li>
                Limited access to customer data by authorized personnel only
              </li>
              <li>Regular security updates and monitoring</li>
              <li>Encrypted payment processing</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Your Rights</h2>
          <div className="rounded-lg bg-gray-50 p-6">
            <ul className="space-y-4">
              <li>Access your personal information</li>
              <li>Request corrections to your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Request deletion of your information</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Contact Information</h2>
          <div className="rounded-lg bg-gray-50 p-6">
            <p className="mb-4">
              For any privacy-related concerns or to exercise your rights,
              please contact us:
            </p>
            <ul className="space-y-2">
              <li>Email: {siteConfig.contact.email}</li>
              <li>Phone: {siteConfig.contact.phone}</li>
              <li>Address: {siteConfig.contact.address}</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            Updates to This Policy
          </h2>
          <div className="rounded-lg bg-gray-50 p-6">
            <p className="text-gray-600">
              We may update this privacy policy from time to time to reflect
              changes in our practices or for legal reasons. We will notify you
              of any material changes through our website or email.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
