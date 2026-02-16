import React from "react";
import { constructMetadata } from "@/utils/seo";
import { siteConfig } from "@/config/site";
import { FaExchangeAlt, FaBoxOpen, FaRegClock, FaShieldAlt, FaWhatsapp } from "react-icons/fa";

export const metadata = constructMetadata({
  title: "Refund & Return Policy",
  description: `Review ${siteConfig.name} official returns and refunds policy. We offer a 24-hour return window for unused items and full refunds if replacements are unavailable.`,
  canonicalPath: "/returns",
});

export default function ReturnsPage() {
  const returnFeatures = [
    {
      icon: <FaExchangeAlt />,
      title: "Return Policy",
      description: "Returns accepted for unused items in original condition within 24 hours of delivery.",
    },
    {
      icon: <FaBoxOpen />,
      title: "Exchange Options",
      description: "Eligible returns may be exchanged for similar items, subject to availability.",
    },
    {
      icon: <FaRegClock />,
      title: "Quick Process",
      description: `Contact our support via WhatsApp or Phone to initiate an immediate return.`,
    },
    {
      icon: <FaShieldAlt />,
      title: "Quality Check",
      description: "Returned items must be unused and in original packaging for approval.",
    },
  ];

  return (
    <div className="main-layout py-12 md:py-24 bg-white">
      <div className="container px-4 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full mb-6">
            <FaRegClock className="animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest">Strict 24-Hour Policy</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">Refund & Return Policy</h1>
          <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Your satisfaction is our priority. If you're not happy with your order, we offer a streamlined 24-hour return process for our {siteConfig.name} customers.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-24">
          {returnFeatures.map((info, index) => (
            <div
              key={index}
              className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-2xl hover:shadow-red-500/5 hover:border-red-100 group"
            >
              <div className="mb-6 text-3xl text-primary group-hover:scale-110 transition-transform">{info.icon}</div>
              <h3 className="mb-3 text-lg font-bold text-slate-900">{info.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{info.description}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-12 mb-24">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-6 uppercase tracking-tight">Policy Details</h2>
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-3">
                    <span className="h-6 w-1 bg-primary rounded-full"></span>
                    24-Hour Return Window
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    You have exactly 24 hours to return an item from the time you received it. To be eligible, your item must be unused, in the same condition as received, and in its original packaging.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-3">
                    <span className="h-6 w-1 bg-red-500 rounded-full"></span>
                    Defective or Incorrect Items
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    If you receive a defective or incorrect item, please notify us within 24 hours. We will arrange for an immediate replacement or a full refund at no additional cost to you.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-3">
                    <span className="h-6 w-1 bg-primary rounded-full"></span>
                    Refund Processing
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Once received and inspected, we will process your refund or exchange within 3-5 business days. Refunds are typically issued via M-Pesa.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl">
              <h3 className="text-2xl font-black mb-6">Need to Return?</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                The fastest way to initiate a return is via WhatsApp. Our team will guide you through the next steps.
              </p>
              <div className="space-y-4">
                <a
                  href={`https://wa.me/${siteConfig.contact.whatsapp}`}
                  target="_blank"
                  className="flex items-center justify-center gap-3 w-full bg-[#25D366] py-5 rounded-2xl font-black uppercase text-sm hover:scale-[1.02] transition-transform"
                >
                  <FaWhatsapp className="text-xl" />
                  WhatsApp Now
                </a>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Customer Support</span>
                  <span className="font-bold">{siteConfig.contact.phone}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-red-50 rounded-2xl border border-red-100">
              <p className="text-red-700 text-xs font-bold leading-relaxed">
                <FaShieldAlt className="inline mr-2" />
                Note: Customers are responsible for return shipping costs unless the item is defective.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
