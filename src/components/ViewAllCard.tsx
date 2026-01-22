"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowRight, FiGrid } from "react-icons/fi";

interface ViewAllCardProps {
  categoryName: string;
  categorySlug: string;
  className?: string;
}

const ViewAllCard = ({
  categoryName,
  categorySlug,
  className = "",
}: ViewAllCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group ${className}`}
    >
      <Link href={`/category/${categorySlug}`} className="block h-full">
        <div className="h-full bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg overflow-hidden">
          {/* Content Section - Focus on "View All" message */}
          <div className="aspect-square flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20 relative overflow-hidden p-6 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />

            {/* Main Call to Action */}
            <div className="relative z-10 space-y-4">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="text-primary/80"
              >
                <FiArrowRight className="w-12 h-12 mx-auto" />
              </motion.div>

              <div className="space-y-2">
                <h3 className="font-bold text-xl text-primary">View All</h3>
                <p className="text-sm text-primary/70 font-medium">
                  More {categoryName.toLowerCase()}
                </p>
                <p className="text-xs text-primary/60">Browse Collection</p>
              </div>
            </div>

            {/* Subtle background elements */}
            <div className="absolute top-4 right-4 w-2 h-2 bg-primary/20 rounded-full animate-pulse" />
            <div className="absolute bottom-6 left-4 w-1 h-1 bg-primary/30 rounded-full animate-pulse delay-300" />
          </div>

          {/* Bottom Section - Minimal */}
          <div className="p-3 bg-white/50 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-xs text-gray-500">Discover more products</p>
            </div>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      </Link>
    </motion.div>
  );
};

export default ViewAllCard;
