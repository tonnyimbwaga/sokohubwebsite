import React from "react";
import { FaMoneyBillWave, FaPhoneAlt } from "react-icons/fa";

const TopNav = () => {
  return (
    <div className="bg-primary py-2 text-white">
      <div className="container flex items-center justify-center text-sm space-x-4">
        <span className="hidden sm:flex items-center gap-1">
          <FaMoneyBillWave className="inline-block" />
          Payment After Delivery
        </span>
        <span className="flex items-center gap-1">
          <FaPhoneAlt className="inline-block" />
          <span className="ml-1">
            WhatsApp or Call to Order:
            <a
              href="https://wa.me/254756161300"
              className="underline hover:text-gray-200 ml-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              0756 161 300
            </a>
          </span>
        </span>
      </div>
    </div>
  );
};

export default TopNav;
