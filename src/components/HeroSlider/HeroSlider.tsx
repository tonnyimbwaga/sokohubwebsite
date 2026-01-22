"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import dynamic from "next/dynamic";
import Image from "next/image";
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
      }, 3500);
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
    <div className="relative w-[97vw] max-w-[1600px] mx-auto md:rounded-2xl overflow-hidden group shadow-lg mt-4 mb-6 md:mt-8 md:mb-12">
      <div
        className="relative w-full h-[260px] sm:h-[340px] md:h-[440px] bg-[#f8f9fa]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Unified background image and overlay */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={getProductImageUrl(slide.image_url)}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
              quality={75}
              sizes="100vw"
            />
          </div>
        ))}
        {/* Full-slide link */}
        <a
          href={slides[currentIndex]?.link_url}
          className="absolute inset-0 z-10 block"
          aria-label={slides[currentIndex]?.button_text || "Visit slide"}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center h-full z-20 px-4 text-center">
          <h2 className="text-gray-900 text-xl md:text-5xl font-bold mb-2 md:mb-3 leading-tight tracking-tight opacity-90 drop-shadow-none">
            {slides[currentIndex]?.title}
          </h2>
          {slides[currentIndex]?.subtitle && (
            <p className="text-gray-700 text-sm md:text-xl mb-2 md:mb-3 opacity-90">
              {slides[currentIndex]?.subtitle}
            </p>
          )}
          <a
            href={slides[currentIndex]?.link_url}
            className="inline-block bg-primary text-white px-6 py-2 rounded-full text-base md:text-lg font-semibold transition-all duration-300 hover:bg-black hover:scale-105 shadow-lg hover:shadow-xl transform hover:-translate-y-1 mt-1 z-30"
          >
            {slides[currentIndex]?.button_text}
          </a>
        </div>
        {/* Navigation Arrows (hidden on mobile) */}
        <button
          onClick={prevSlide}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/20 text-white p-3 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/40"
        >
          <BsChevronLeft size={20} />
        </button>
        <button
          onClick={nextSlide}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/20 text-white p-3 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/40"
        >
          <BsChevronRight size={20} />
        </button>
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 5, ease: "linear", repeat: Infinity }}
            className="h-full bg-primary/30"
          />
        </div>
        {/* Dots navigation */}
        <SlideNavigation
          slides={slides}
          currentSlide={currentIndex}
          onSlideChange={goToSlide}
        />
      </div>
    </div>
  );
}
