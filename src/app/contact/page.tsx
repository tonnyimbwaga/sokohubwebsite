import React from "react";
import { FiPhone } from "react-icons/fi";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/utils/seo";

export const metadata = constructMetadata({
  title: "Contact Us",
  description: "Have a question or need assistance? We're here to help! Reach out to our friendly team for personalized support.",
});

export default function ContactPage() {
  const contactInfo = [
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
    </div>
  );
}


