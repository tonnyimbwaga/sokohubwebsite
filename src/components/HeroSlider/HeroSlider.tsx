"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsChevronLeft, BsChevronRight, BsLightningFill, BsFire } from "react-icons/bs";
import { FaStar, FaShippingFast } from "react-icons/fa";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { getProductImageUrl } from "@/utils/product-images";

interface HeroSlide {
  id: number;
  title: string;
  subtitle?: string;
  image_url: string;
  link_url: string;
  button_text: string;
  display_order: number;
  active: boolean;
}

const SlideNavigation = dynamic(() => import("./SlideNavigation"), {
  ssr: false,
});

export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (slides.length <= 1) return;

    let timer: NodeJS.Timeout;
    if (!isPaused) {
      timer = setInterval(() => {
        nextSlide();
      }, 4000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentIndex, slides.length, isPaused]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  if (slides.length === 0) {
    return (
      <div className="h-48 sm:h-64 bg-gray-100 animate-pulse rounded-xl my-7" />
    );
  }

  return (
    <div className="relative w-full mx-auto overflow-visible group mt-2 mb-4 md:mt-4 md:mb-8">
      {/* Floating badges */}
      <div className="absolute -top-4 left-4 z-50 flex gap-2 animate-slide-up">
        <Link href="#hottest-deals" scroll={true}>
          <motion.div
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-xs md:text-sm font-bold shadow-xl flex items-center gap-1 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <BsFire className="animate-pulse" /> HOT DEALS
          </motion.div>
        </Link>
        <Link href="#top-selling" scroll={true}>
          <motion.div
            className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-full text-xs md:text-sm font-bold shadow-xl flex items-center gap-1 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            <BsLightningFill /> TRENDING
          </motion.div>
        </Link>
      </div>

      <div
        className="relative w-full h-[320px] sm:h-[420px] md:h-[520px] rounded-3xl overflow-hidden shadow-2xl"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          boxShadow: '0 0 60px rgba(147, 51, 234, 0.1), 0 20px 40px rgba(0,0,0,0.2)'
        }}
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-transparent to-slate-600/10 z-10 pointer-events-none animate-pulse" />

        {/* Background images */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ${index === currentIndex ? "opacity-100 scale-100" : "opacity-0 scale-110"
              }`}
          >
            <Image
              src={getProductImageUrl(slide.image_url)}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
              quality={85}
              sizes="100vw"
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </div>
        ))}

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float z-5" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float z-5" style={{ animationDelay: '1s' }} />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center h-full z-20 px-4 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {/* Badge above title */}
              <motion.div
                className="inline-flex items-center gap-2 bg-secondary text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FaStar className="animate-spin" style={{ animationDuration: '3s' }} />
                EXCLUSIVE OFFER
                <FaStar className="animate-spin" style={{ animationDuration: '3s' }} />
              </motion.div>

              <h2 className="text-white text-2xl md:text-6xl font-black mb-2 md:mb-4 leading-tight tracking-tight drop-shadow-2xl">
                <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent animate-glow">
                  {slides[currentIndex]?.title}
                </span>
              </h2>

              {slides[currentIndex]?.subtitle && (
                <p className="text-white text-base md:text-2xl mb-2 md:mb-4 font-semibold drop-shadow-lg">
                  {slides[currentIndex]?.subtitle}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                <Link
                  href="/products"
                  className="group relative inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-full text-base md:text-xl font-black transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-purple-500/50 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10">{slides[currentIndex]?.button_text}</span>
                  <BsLightningFill className="relative z-10 group-hover:animate-wiggle" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-30 bg-white/90 text-slate-800 p-4 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white shadow-xl"
        >
          <BsChevronLeft size={24} className="font-bold" />
        </button>
        <button
          onClick={nextSlide}
          className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-30 bg-white/90 text-slate-800 p-4 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white shadow-xl"
        >
          <BsChevronRight size={24} className="font-bold" />
        </button>

        {/* Animated progress bar */}
        <div className="absolute bottom-0 left-0 w-full h-2 bg-black/30 z-30">
          <motion.div
            key={currentIndex}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 4, ease: "linear" }}
            className="h-full bg-gradient-to-r from-purple-400 via-pink-300 to-purple-400 shadow-lg shadow-purple-500/50"
          />
        </div>

        {/* Dots navigation */}
        <SlideNavigation
          slides={slides}
          currentSlide={currentIndex}
          onSlideChange={goToSlide}
        />
      </div>

      {/* Floating trust badges below hero */}
      <div className="flex flex-wrap justify-center gap-3 mt-6 px-4">
        <motion.div
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full text-xs md:text-sm font-bold shadow-lg"
          whileHover={{ scale: 1.05 }}
        >
          <FaStar className="text-white" /> 5-Star Rated
        </motion.div>
        <motion.div
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full text-xs md:text-sm font-bold shadow-lg"
          whileHover={{ scale: 1.05 }}
        >
          <FaShippingFast /> Fast Delivery
        </motion.div>
        <motion.div
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-xs md:text-sm font-bold shadow-lg"
          whileHover={{ scale: 1.05 }}
        >
          <BsLightningFill /> 24/7 Support
        </motion.div>
      </div>
    </div>
  );
}
