"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { getProductImageUrl } from "@/utils/product-images";

interface Banner {
    id: string;
    title: string;
    image_url: string;
    link_url: string;
}

export default function GridBanners({ banners }: { banners: Banner[] }) {
    if (!banners || banners.length === 0) return null;

    // We support 2, 3, or 4 banners in a grid
    const gridCols = banners.length === 2 ? "grid-cols-1 md:grid-cols-2" :
        banners.length === 3 ? "grid-cols-1 md:grid-cols-3" :
            "grid-cols-2 md:grid-cols-4";

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 my-8 md:my-16">
            <div className={`grid ${gridCols} gap-4 sm:gap-6`}>
                {banners.map((banner, index) => (
                    <motion.div
                        key={banner.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="relative group overflow-hidden rounded-[32px] aspect-[16/9] md:aspect-[4/5] shadow-lg hover:shadow-2xl transition-all duration-500"
                    >
                        <Link href={banner.link_url} className="block w-full h-full">
                            <Image
                                src={getProductImageUrl(banner.image_url)}
                                alt={banner.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute bottom-0 left-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <h3 className="text-white text-xl font-black tracking-tight">{banner.title}</h3>
                                <p className="text-white/80 text-sm font-bold uppercase tracking-widest mt-2">Shop Now</p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
