"use client";

import Link from "next/link";
import { FaPhone, FaTruck, FaMoneyBillWave } from "react-icons/fa";

const TopStrip = () => {
  return (
    <div className="bg-primary text-white">
      <div className="container flex flex-col items-center justify-between gap-2 py-2 text-sm md:flex-row md:gap-4">
        <div className="flex items-center gap-2">
          <FaMoneyBillWave className="h-4 w-4" />
          <span>Payment After Delivery within Nairobi</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="tel:+254113794389"
            className="flex items-center gap-2 hover:text-gray-200"
          >
            <FaPhone className="h-4 w-4" />
            <span>+254 113 794 389</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopStrip;
