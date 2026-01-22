"use client";

import Link from "next/link";
import { FaPhone, FaMoneyBillWave } from "react-icons/fa";
import { siteConfig } from "@/config/site";

const TopStrip = () => {
  return (
    <div className="bg-primary text-black">
      <div className="container flex flex-col items-center justify-between gap-2 py-2 text-sm md:flex-row md:gap-4">
        <div className="flex items-center gap-2">
          <FaMoneyBillWave className="h-4 w-4" />
          <span>Payment After Delivery within Nairobi</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={`tel:${siteConfig.contact.phone.replace(/\s+/g, '')}`}
            className="flex items-center gap-2 hover:text-gray-800"
          >
            <FaPhone className="h-4 w-4" />
            <span>{siteConfig.contact.phone}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopStrip;
