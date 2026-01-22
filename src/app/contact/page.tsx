import React from "react";
import { FiFacebook, FiInstagram, FiTwitter, FiMail, FiPhone } from "react-icons/fi";
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
      description: "Get in touch with our team for any inquiries or support.",
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

  if (siteConfig.contact.alternativeEmail) {
    contactInfo.splice(1, 0, {
      icon: <FiMail />,
      title: "Alternative Email",
      description: "You can also reach us at our secondary email address.",
      href: `mailto:${siteConfig.contact.alternativeEmail}`,
      linkTitle: siteConfig.contact.alternativeEmail,
    });
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-16 mt-8 text-center">
        <h1 className="text-4xl lg:text-5xl font-bold mb-6">
          Get in Touch
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Have a question or need assistance? We&apos;re here to help! Reach out to our
          friendly team for personalized support.
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

        <div className="mt-20">
          <h2 className="text-3xl font-bold mb-10 text-center">
            Connect With Us
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            {siteConfig.links.facebook && (
              <a
                href={siteConfig.links.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 rounded-xl bg-[#1877F2] px-6 py-3.5 text-white hover:opacity-90 transition-opacity shadow-sm"
              >
                <FiFacebook size={20} />
                <span className="font-semibold">Facebook</span>
              </a>
            )}
            {siteConfig.links.instagram && (
              <a
                href={siteConfig.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 rounded-xl bg-gradient-to-tr from-[#F09433] via-[#E10098] to-[#5059E1] px-6 py-3.5 text-white hover:opacity-90 transition-opacity shadow-sm"
              >
                <FiInstagram size={20} />
                <span className="font-semibold">Instagram</span>
              </a>
            )}
            {siteConfig.links.twitter && (
              <a
                href={siteConfig.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 rounded-xl bg-[#1DA1F2] px-6 py-3.5 text-white hover:opacity-90 transition-opacity shadow-sm"
              >
                <FiTwitter size={20} />
                <span className="font-semibold">Twitter</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
