import React from "react";
import { constructMetadata } from "@/utils/seo";
import { siteConfig } from "@/config/site";
import { FaTruck, FaMapMarkerAlt, FaClock, FaShieldAlt, FaPhoneAlt } from "react-icons/fa";

export const metadata = constructMetadata({
  title: "Shipping Policy",
  description: `Learn about ${siteConfig.name} shipping policies, delivery times, and costs. We offer reliable delivery services across ${siteConfig.localization.country}.`,
  canonicalPath: "/shipping",
});

export default function ShippingPage() {
  const shippingInfo = [
    {
      icon: <FaTruck />,
      title: "Nationwide Delivery",
      description: `Reliable delivery across ${siteConfig.localization.country} for all our products.`,
      color: "blue"
    },
    {
      icon: <FaMapMarkerAlt />,
      title: "Delivery Areas",
      description: `We deliver across ${siteConfig.localization.country} to all major towns and cities.`,
      color: "green"
    },
    {
      icon: <FaClock />,
      title: "Fast Delivery",
      description: "Quick and efficient delivery service to get your orders to you promptly.",
      color: "orange"
    },
    {
      icon: <FaShieldAlt />,
      title: "Safe Handling",
      description: "All items are carefully packed to ensure they arrive in perfect condition.",
      color: "purple"
    },
  ];

  const deliveryRates = [
    {
      area: "Nairobi Area",
      time: "2 - 3 Hours",
      cost: `${siteConfig.localization.currency} 400`,
      featured: true
    },
    {
      area: "Outside Nairobi (Countrywide)",
      time: "1 - 2 Days",
      cost: "TBC After Order",
      featured: false
    },
  ];

  return (
    <div className="main-layout py-12 md:py-24 bg-white">
      <div className="container px-4 max-w-6xl">
        <div className="text-center mb-20">
          <span className="text-xs font-black tracking-[0.3em] text-primary uppercase bg-primary/5 px-4 py-2 rounded-full">Logistic Excellence</span>
          <h1 className="mt-6 text-4xl md:text-6xl font-black text-slate-900 tracking-tight">Shipping Policy</h1>
          <p className="mt-6 text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Fast, reliable, and secure. We ensure your items from {siteConfig.name} reach you in perfect condition, no matter where you are in {siteConfig.localization.country}.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-24">
          {shippingInfo.map((info, index) => (
            <div
              key={index}
              className="group p-8 rounded-[2rem] bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2"
            >
              <div className={`mb-6 text-3xl text-primary`}>{info.icon}</div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">{info.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{info.description}</p>
            </div>
          ))}
        </div>

        {/* Delivery Rates Section */}
        <div className="bg-slate-900 rounded-[3rem] p-8 md:p-16 text-white mb-24 overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-12 flex items-center gap-4">
              Standard Delivery Rates
              <span className="h-1 w-20 bg-primary rounded-full"></span>
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {deliveryRates.map((rate, index) => (
                <div
                  key={index}
                  className={`p-8 rounded-[2.5rem] border ${rate.featured ? 'bg-white text-slate-900 border-white' : 'bg-white/5 border-white/10'}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-lg font-black uppercase tracking-widest">{rate.area}</h3>
                    {rate.featured && <span className="bg-primary text-slate-900 text-[10px] font-black px-3 py-1 rounded-full uppercase">Most Popular</span>}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <FaClock className={rate.featured ? 'text-primary' : 'text-white/40'} />
                      <span className="font-bold">{rate.time}</span>
                    </div>
                    <div className="text-4xl font-black mt-4">
                      {rate.cost}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Important Guidelines */}
        <div className="grid md:grid-cols-5 gap-12 items-center">
          <div className="md:col-span-3 space-y-8">
            <h2 className="text-3xl font-black text-slate-900">Delivery Guidelines</h2>
            <div className="space-y-6">
              {[
                "Orders placed before 2 PM in Nairobi qualify for same-day delivery.",
                "Countrywide shipping is processed via leading logistics partners.",
                "All items undergo a quality check before dispatch for your peace of mind.",
                "You'll receive a notification and verification call once your order is out for delivery."
              ].map((text, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="mt-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  </div>
                  <p className="text-slate-600 font-medium">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 bg-primary p-10 rounded-[2.5rem] shadow-xl shadow-primary/20">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
              <FaPhoneAlt className="text-white text-2xl mb-4" />
              <h3 className="text-white font-black uppercase tracking-widest mb-2 text-sm">Need Support?</h3>
              <p className="text-white/80 text-xs font-medium leading-relaxed">Our logistics team is available to assist with tracking and delivery inquiries.</p>
            </div>
            <a
              href={`tel:${siteConfig.contact.phone.replace(/\s+/g, '')}`}
              className="block w-full text-center bg-white text-primary py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-transform"
            >
              Contact Team
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
