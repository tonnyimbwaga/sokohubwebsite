import type { Metadata } from "next";
import React from "react";
import Image from "next/image";
import { Inter } from "next/font/google";
import { MaxWidthWrapper } from "@/components/MaxWidthWrapper";
import {
  Phone,
  Truck,
  CheckCircle2,
  ShieldCheck,
  Zap,
  MoveRight,
  Star,
  ChevronDown,
  XCircle,
  Package,
  MapPin,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { ImageGallery } from "./ImageGallery";
import { siteConfig } from "@/config/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: `1.8m Heavy-Duty Foldable Table for Sale in ${siteConfig.localization.country} | Strong & Stable`,
  description:
    `Practical 1.8m (6ft) heavy-duty folding table for events, catering, camping & home use. High quality. Fast delivery in ${siteConfig.localization.city} + Pay on Delivery.`,
  keywords:
    `foldable table ${siteConfig.localization.country}, 6ft folding table ${siteConfig.localization.city}, heavy duty folding table, event furniture ${siteConfig.localization.country}, camping table ${siteConfig.localization.city}, banquet table ${siteConfig.localization.country}, picnic table ${siteConfig.localization.city}`,
  openGraph: {
    title: "1.8m Heavy-Duty Foldable Table - Strong, Stable & Easy to Store",
    description:
      "The most reliable folding table for business and home use.",
    url: `${siteConfig.url}/foldable-tables-for-sale-kenya`,
    type: "website",
    images: [
      {
        url: `${siteConfig.url}/images/folding-table-og.png`,
        width: 1200,
        height: 630,
        alt: `1.8m Heavy-Duty Foldable Table for Sale in ${siteConfig.localization.country}`,
      },
    ],
  },
};

export default function FoldingTableLandingPage() {
  const phoneNumber = siteConfig.contact.phone;
  const price = "9,950";

  // SEO Optimized Image Configuration - Using high-intent search terms
  const imagesPath = "/images/products/folding-table/";
  const tableImages = [
    {
      src: "heavy-duty-1-8m-banquet-table-for-events-kenya.png",
      alt: `1.8m Heavy-Duty Banquet Table for events and parties in ${siteConfig.localization.country}`,
    },
    {
      src: "portable-6ft-folding-picnic-table-for-camping.png",
      alt: "Portable 6ft folding picnic table for outdoor camping and picnics",
    },
    {
      src: "foldable-party-table-6ft-heavy-duty-frame.png",
      alt: "Heavy duty frame detail of 6ft foldable party table",
    },
    {
      src: "commercial-grade-folding-table-for-catering-nairobi.png",
      alt: `Commercial grade folding table for catering businesses in ${siteConfig.localization.city}`,
    },
    {
      src: "outdoor-plastic-folding-table-1-8m-weatherproof.png",
      alt: "1.8m outdoor plastic folding table weatherproof and durable",
    },
    {
      src: "6ft-rectangular-fold-in-half-table-easy-clean.png",
      alt: "6ft rectangular fold-in-half table with easy-clean surface",
    },
    {
      src: "foldable-meeting-table-1-8m-office-use-kenya.png",
      alt: `1.8m foldable meeting table for office and conference use in ${siteConfig.localization.country}`,
    },
    {
      src: "heavy-duty-folding-trestle-table-6ft-stable.png",
      alt: "Stable 6ft heavy duty folding trestle table for multi-purpose use",
    },
  ];

  const encode = (str: string) => encodeURIComponent(str);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "1.8m Heavy-Duty Foldable Table",
    description:
      "Practical 1.8m (6ft) heavy-duty folding table for events, catering, camping & home use.",
    image: `${siteConfig.url}${imagesPath}${tableImages[0]?.src || ""}`,
    offers: {
      "@type": "Offer",
      price: "9950",
      priceCurrency: siteConfig.localization.currencyCode,
      availability: "https://schema.org/InStock",
      url: `${siteConfig.url}/foldable-tables-for-sale-kenya`,
    },
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
  };

  const whatsappMessage = encode(
    `Hi! I'm interested in the 1.8m Heavy-Duty Foldable Table. Please provide more details on delivery.`,
  );
  const whatsappLink = `https://wa.me/${siteConfig.contact.whatsapp.replace(/\+/g, "")}?text=${whatsappMessage}`;

  return (
    <div
      className={`${inter.variable} font-sans min-h-screen bg-white text-slate-900 selection:bg-[#FF6B6B]/30 pb-20`}
    >
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* --- HERO SECTION --- */}
      <header className="relative overflow-hidden bg-slate-50 pt-16 pb-20 md:pt-24 md:pb-32">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#FF6B6B]/5 blur-[120px] -mr-32" />
        <div className="absolute bottom-0 left-0 w-1/4 h-full bg-[#4ECDC4]/5 blur-[120px] -ml-32" />

        <MaxWidthWrapper className="relative">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12 md:gap-20">
            {/* Hero Text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF6B6B]/10 text-[#FF6B6B] font-bold text-xs uppercase tracking-widest mb-6 animate-bounce-subtle">
                <Zap size={14} />
                <span>High Demand: Limited Stock Available</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
                1.8m Heavy-Duty{" "}
                <span className="text-[#FF6B6B]">Foldable Table</span> — Strong,
                Stable & Easy to Store
              </h1>

              <p className="text-xl md:text-2xl text-slate-600 font-medium mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Ideal for events, catering, camping, meetings, and home use.
                Built to carry heavy weight without wobbling.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 mb-12 justify-center lg:justify-start">
                <div className="flex flex-col items-center sm:items-start">
                  <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">
                    Affordable Price
                  </span>
                  <span className="text-5xl font-black text-slate-900">
                    Ksh {price}
                  </span>
                </div>
                <div className="h-12 w-px bg-slate-200 hidden sm:block" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-700 font-bold">
                    <Truck size={18} className="text-[#25D366]" />
                    <span>Fast delivery in Nairobi</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 font-bold">
                    <CheckCircle2 size={18} className="text-[#25D366]" />
                    <span>Pay via M-PESA or Cash on Delivery</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-center gap-3 px-10 py-5 bg-[#25D366] text-white rounded-2xl text-lg font-black shadow-2xl shadow-[#25D366]/30 hover:bg-[#1fb355] transition-all transform hover:-translate-y-1 active:scale-95 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                  <FaWhatsapp size={24} />
                  <span>ORDER ON WHATSAPP</span>
                </a>
                <a
                  href={`tel:${phoneNumber}`}
                  className="flex items-center justify-center gap-3 px-10 py-5 border-2 border-slate-200 text-slate-900 rounded-2xl text-lg font-black hover:border-[#FF6B6B] hover:text-[#FF6B6B] transition-all"
                >
                  <Phone size={20} />
                  <span>CALL TO ORDER</span>
                </a>
              </div>
            </div>

            {/* Hero Image */}
            <div className="flex-1 relative w-full aspect-square max-w-[540px] group">
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#FF6B6B] to-[#4ECDC4] rounded-[2.5rem] opacity-10 group-hover:opacity-20 transition-opacity blur-2xl" />
              <div className="relative h-full w-full bg-slate-100 rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden flex items-center justify-center">
                {tableImages[0] && (
                  <Image
                    src={`${imagesPath}${tableImages[0].src}`}
                    alt={tableImages[0].alt}
                    fill
                    className="object-cover"
                    priority
                  />
                )}
                {/* Overlay icon in case image is missing */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <Package
                    size={80}
                    strokeWidth={1}
                    className="text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </header>

      {/* --- VISUAL PROOF SECTION --- */}
      <section className="py-24 bg-white">
        <MaxWidthWrapper>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">
              Built for Every Occasion
            </h2>
            <p className="text-lg text-slate-600 font-medium">
              Whether it&apos;s a garden party, camping trip, or corporate
              event, this 1.8m table is the perfect companion for both indoor
              and outdoor use.
            </p>
          </div>

          <ImageGallery images={tableImages} imagesPath={imagesPath} />
        </MaxWidthWrapper>
      </section>

      {/* --- PROBLEM/SOLUTION SECTION --- */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#FF6B6B]/5 blur-[120px] -mr-32" />

        <MaxWidthWrapper className="relative">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-stretch">
              {/* The Problem */}
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm transition-all hover:shadow-md">
                <h3 className="text-2xl font-black text-[#FF6B6B] uppercase tracking-wider mb-8 flex items-center gap-3">
                  <XCircle className="text-[#FF6B6B]" />
                  Why Most Tables Fail
                </h3>
                <p className="text-xl font-bold mb-8 text-slate-900">
                  Buying the wrong table leads to wasted money. Most generic
                  tables:
                </p>
                <ul className="space-y-6">
                  {[
                    "Shake and wobble when items are added",
                    "Surface bends or cracks after a few uses",
                    "Legs rust or fail after being stored",
                    "Are frustratingly heavy yet weak",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4 group">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-1 border border-slate-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      </div>
                      <span className="text-lg text-slate-600 group-hover:text-slate-900 transition-colors font-medium">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* The Solution */}
              <div className="bg-[#25D366]/5 p-8 md:p-12 rounded-[2.5rem] border-2 border-[#25D366]/20 relative flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-[#25D366]/5">
                <div>
                  <div className="absolute -top-6 -right-6 w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg shadow-[#25D366]/30">
                    <CheckCircle2 size={32} className="text-white" />
                  </div>

                  <h3 className="text-2xl font-black text-[#1fb355] uppercase tracking-wider mb-8">
                    The Reliable Choice
                  </h3>
                  <p className="text-xl font-bold mb-6 text-slate-900 leading-relaxed">
                    A practical, all-purpose solution for your space.
                  </p>

                  <ul className="space-y-4 mb-8">
                    {[
                      "Rock-solid stability for peace of mind",
                      "Weather-resistant surface for outdoor use",
                      "Folds effortlessly for quick storage",
                      "Reinforced steel frame built to last years",
                    ].map((benefit, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-lg font-bold text-slate-700"
                      >
                        <CheckCircle2 size={20} className="text-[#25D366]" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href={whatsappLink}
                  className="w-full flex items-center justify-center gap-3 py-5 bg-[#25D366] text-white rounded-2xl font-black hover:bg-[#1fb355] shadow-xl shadow-[#25D366]/20 transition-all transform hover:-translate-y-1"
                >
                  Get This Reliable Table
                  <MoveRight size={20} />
                </a>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-24 bg-white">
        <MaxWidthWrapper>
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">
              What Makes This Table A Better Choice
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Strong & Stable Support",
                desc: "Reinforced steel frame keeps the table steady even when fully loaded.",
                icon: <ShieldCheck className="text-[#FF6B6B]" size={32} />,
              },
              {
                title: "Folds Flat in Seconds",
                desc: "Easy to carry, store, and transport without taking up space.",
                icon: <Zap className="text-[#FF6B6B]" size={32} />,
              },
              {
                title: "Ready to Use Immediately",
                desc: "No tools. No assembly. Just open and use.",
                icon: <CheckCircle2 className="text-[#FF6B6B]" size={32} />,
              },
              {
                title: "Works for Many Situations",
                desc: "Perfect for events, catering, camping, meetings, and home use.",
                icon: <Package className="text-[#FF6B6B]" size={32} />,
              },
              {
                title: "Built to Last",
                desc: "Designed to withstand repeated setup and breakdown without weakening.",
                icon: <Zap className="text-[#FF6B6B]" size={32} />,
              },
              {
                title: "Nairobi Delivery",
                desc: "Fast delivery with pay on delivery options for your peace of mind.",
                icon: <Truck className="text-[#FF6B6B]" size={32} />,
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-10 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-[#FF6B6B]/30 hover:shadow-xl hover:shadow-[#FF6B6B]/5 transition-all group"
              >
                <div className="mb-6 transform group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-4">
                  {feature.title}
                </h4>
                <p className="text-slate-600 font-medium leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      {/* --- PRODUCT DETAILS & SPECS --- */}
      <section className="py-24 bg-slate-50">
        <MaxWidthWrapper>
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1 w-full">
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-200">
                <h2 className="text-3xl font-black text-slate-900 mb-10 pb-6 border-b border-slate-100">
                  Product Details
                </h2>
                <div className="space-y-8">
                  {[
                    { label: "Length", value: "1.8 meters (6 feet)" },
                    { label: "Design", value: "Foldable (Fold-in-half)" },
                    { label: "Frame", value: "Heavy-duty reinforced steel" },
                    {
                      label: "Surface",
                      value: "Easy-to-clean high-density tabletop",
                    },
                    {
                      label: "Usage",
                      value: "Suitable for indoor and outdoor use",
                    },
                  ].map((spec, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center group"
                    >
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-xs">
                        {spec.label}
                      </span>
                      <span className="text-lg font-black text-slate-900 group-hover:text-[#FF6B6B] transition-colors">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-slate-400 font-bold text-xs uppercase">
                      Investment
                    </span>
                    <span className="text-4xl font-black text-slate-900">
                      Ksh {price}
                    </span>
                  </div>
                  <a
                    href={whatsappLink}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF6B6B] text-white rounded-xl font-black hover:bg-slate-900 transition-all shadow-xl shadow-[#FF6B6B]/20"
                  >
                    Order Now
                    <MoveRight size={18} />
                  </a>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-12">
              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-6">
                  What Customers Are Saying
                </h3>
                <div className="space-y-6">
                  {[
                    {
                      name: "Catering Team",
                      text: "“Very strong and stable. We use it for catering events and it holds a lot of weight.”",
                    },
                    {
                      name: "Family in Nairobi",
                      text: "“Easy to fold and transport. Good quality table.”",
                    },
                  ].map((review, i) => (
                    <div
                      key={i}
                      className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm relative"
                    >
                      <div className="flex gap-1 text-[#FF6B6B] mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} fill="currentColor" />
                        ))}
                      </div>
                      <p className="text-slate-700 italic mb-4 font-medium">
                        {review.text}
                      </p>
                      <p className="text-slate-400 text-sm font-bold">
                        — {review.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-[#E7F6F8] rounded-2xl border-l-4 border-[#2D8E94]">
                <div className="flex items-start gap-4">
                  <MapPin className="text-[#2D8E94] mt-1 shrink-0" size={24} />
                  <p className="text-[#2D8E94] font-bold text-lg leading-relaxed">
                    Used by event planners, caterers, and families across
                    Nairobi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-24 bg-white">
        <MaxWidthWrapper>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 flex items-center justify-center gap-4">
              Questions? Answers.
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: "Is this table strong enough for heavy items?",
                a: "Yes. The steel frame is built specifically to handle heavy use without shaking or bending.",
              },
              {
                q: "Can it be used outdoors?",
                a: "Yes. It is suitable for outdoor events, garden parties, and open setups.",
              },
              {
                q: "Do you deliver in Nairobi?",
                a: "Yes. Fast delivery is available within Nairobi. We also deliver all over Kenya.",
              },
              {
                q: "How do I pay?",
                a: "We accept M-PESA and Cash on Delivery for orders within Nairobi.",
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="group p-8 rounded-2xl bg-white border border-slate-100 hover:border-[#FF6B6B] transition-all"
              >
                <h4 className="text-xl font-black text-slate-900 mb-4 flex items-center justify-between">
                  {faq.q}
                  <ChevronDown className="text-slate-300 group-hover:text-[#FF6B6B] transition-colors" />
                </h4>
                <p className="text-slate-600 font-medium leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      {/* --- FINAL CTA SECTION --- */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#FF6B6B]/10 blur-[120px] -mr-32" />

        <MaxWidthWrapper className="relative text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-6xl font-black mb-8 leading-tight">
              Need a Strong 1.8m Foldable Table Today?
            </h2>
            <p className="text-xl md:text-2xl text-slate-400 mb-12 font-medium">
              Limited stock available. This table is a practical, long-term
              solution — not a weak, short-term option.
            </p>

            <div className="grid sm:grid-cols-3 gap-6 mb-16">
              {[
                { t: "Fast Nairobi delivery", i: <Truck /> },
                { t: "M-PESA & Cash on Delivery", i: <CheckCircle2 /> },
                { t: "Strong, fold-flat, easy use", i: <Zap /> },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-4 p-6 bg-white/5 rounded-2xl border border-white/10"
                >
                  <div className="text-[#FF6B6B]">{item.i}</div>
                  <span className="font-bold text-sm">{item.t}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center gap-3 px-12 py-6 bg-[#25D366] text-white rounded-2xl text-xl font-black shadow-2xl shadow-[#25D366]/20 transition-all hover:scale-105 active:scale-95"
              >
                ORDER ON WHATSAPP NOW
                <FaWhatsapp size={28} />
                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform" />
              </a>
              <a
                href={`tel:${phoneNumber}`}
                className="flex items-center justify-center gap-3 px-12 py-6 bg-white text-slate-900 rounded-2xl text-xl font-black transition-all hover:bg-slate-200"
              >
                CALL US TO PLACE ORDER
              </a>
            </div>

            <div className="mt-16 pt-12 border-t border-white/10 grid grid-cols-2 md:grid-cols-3 gap-8 text-slate-500">
              <div className="flex flex-col items-center gap-2">
                <MapPin size={24} />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Based in Nairobi
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Package size={24} />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Real Product Photos
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 col-span-2 md:col-span-1">
                <Phone size={24} />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Friendly Support
                </span>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </section>

      {/* --- PREMIUM BOTTOM BAR --- */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-slate-100 p-4 pb-6 md:px-8 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="max-w-screen-md mx-auto flex flex-col sm:flex-row gap-4">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 relative flex items-center justify-center gap-3 py-4 bg-[#25D366] text-white rounded-2xl shadow-xl shadow-[#25D366]/20 transition-all active:scale-95 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
            <FaWhatsapp size={24} />
            <span className="font-black text-[15px] tracking-wider uppercase">
              Order via WhatsApp
            </span>
          </a>
          <a
            href={`tel:${phoneNumber}`}
            className="hidden sm:flex items-center justify-center gap-3 px-8 py-4 bg-slate-100 text-slate-900 rounded-2xl font-black hover:bg-slate-200 transition-all"
          >
            <Phone size={20} />
            <span>QUESTION? CALL US</span>
          </a>
        </div>
      </div>
    </div>
  );
}
