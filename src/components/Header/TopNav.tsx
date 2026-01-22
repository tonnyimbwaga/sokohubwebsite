import React from "react";
import { FaMoneyBillWave, FaPhoneAlt } from "react-icons/fa";
import { siteConfig } from "@/config/site";

const TopNav = () => {
  const whatsappNumber = siteConfig.contact.whatsapp.replace(/\D/g, "");

  return (
    <div className="bg-slate-900 py-2 text-white">
      <div className="container flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-300">
            <FaMoneyBillWave className="text-emerald-400" />
            <span className="hidden xs:inline">Payment After Delivery Available</span>
            <span className="xs:hidden">Payment After Delivery</span>
          </span>
          <span className="h-4 w-px bg-slate-700 hidden sm:block" />
          <span className="hidden sm:flex items-center gap-1.5 text-slate-300">
            ⚡ Delivery within Nairobi CBD & beyond
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-slate-400">WhatsApp or Call to Order:</span>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            className="group relative flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-full font-black tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-emerald-900/20"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaPhoneAlt className="text-[10px] animate-pulse" />
            <span>{siteConfig.contact.phone.replace("+254 ", "0").replace(/\s/g, "")}</span>
            <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default TopNav;
