"use client";

import Link from "next/link";
import { FaFacebook, FaTwitter, FaInstagram, FaTiktok } from "react-icons/fa";

import { categories } from "@/data/content";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 text-gray-700 border-t border-gray-200">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* About Section */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-white">About Us</h2>
            <p className="mb-4 text-sm">
              We offer a curated selection of high-quality products for your
              home and lifestyle needs. Our commitment is to bring you the best
              products at competitive prices.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com/tototoyskenya"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
                aria-label="Follow us on Facebook"
              >
                <FaFacebook size={20} />
              </a>
              <a
                href="https://x.com/tototoyskenya"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
                aria-label="Follow us on Twitter"
              >
                <FaTwitter size={20} />
              </a>
              <a
                href="https://instagram.com/tototoyskenya"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
                aria-label="Follow us on Instagram"
              >
                <FaInstagram size={20} />
              </a>
              <a
                href="https://tiktok.com/@tototoyskenya"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
                aria-label="Follow us on TikTok"
              >
                <FaTiktok size={20} />
              </a>
            </div>
          </div>

          {/* Categories Section */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-white">
              Categories
            </h2>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/category/${category.id}`}
                    className="text-sm hover:text-white"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service Section */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-white">
              Customer Service
            </h2>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-sm hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-sm hover:text-white">
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-sm hover:text-white">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="text-sm hover:text-white">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm hover:text-white">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-white">
              Newsletter
            </h2>
            <p className="mb-4 text-sm">
              Subscribe to our newsletter for updates, special offers, and
              exclusive content.
            </p>
            <form className="flex flex-col space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm">
          <p>© {currentYear} Your Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
