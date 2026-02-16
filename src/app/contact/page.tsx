import React from "react";
import { FiPhone, FiMail, FiMapPin, FiClock } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/utils/seo";

export const metadata = constructMetadata({
  title: "Contact Us",
  description: "Have a question or need assistance? We're here to help! Reach out to our friendly team for personalized support.",
  canonicalPath: "/contact",
});

export default function ContactPage() {
  const contactMethods = [
    {
      icon: <FiMail />,
      title: "Email Support",
      details: siteConfig.contact.email,
      description: "Quick responses for general inquiries.",
      href: `mailto:${siteConfig.contact.email}`,
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: <FiPhone />,
      title: "Phone Call",
      details: siteConfig.contact.phone,
      description: "Direct assistance during business hours.",
      href: `tel:${siteConfig.contact.phone.replace(/\s+/g, '')}`,
      color: "bg-green-50 text-green-600"
    },
    {
      icon: <FaWhatsapp />,
      title: "WhatsApp",
      details: "Instant Chat",
      description: "Send us a message for fast support.",
      href: `https://wa.me/${siteConfig.contact.whatsapp}`,
      color: "bg-emerald-50 text-emerald-600"
    }
  ];

  return (
    <div className="main-layout py-12 md:py-24 bg-white">
      <div className="container px-4 max-w-6xl">
        {/* Header section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <span className="text-xs font-black tracking-[0.3em] text-primary uppercase bg-primary/5 px-4 py-2 rounded-full mb-6 inline-block">Support Center</span>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-6">Get in Touch</h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-8">
              Whether you have a product question, need order support, or just want to say hello, we're here for you. Experience {siteConfig.name}'s premium customer service.
            </p>
            <div className="flex flex-wrap gap-8">
              <div className="flex items-center gap-3">
                <FiClock className="text-primary text-xl" />
                <div>
                  <span className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">Available Hours</span>
                  <span className="font-bold text-slate-900">{siteConfig.contact.businessHours}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FiMapPin className="text-primary text-xl" />
                <div>
                  <span className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">Our Location</span>
                  <span className="font-bold text-slate-900">{siteConfig.contact.address}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-primary rounded-[3rem] p-1 h-full shadow-2xl shadow-primary/20 rotate-1">
              <div className="bg-white rounded-[2.8rem] p-8 md:p-12 rotate-[-1deg]">
                <h3 className="text-2xl font-black mb-8 text-slate-900">Department Directory</h3>
                <div className="space-y-6">
                  {[
                    { label: "General & Support", email: "info@sokohubkenya.com" },
                    { label: "Sales & Orders", email: "sales@sokohubkenya.com" },
                    { label: "Management", email: "tonny@sokohubkenya.com" }
                  ].map((dept, i) => (
                    <div key={i} className="p-4 rounded-3xl bg-slate-50 border border-slate-100 group transition-all hover:bg-white hover:shadow-xl hover:shadow-primary/5">
                      <span className="block text-[10px] font-black uppercase text-slate-400 mb-1">{dept.label}</span>
                      <a href={`mailto:${dept.email}`} className="font-bold text-slate-800 hover:text-primary transition-colors">{dept.email}</a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Decorative blob */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {contactMethods.map((method, i) => (
            <a
              key={i}
              href={method.href}
              className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 transition-all hover:bg-slate-900 hover:-translate-y-2 group"
            >
              <div className={`w-14 h-14 ${method.color} rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:scale-110 transition-transform`}>
                {method.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 group-hover:text-white">{method.title}</h3>
              <p className="text-slate-500 text-sm mb-6 group-hover:text-slate-400">{method.description}</p>
              <span className="text-lg font-black text-primary group-hover:text-primary-light uppercase tracking-tight">{method.details}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
