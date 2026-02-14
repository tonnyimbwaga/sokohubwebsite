import React from "react";
import { FiPhone, FiMail } from "react-icons/fi";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/utils/seo";

export const metadata = constructMetadata({
  title: "Contact Us",
  description: "Have a question or need assistance? We're here to help! Reach out to our friendly team for personalized support.",
});

export default function ContactPage() {
  const contactInfo = [
    {
      icon: <FiMail />,
      title: "Email Us",
      description: "Send us an email for any inquiries.",
      // Using generic email link, but listing specific ones in the UI below if needed, or better yet, list them in the description
      href: `mailto:${siteConfig.contact.email}`,
      linkTitle: siteConfig.contact.email,
    },
    {
      icon: <FiPhone />,
      title: "Call Us",
      description: `Speak directly to our team during business hours (${siteConfig.contact.businessHours}).`,
      href: `tel:${siteConfig.contact.phone}`,
      linkTitle: siteConfig.contact.phone,
    },
  ];


  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-16 mt-8 text-center">
        <h1 className="text-4xl lg:text-5xl font-bold mb-6">
          Get in Touch
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {siteConfig.name} is run by a team of passionate professionals who are dedicated to ensuring Kenyans get high quality products at affordable prices, conveniently delivered to your doorstep.
        </p>

      </div>

      <div className="mb-20">
        <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          {contactInfo.map((info) => (
            <div
              key={info.title}
              className="flex flex-col items-center p-8 rounded-2xl shadow-sm border border-gray-100 bg-white hover:shadow-md transition-shadow duration-300"
            >
              <div className="text-primary text-4xl mb-6 p-4 rounded-full bg-primary/5">
                {info.icon}
              </div>
              <h2 className="text-2xl font-semibold mb-3">
                {info.title}
              </h2>
              <p className="text-center text-gray-500 mb-6 flex-grow">
                {info.description}
              </p>
              <a
                className="text-lg font-medium text-primary hover:text-primary/80 transition-colors"
                href={info.href}
              >
                {info.linkTitle}
              </a>
            </div>
          ))}
        </div>

      </div>

      <div className="mt-12 text-center bg-gray-50 p-8 rounded-2xl">
        <h3 className="text-xl font-bold mb-6">Official Department Emails</h3>
        <div className="flex flex-col md:flex-row gap-8 justify-center text-gray-700">
          <div className="flex flex-col items-center">
            <span className="font-bold text-gray-900 mb-1">General Inquiries</span>
            <a href="mailto:info@sokohubkenya.com" className="hover:text-primary transition-colors">info@sokohubkenya.com</a>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-gray-900 mb-1">Sales & Orders</span>
            <a href="mailto:sales@sokohubkenya.com" className="hover:text-primary transition-colors">sales@sokohubkenya.com</a>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-gray-900 mb-1">Management</span>
            <a href="mailto:tonny@sokohubkenya.com" className="hover:text-primary transition-colors">tonny@sokohubkenya.com</a>
          </div>
        </div>
      </div>
    </div>
  );
}


