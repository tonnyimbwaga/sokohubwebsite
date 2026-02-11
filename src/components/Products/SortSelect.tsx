"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SortSelectProps {
    defaultValue?: string;
}

export default function SortSelect({ defaultValue = "newest" }: SortSelectProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", e.target.value);
        params.set("page", "1"); // Reset to page 1 on sort change
        router.push(`/products?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-neutral-500 whitespace-nowrap">Sort By:</span>
            <select
                defaultValue={defaultValue}
                onChange={handleSortChange}
                className="bg-white border border-neutral-200 rounded-xl px-4 py-2 text-sm font-semibold focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer hover:border-neutral-300 transition-colors"
            >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
            </select>
        </div>
    );
}
