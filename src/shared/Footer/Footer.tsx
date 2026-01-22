"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

import { siteConfig } from "@/config/site";

// Define footer data locally or import from content
const footerData = {
  description: siteConfig.description,
  footerLinks: [
    {
      title: "Customer Service",
      links: [
        { name: "Contact Us", href: "/contact" },
        { name: "Shipping", href: "/shipping" },
        { name: "Returns", href: "/returns" },
      ],
    },
    {
      title: "About Us",
      links: [
        { name: "Our Story", href: "/about" },
        { name: "Blog", href: "/blog" },
        { name: "Careers", href: "/careers" },
        { name: "Privacy Policy", href: "/privacy-policy" },
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
          <div className="mb-4 text-sm text-gray-600 md:mb-0">
            &copy; {currentYear} {siteConfig.name}. All rights reserved.
          </div>
          {/* Sitemap Link */}
          <div className="mb-4 text-sm text-gray-600 md:mb-0">
            <Link
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Sitemap
            </Link>
          </div>
          {/* Social Links */}
          <div className="flex space-x-6">
            {siteConfig.links.facebook && (
              <a
                href={siteConfig.links.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 transition-colors hover:text-gray-900"
                aria-label="Follow us on Facebook"
              >
                <FaFacebook size={20} />
              </a>
            )}
            {siteConfig.links.instagram && (
              <a
                href={siteConfig.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 transition-colors hover:text-gray-900"
                aria-label="Follow us on Instagram"
              >
                <FaInstagram size={20} />
              </a>
            )}
            {siteConfig.links.twitter && (
              <a
                href={siteConfig.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 transition-colors hover:text-gray-900"
                aria-label="Follow us on Twitter"
              >
                <FaTwitter size={20} />
              </a>
            )}
            {/* Added TikTok check if we add it to config later */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
