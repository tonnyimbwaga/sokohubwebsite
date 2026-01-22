"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MdSearch } from "react-icons/md";
import Input from "@/shared/Input/Input";
import { useDebounce } from "react-use";

const SearchInput = ({ defaultValue = "" }: { defaultValue?: string }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(defaultValue);

    useDebounce(
        () => {
            if (search === defaultValue) return;

            const params = new URLSearchParams(searchParams?.toString() || "");
            if (search) {
                params.set("q", search);
            } else {
                params.delete("q");
            }
            params.delete("page"); // Reset page on search

            router.push(`/products?${params.toString()}`);
        },
        500,
        [search]
    );

    return (
        <div className="relative flex flex-1 lg:w-80 lg:flex-none">
            <Input
                type="text"
                placeholder="Search products..."
                className="pr-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <MdSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-400" />
        </div>
    );
};

export default SearchInput;
