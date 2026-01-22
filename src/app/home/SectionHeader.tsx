"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

import { headerSection } from "@/data/content";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";

const SectionHeader = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  let debounceTimeout: NodeJS.Timeout;

  const handleSearch = async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, images")
      .ilike("name", `%${q}%`)
      .limit(8);
    setLoading(false);
    if (error) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setResults(data || []);
    setShowDropdown(true);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearch(q);
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => handleSearch(q), 250);
  };

  const handleIconClick = () => {
    handleSearch(search);
    inputRef.current?.focus();
  };

  const handleResultClick = (id: string) => {
    setShowDropdown(false);
    setSearch("");
    router.push(`/products/${id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(search);
    }
  };

  return (
    <div className="container">
      <div className="relative flex flex-col-reverse items-center gap-4 md:gap-8 rounded-2xl bg-primary/10 p-6 md:p-8 lg:p-12">
        <motion.div
          className="flex-1 text-center md:text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative mb-4 flex justify-center md:justify-start">
            <input
              ref={inputRef}
              value={search}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Search for products..."
              className="rounded-l-md border border-gray-300 px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-primary"
              onFocus={() => search && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 120)}
            />
            <button
              onClick={handleIconClick}
              className="rounded-r-md bg-primary px-4 py-2 text-white hover:bg-primary-dark"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                />
              </svg>
            </button>
            {showDropdown && (
              <div className="absolute left-0 top-12 z-20 w-full rounded-md border bg-white shadow-lg">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">
                    Searching...
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No products found
                  </div>
                ) : (
                  results.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onMouseDown={() => handleResultClick(product.id)}
                    >
                      <img
                        src={
                          Array.isArray(product.images) &&
                            product.images.length > 0
                            ? product.images[0]
                            : "/placeholder.png"
                        }
                        alt={product.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          Ksh {product.price?.toLocaleString("en-KE")}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <motion.h4
            className="mb-4 text-xl font-medium text-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {headerSection.title}
          </motion.h4>
          <motion.h1
            className="mb-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {headerSection.heading}
          </motion.h1>
          <motion.p
            className="mb-8 text-lg text-gray-600 md:w-4/5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {headerSection.description}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href="/products">
              <ButtonPrimary sizeClass="px-8 py-4 text-lg">
                Shop Now
              </ButtonPrimary>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="w-full md:w-2/5"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src={headerSection.image}
            alt="Happy kids playing with toys"
            width={500}
            height={500}
            className="rounded-lg"
            priority
          />
        </motion.div>
      </div>
    </div>
  );
};

export default SectionHeader;
