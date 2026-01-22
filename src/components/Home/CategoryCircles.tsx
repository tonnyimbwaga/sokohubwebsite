"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { getProductImageUrl } from "@/utils/product-images";

interface Category {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
}

export default function CategoryCircles({ categories }: { categories: Category[] }) {
    if (!categories || categories.length === 0) return null;

    return (
        <div className="w-full py-8 md:py-12 bg-white">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                        Shop by <span className="text-indigo-600">Category</span>
                    </h2>
                    <Link
                        href="/collections"
                        className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                    >
                        View All
                    </Link>
                </div>

                <div className="flex gap-4 sm:gap-8 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="flex-shrink-0 snap-start"
                        >
                            <Link href={`/collections/${category.slug}`} className="group flex flex-col items-center gap-4">
                                <div className="relative h-20 w-20 sm:h-28 sm:w-28 rounded-full bg-slate-50 border-2 border-transparent group-hover:border-indigo-500/50 group-hover:scale-105 transition-all duration-300 overflow-hidden p-1 shadow-sm group-hover:shadow-indigo-100 group-hover:shadow-xl">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-white">
                                        {category.image_url ? (
                                            <Image
                                                src={getProductImageUrl(category.image_url)}
                                                alt={category.name}
                                                width={120}
                                                height={120}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                                                <span className="text-2xl font-bold">{category.name[0]}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <span className="text-xs sm:text-sm font-bold text-slate-600 group-hover:text-indigo-600 transition-colors text-center max-w-[100px]">
                                    {category.name}
                                </span>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
