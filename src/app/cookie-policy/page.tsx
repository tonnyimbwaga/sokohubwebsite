import React from "react";
import { FaCookie } from "react-icons/fa";
import { MdSecurity } from "react-icons/md";
import { RiShieldCheckLine } from "react-icons/ri";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/utils/seo";

export const metadata = constructMetadata({
  title: "Cookie Policy",
  description: `At ${siteConfig.name}, we use cookies and similar technologies to enhance your shopping experience. This policy explains how we use cookies and your choices regarding their use.`,
});

export default function CookiePolicy() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="mb-8 text-3xl font-bold md:text-4xl">Cookie Policy</h1>

      {/* Introduction */}
      <div className="mb-8">
        <p className="text-gray-600">
          At {siteConfig.name}, we use cookies and similar technologies to enhance
          your shopping experience on our website. This policy explains how we
          use cookies and your choices regarding their use.
        </p>
      </div>

      {/* Key Points */}
      <div className="mb-12 grid gap-8 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md transition-transform hover:-translate-y-1">
          <FaCookie className="mb-4 text-4xl text-primary" />
          <h2 className="mb-3 text-xl font-semibold">What Are Cookies?</h2>
          <p className="text-gray-600">
            Small text files stored on your device that help us remember your
            preferences and provide essential site functionality.
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md transition-transform hover:-translate-y-1">
          <MdSecurity className="mb-4 text-4xl text-primary" />
          <h2 className="mb-3 text-xl font-semibold">Your Privacy</h2>
          <p className="text-gray-600">
            We respect your privacy. Cookies are used responsibly to ensure a
            secure and personalized shopping experience.
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md transition-transform hover:-translate-y-1">
          <RiShieldCheckLine className="mb-4 text-4xl text-primary" />
          <h2 className="mb-3 text-xl font-semibold">Your Choices</h2>
          <p className="text-gray-600">
            You have full control. Manage your cookie preferences through your
            browser settings at any time.
          </p>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            Types of Cookies We Use
          </h2>
          <div className="rounded-lg bg-gray-50 p-6">
            <ul className="space-y-4">
              <li>
                <span className="font-semibold">Essential Cookies:</span>
                <p className="text-gray-600">
                  Required for basic website functionality, such as remembering
                  items in your shopping cart and maintaining your secure login
                  session.
                </p>
              </li>
              <li>
                <span className="font-semibold">Performance Cookies:</span>
                <p className="text-gray-600">
                  Help us understand how visitors interact with our website,
                  allowing us to optimize performance and the user journey.
                </p>
              </li>
              <li>
                <span className="font-semibold">Functionality Cookies:</span>
                <p className="text-gray-600">
                  Allow us to remember your choices (like preferred currency or
                  region) for a more tailored experience.
                </p>
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">How We Use Cookies</h2>
          <div className="rounded-lg bg-gray-50 p-6">
            <ul className="space-y-2 list-disc list-inside text-gray-600">
              <li>Facilitate the shopping and checkout process</li>
              <li>Remember your preferences and past settings</li>
              <li>Analyze site traffic and user behavior</li>
              <li>Improve our website performance and security</li>
              <li>Provide personalized recommendations (where opted-in)</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Managing Cookies</h2>
          <div className="rounded-lg bg-gray-50 p-6">
            <p className="mb-4">
              Most web browsers allow you to control cookies through their
              settings. You can choose to block all cookies, delete existing
              ones, or set preferences for specific sites.
            </p>
            <p className="text-sm text-gray-500">
              Note: Disabling cookies may limit your ability to use certain features
              of this website, like the shopping cart.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Contact Us</h2>
          <div className="rounded-lg bg-gray-50 p-6">
            <p className="mb-4">
              If you have any questions about our cookie policy, please contact
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
