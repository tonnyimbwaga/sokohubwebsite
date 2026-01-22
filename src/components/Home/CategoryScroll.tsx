"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface Category {
    id: string;
    name: string;
    slug: string;
    image_url?: string;
}

interface CategoryScrollProps {
    categories: Category[];
}

export default function CategoryScroll({ categories }: CategoryScrollProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer || categories.length === 0) return;

        let animationFrameId: number;
        let scrollPosition = 0;
        const scrollSpeed = 0.5; // Pixels per frame

        const scroll = () => {
            if (!isPaused && scrollContainer) {
                scrollPosition += scrollSpeed;

                // Reset scroll when reaching halfway (for infinite loop effect)
                if (scrollPosition >= scrollContainer.scrollWidth / 2) {
                    scrollPosition = 0;
                }

                scrollContainer.scrollLeft = scrollPosition;
            }
            animationFrameId = requestAnimationFrame(scroll);
        };

        animationFrameId = requestAnimationFrame(scroll);

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [isPaused, categories.length]);

    // Duplicate categories for infinite scroll effect
    const duplicatedCategories = [...categories, ...categories];

    const getCategoryImage = (category: Category) => {
        if (category.image_url) {
            return category.image_url;
        }
        // Fallback placeholder
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(category.name)}&size=200&background=FEEE00&color=000`;
    };

    if (categories.length === 0) {
        return null;
    }

    return (
        <div className="w-full bg-white py-6 overflow-hidden border-y border-gray-100">
            <div
                ref={scrollRef}
                className="flex gap-6 px-4 overflow-x-hidden"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                style={{ scrollBehavior: 'auto' }}
            >
                {duplicatedCategories.map((category, index) => (
                    <Link
                        key={`${category.id}-${index}`}
                        href={`/category/${category.slug}`}
                        className="flex-shrink-0 group"
                    >
                        <motion.div
                            className="flex flex-col items-center gap-2 w-24 sm:w-28"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {/* Image Container */}
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-md group-hover:shadow-xl transition-all duration-300">
                                <Image
                                    src={getCategoryImage(category)}
                                    alt={category.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                                    sizes="(max-width: 640px) 80px, 96px"
                                />
                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
                            </div>

                            {/* Category Name */}
                            <span className="text-xs sm:text-sm font-medium text-gray-700 text-center line-clamp-2 group-hover:text-primary transition-colors duration-200">
                                {category.name}
                            </span>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
