"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

import { siteConfig } from "@/config/site";

import { FaInstagram, FaTiktok } from "react-icons/fa";

// Define footer data locally or import from content
const footerData = {
  description: siteConfig.description,
  footerLinks: [
    {
      title: "Help & Policies",
      links: [
        { name: "Refund & Return Policy", href: "/returns" },
        { name: "Shipping Policy", href: "/shipping" },
        { name: "Privacy Policy & Terms of Service", href: "/privacy-and-terms" },
        { name: "Payment Policy", href: "/payment-policy" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Contact Us", href: "/contact" },
      ],
    },
  ],
};
import Subscribe from "./Subscribe";

interface FooterLink {
  name: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 text-gray-700">
      <div className="container py-16">
        {/* Main Footer Content */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-6 inline-block">
              <Image
                src="/images/logo.png"
                alt={`${siteConfig.name} Logo`}
                width={120}
                height={40}
                style={{ width: "auto", height: "auto" }}
                className="h-10 w-auto"
                unoptimized
              />
            </Link>
            <p className="mb-6 text-sm text-gray-600">
              {footerData.description}
            </p>
            <div className="flex space-x-5 mb-6">
              <a
                href={siteConfig.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
                aria-label="Follow us on Instagram"
              >
                <FaInstagram size={20} />
              </a>
              <a
                href={siteConfig.links.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
                aria-label="Follow us on TikTok"
              >
                <FaTiktok size={20} />
              </a>
            </div>
            <Subscribe />
          </div>

          {/* Footer Links */}
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 lg:col-span-4">
            {footerData.footerLinks.map((section: FooterSection) => (
              <div key={section.title}>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link: FooterLink) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-gray-300 pt-8 md:flex-row">
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-8">
            <div className="text-sm text-gray-600">
              &copy; {currentYear} {siteConfig.name}. All rights reserved.
            </div>
            <Link
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:underline"
            >
              Sitemap
            </Link>
          </div>
          {/* Payment Methods */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Accepted Payments:</span>
            <div className="flex gap-2">
              {(siteConfig as any).payment?.acceptedMethods.map((method: string) => (
                <span key={method} className="rounded border border-gray-300 px-2 py-0.5 bg-white text-[10px] font-medium uppercase tracking-wider">
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};


export default Footer;
