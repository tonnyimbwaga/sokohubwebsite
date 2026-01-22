import type { Metadata } from "next";
import React from "react";
import Image from "next/image";
import { Inter } from "next/font/google";
import { MaxWidthWrapper } from "@/components/MaxWidthWrapper";
import { Phone, Truck, Share2, MapPin } from "lucide-react";
import { FaFacebook, FaTwitter, FaWhatsapp } from "react-icons/fa";
import { siteConfig } from "@/config/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: `The 15 Best Gifts for Kids in ${siteConfig.localization.country} (2025 Reviews) | ${siteConfig.name}`,
  description:
    `Our expert picks for the top 15 gifts for kids in ${siteConfig.localization.country}. From trampolines to creative play sets, we help you find the perfect gift with delivery across the country.`,
  keywords:
    `best gifts for kids ${siteConfig.localization.country}, top toys 2025 ${siteConfig.localization.city}, kids birthday gifts ${siteConfig.localization.country}, trampoline prices ${siteConfig.localization.country}, ride on cars ${siteConfig.localization.city}`,
  openGraph: {
    title: `The 15 Best Gifts for Kids in ${siteConfig.localization.country} (2025 Reviews)`,
    description:
      "Finding the right gift is hard. We tested and picked the 15 best options for kids.",
    url: `${siteConfig.url}/best-gifts-for-kids-in-kenya`,
    type: "article",
    images: [
      {
        url: `${siteConfig.url}/images/best-gifts-og.png`,
        width: 1200,
        height: 630,
        alt: `Expert guide to the best gifts for kids in ${siteConfig.localization.country}`,
      },
    ],
  },
};

const gifts = [
  {
    id: 1,
    title: "Trampolines",
    benefit:
      "A trampoline is more than just a toy. It is a way for your child to stay active and healthy. Jumping helps build strong bones and muscles. It also helps with balance. Your kids will love spending hours outdoors instead of watching television.",
    price: "From Ksh 9,850",
    details:
      "You can get the 4ft size for Ksh 9,850 or the larger 6ft size for Ksh 24,900. Both are very safe and built to last.",
    imageName: "kids-trampoline-kenya.png",
    whyWeLikeIt:
      "We like this because it burns energy and keeps kids fit while they have the time of their lives.",
  },
  {
    id: 2,
    title: "Bikes and Tricycles",
    benefit:
      "Learning to ride a bike is a big moment for every child. Our BMX bikes are stylish and very strong. They help kids feel independent. For younger children, our premium tricycles are perfect because they come with a sun canopy and a handle for parents to push.",
    price: "From Ksh 8,499",
    details:
      "Bikes come in sizes 12, 16, 20, and 24. Premium tricycles are Ksh 8,499.",
    imageName: "kids-bmx-bike-tricycle-kenya.png",
    whyWeLikeIt:
      "This is a classic gift that helps children develop coordination and confidence on the road.",
  },
  {
    id: 3,
    title: "Ride-In Cars",
    benefit:
      "If you want to see your child’s face light up, a ride-in car is the answer. These cars look just like real luxury vehicles. They have working lights and music. Kids can drive them, or parents can use a remote control to help move the car safely.",
    price: "Ksh 32,500",
    details:
      "These are battery-powered and very easy to charge. Suitable for kids aged 2 to 6.",
    imageName: "electric-ride-on-cars-kids-kenya.png",
    whyWeLikeIt:
      "It makes children feel like adults and provides endless fun in the estate or backyard.",
  },
  {
    id: 4,
    title: "Kitchen Sets",
    benefit:
      "Kitchen sets are wonderful for creative play. Your child can pretend to cook meals for the whole family. This helps them learn about different foods and how to share with others. We have sets made of high-quality wood or colorful plastic.",
    price: "High Quality",
    details:
      "Various sizes available. Wooden sets are very durable and look beautiful in any room.",
    imageName: "kids-kitchen-play-set-wooden.png",
    whyWeLikeIt:
      "It encourages role-play and helps kids understand the world around them in a fun way.",
  },
  {
    id: 5,
    title: "Remote-Controlled Cars",
    benefit:
      "Remote-controlled (RC) cars are exciting for kids of all ages. Controlling the car helps improve hand-eye coordination. It is a great way for parents and kids to play together outside.",
    price: "Starting at Ksh 2,500",
    details:
      "We have fast racing cars and tough off-road trucks that can handle dirt and grass.",
    imageName: "remote-controlled-cars-kids-kenya.png",
    whyWeLikeIt:
      "They are simple to use and provide instant excitement the moment you turn them on.",
  },
  {
    id: 6,
    title: "Piggy Banks",
    benefit:
      "It is never too early to learn about money. A piggy bank teaches your child how to save up for the things they want. We have electronic ones that use a code and traditional ones that look very cute.",
    price: "Great Value",
    details: "A simple but very important gift for every growing child.",
    imageName: "electronic-piggy-bank-kids-kenya.png",
    whyWeLikeIt:
      "This gift teaches a valuable life lesson about patience and the value of saving.",
  },
  {
    id: 7,
    title: "Skates and Skateboards",
    benefit:
      "Skating is a fun way to travel and exercise. Inline skates and quad skates help kids build strong legs and better balance. They are perfect for children who love to move fast and be active.",
    price: "Adjustable Sizes",
    details:
      "The sizes are adjustable, so the skates will fit even as your child’s feet grow.",
    imageName: "kids-inline-skates-skateboard-kenya.png",
    whyWeLikeIt:
      "It is a cool way for kids to hang out with friends while staying fit and active.",
  },
  {
    id: 8,
    title: "Dressing Tables & Makeup Sets",
    benefit:
      "These sets allow children to explore their creative side. They can pretend to get ready for a big party or a special event. Everything is designed to be safe for kids to play with.",
    price: "Kid-Safe",
    details:
      "Includes mirrors, brushes, and colorful pretend makeup accessories.",
    imageName: "kids-dressing-table-makeup-set.png",
    whyWeLikeIt:
      "It sparks imagination and lets children express their own unique style.",
  },
  {
    id: 9,
    title: "Bouncing Castles",
    benefit:
      "You don’t need to wait for a birthday party to have a bouncing castle. Our home sizes are perfect for the backyard. They are safe, soft, and will keep your kids active for hours.",
    price: "For Ages 3-6",
    details:
      "Safe and easy to inflate. Perfect for small families with active children.",
    imageName: "inflatable-bouncing-castle-kids-kenya.png",
    whyWeLikeIt:
      "It turns your own home into a playground and is the ultimate fun for young kids.",
  },
  {
    id: 10,
    title: "Slides and Swing Sets",
    benefit:
      "Every child loves to slide and swing. These sets help them build physical strength and overcome the fear of heights. We have sets that include both a slide and a swing for double the fun.",
    price: "Strong & Durable",
    details:
      "Made from high-quality materials that can stay outdoors in various weather.",
    imageName: "kids-slide-and-swing-set-kenya.png",
    whyWeLikeIt:
      "It provides a safe place for kids to play right in the safety of your home.",
  },
  {
    id: 11,
    title: "Scooters",
    benefit:
      "Scooters are very popular because they are easy to carry and fun to ride. We have many types, including electric ones for older kids and 3-in-1 designs for beginners.",
    price: "From Ksh 3,500",
    details:
      "Lightweight and easy to store when the children are finished playing.",
    imageName: "kids-scooter-electric-kenya.png",
    whyWeLikeIt:
      "They are great for balance and a quick way for kids to move around the estate.",
  },
  {
    id: 12,
    title: "Foosball",
    benefit:
      "Foosball is a great game for the whole family to play together. It helps kids learn how to think fast and move their hands quickly. It is perfect for indoor play during the rainy season.",
    price: "Family Size",
    details: "A sturdy table that can withstand many matches and years of fun.",
    imageName: "foosball-table-kids-kenya.png",
    whyWeLikeIt:
      "It encourages friendly competition and is a great way to bond as a family.",
  },
  {
    id: 13,
    title: "Hoverboards",
    benefit:
      "Hoverboards are a modern gift for tech-savvy kids. Balancing on a hoverboard helps kids focus and improves their coordination. Our 8-inch hoverboards are stable and very fun to ride.",
    price: "8-inch Stable",
    details:
      "Rechargeable battery with built-in safety features for new riders.",
    imageName: "hoverboard-8-inch-kids-kenya.png",
    whyWeLikeIt:
      'It is the ultimate "cool" gift that kids in Nairobi are always asking for.',
  },
  {
    id: 14,
    title: "Drum Sets for Kids",
    benefit:
      "If your child loves music, a drum set is a fantastic gift. It helps them develop a sense of rhythm and gives them a way to express their energy in a creative way.",
    price: "Complete Set",
    details:
      "Includes everything a little musician needs to start playing today.",
    imageName: "junior-drum-set-kids-kenya.png",
    whyWeLikeIt:
      "Music is great for the brain and drumming is one of the most exciting ways to start.",
  },
  {
    id: 15,
    title: "Pretend Play Sets",
    benefit:
      "Whether they want to be a doctor, host a tea party, or play in a tent house, these sets spark pure imagination. They help kids learn about different jobs and how to be kind to others.",
    price: "Endless Choice",
    details: "Choose from doctor kits, tea sets, doll houses, and play tents.",
    imageName: "pretend-play-doctor-tea-set-kenya.png",
    whyWeLikeIt:
      "It provides hours of quiet, imaginative play that children truly enjoy.",
  },
];

export default function BestGiftsPage() {
  const phoneNumber = siteConfig.contact.phone;
  const siteUrl = `${siteConfig.url}/best-gifts-for-kids-in-kenya`;
  const pageTitle = `The 15 Best Gifts for Kids in ${siteConfig.localization.country} (2025 Reviews)`;

  const encode = (str: string) => encodeURIComponent(str);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encode(siteUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encode(
      siteUrl,
    )}&text=${encode(pageTitle)}`,
    whatsapp: `https://wa.me/?text=${encode(pageTitle + " " + siteUrl)}`,
  };

  const imagesPath = "/images/best-gifts-for-kids/";

  const getOrderLink = (product: string, price: string) => {
    const message = `Order Form\n----------\nProduct: ${product}\nPrice: ${price}\n\nI'm interested in buying this gift. Please get back to me.`;
    return `https://wa.me/${siteConfig.contact.whatsapp.replace(/\+/g, "")}?text=${encode(message)}`;
  };

  return (
    <div
      className={`${inter.variable} font-sans min-h-screen bg-white text-slate-900 pb-24`}
    >
      {/* Editorial Header */}
      <MaxWidthWrapper className="pt-12 md:pt-20">
        <div className="max-w-screen-md mx-auto">
          <div className="flex items-center gap-2 text-[13px] font-bold text-[#FF6B6B] uppercase tracking-widest mb-4">
            <Share2 size={14} />
            <span>Expert Recommendations</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#1a1a1a] leading-[1.1] mb-6">
            The 15 Best <span className="text-[#FF6B6B]">Gifts for Kids</span>{" "}
            in {siteConfig.localization.country}
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 leading-relaxed font-medium mb-8">
            We spent weeks researching the safest, most fun, and high-quality
            gifts. These are our top picks for kids in {siteConfig.localization.city} and across {siteConfig.localization.country}.
          </p>
          <div className="flex items-center justify-between border-y border-slate-100 py-6 mb-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                {siteConfig.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  By {siteConfig.name} Team
                </div>
                <div className="text-[12px] text-slate-400">
                  Updated December 2025
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-[#1877F2] hover:bg-[#1877F2]/10 transition-all"
                aria-label="Share on Facebook"
              >
                <FaFacebook size={20} />
              </a>
              <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 transition-all"
                aria-label="Share on X"
              >
                <FaTwitter size={20} />
              </a>
              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-[#25D366] hover:bg-[#25D366]/10 transition-all"
                aria-label="Share on WhatsApp"
              >
                <FaWhatsapp size={20} />
              </a>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>

      {/* Main Content Layout */}
      <MaxWidthWrapper>
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Table of Contents - Left Sidebar */}
          <aside className="lg:w-1/4 shrink-0 hidden lg:block sticky top-32 h-fit">
            <div className="border-l-2 border-slate-50 pl-6 py-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">
                In this guide
              </h3>
              <nav className="space-y-4">
                {gifts.map((gift) => (
                  <a
                    key={gift.id}
                    href={`#gift-${gift.id}`}
                    className="block text-[14px] font-medium text-slate-500 hover:text-[#FF6B6B] transition-colors leading-tight"
                  >
                    {gift.id}. {gift.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Article Body */}
          <div className="flex-1 max-w-screen-md mx-auto">
            {/* Introductory Text */}
            <div className="prose prose-slate prose-lg max-w-none mb-16">
              <p className="text-[18px] leading-[1.7] text-slate-700">
                Finding the right gift for a child can feel impossible. You want
                something they will actually use, something that lasts, and
                something that doesn’t just sit in a corner.
              </p>
              <div className="bg-[#E7F6F8] border-l-4 border-[#2D8E94] p-6 my-10 rounded-r-xl">
                <div className="flex items-start gap-4">
                  <Truck className="text-[#2D8E94] mt-1 shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold text-[#2D8E94] mb-1">
                      {siteConfig.localization.city} Delivery Info
                    </h4>
                    <p className="text-sm text-[#2D8E94]/80 leading-relaxed italic">
                      We offer delivery within {siteConfig.localization.city}. Most importantly, you can{" "}
                      <strong>pay only after you have seen the item</strong> and
                      are happy with it ({siteConfig.localization.city} only).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gift List */}
            <div className="space-y-24">
              {gifts.map((gift) => (
                <section
                  key={gift.id}
                  id={`gift-${gift.id}`}
                  className="scroll-mt-32 border-t border-slate-50 pt-16"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <span className="flex items-center justify-center w-12 h-12 bg-[#FF6B6B] text-white font-black text-xl rounded-2xl shadow-lg shadow-[#FF6B6B]/20">
                      {gift.id}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                      {gift.title}
                    </h2>
                  </div>

                  {/* Card-like Product Block */}
                  <div className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.1)] transition-all duration-500 mb-10">
                    <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden">
                      <Image
                        src={`${imagesPath}${gift.imageName}`}
                        alt={`The best ${gift.title} for kids in ${siteConfig.localization.country}`}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 1024px) 100vw, 800px"
                        unoptimized={true}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="p-8 md:p-10">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                          <MapPin size={16} />
                          <span>{siteConfig.name.toUpperCase()} RECOMMENDED</span>
                        </div>
                        <div className="text-2xl font-black text-[#FF6B6B]">
                          {gift.price}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h4 className="text-[12px] font-black uppercase tracking-widest text-[#FF6B6B] mb-3">
                            Why we like it
                          </h4>
                          <p className="text-[16px] leading-[1.6] text-slate-700 font-medium">
                            {gift.benefit}
                          </p>
                        </div>

                        <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                          <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-400 mb-2">
                            The Details
                          </h4>
                          <p className="text-[14px] text-slate-500 italic leading-snug">
                            {gift.details}
                          </p>
                        </div>
                      </div>

                      <div className="mt-10 flex flex-col sm:flex-row gap-4">
                        <a
                          href={getOrderLink(gift.title, gift.price)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center px-8 py-5 bg-[#25D366] text-white rounded-2xl text-[16px] font-bold hover:bg-[#1fb355] transition-all transform active:scale-95 shadow-xl shadow-[#25D366]/10"
                        >
                          <FaWhatsapp size={20} className="mr-3" />
                          Order via WhatsApp
                        </a>
                        <a
                          href={`tel:${phoneNumber}`}
                          className="px-8 py-5 border-2 border-slate-100 text-slate-900 rounded-2xl text-[15px] font-bold hover:border-[#FF6B6B] hover:text-[#FF6B6B] transition-all flex items-center justify-center"
                        >
                          <Phone size={18} className="mr-3" />
                          Questions? Call Us
                        </a>
                      </div>
                    </div>
                  </div>
                </section>
              ))}
            </div>

            {/* Bottom Final Note */}
            <div className="mt-24 bg-slate-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B6B] rounded-full blur-[100px] opacity-20 -mr-32 -mt-32" />
              <h3 className="text-3xl font-black mb-6 relative">
                Still unsure which gift to pick?
              </h3>
              <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto relative leading-relaxed">
                We are parents too, and we know how important it is to get it
                right. Chat with us on WhatsApp or call us. We will help you
                choose the best gift based on your budget and your child&apos;s age.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
                <a
                  href={shareLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-10 py-5 bg-[#FF6B6B] rounded-2xl font-bold text-white hover:bg-white hover:text-slate-900 transition-all shadow-2xl shadow-[#FF6B6B]/20"
                >
                  Start Chatting with Us
                </a>
                <a
                  href={`tel:${phoneNumber}`}
                  className="px-10 py-5 bg-white/10 rounded-2xl font-bold text-white hover:bg-white/20 transition-all"
                >
                  Call: {phoneNumber}
                </a>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>

      {/* Premium Bottom Action Bar (Fixed) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-100 p-4 pb-6 md:px-8 pointer-events-none">
        <div className="max-w-screen-md mx-auto pointer-events-auto">
          <a
            href={`https://wa.me/${siteConfig.contact.whatsapp.replace(/\+/g, "")}?text=${encode(
              `Hi ${siteConfig.name}! I saw the top 15 gifts list and need some help.`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="relative flex items-center justify-center gap-3 w-full py-4 bg-[#25D366] text-white rounded-2xl shadow-xl shadow-[#25D366]/20 transition-all active:scale-95 group overflow-hidden"
            aria-label="Order via WhatsApp"
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />

            <FaWhatsapp
              size={24}
              className="group-hover:rotate-12 transition-transform"
            />
            <span className="font-black text-[15px] tracking-wider uppercase">
              Order via WhatsApp
            </span>

            {/* Subtle pulse ring */}
            <div className="absolute inset-0 rounded-2xl animate-pulse-ring pointer-events-none border-2 border-[#25D366]/50" />
          </a>
        </div>
      </div>
    </div>
  );
}
