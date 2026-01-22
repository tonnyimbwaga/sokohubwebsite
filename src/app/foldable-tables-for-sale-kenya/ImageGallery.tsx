"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

interface ImageGalleryProps {
  images: { src: string; alt: string }[];
  imagesPath: string;
}

export function ImageGallery({ images, imagesPath }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Stop scrolling when modal is open
  useEffect(() => {
    if (activeIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [activeIndex]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeIndex === null) return;
      if (e.key === "Escape") closeImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex]);

  const openImage = (index: number) => setActiveIndex(index);
  const closeImage = () => setActiveIndex(null);
  const nextImage = () =>
    setActiveIndex((prev) =>
      prev !== null ? (prev + 1) % images.length : null,
    );
  const prevImage = () =>
    setActiveIndex((prev) =>
      prev !== null ? (prev - 1 + images.length) % images.length : null,
    );

  return (
    <div className="relative">
      {/* Gallery Grid - SEO Friendly as these are standard Image tags initially */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {images.map((img, i) => (
          <div
            key={i}
            className="aspect-square rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden relative group cursor-zoom-in"
            onClick={() => openImage(i)}
          >
            <Image
              src={`${imagesPath}${img.src}`}
              alt={img.alt}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-slate-900/10 transition-colors duration-300" />

            {/* Hover Overlay Icon */}
            <div className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg shadow-black/5">
              <Maximize2 size={18} className="text-[#FF6B6B]" />
            </div>
          </div>
        ))}
      </div>

      {/* Premium Lightbox Viewer */}
      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-12 transition-all duration-300 animate-in fade-in"
          onClick={closeImage}
        >
          {/* Close Area / Full Screen Overlay */}
          <div className="absolute inset-0 cursor-zoom-out" />

          {/* UI Controls */}
          <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-[110] pointer-events-none">
            <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#FF6B6B] animate-pulse" />
              <span className="text-white/90 text-xs font-black tracking-widest uppercase">
                Premium Product Detail
              </span>
            </div>
            <button
              className="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-[#FF6B6B] transition-all pointer-events-auto border border-white/10"
              onClick={closeImage}
              aria-label="Close viewer"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation Buttons */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 md:px-10 z-[110] pointer-events-none">
            <button
              className="w-14 h-14 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-slate-900 transition-all pointer-events-auto border border-white/10 shadow-2xl"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              aria-label="Previous image"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              className="w-14 h-14 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-slate-900 transition-all pointer-events-auto border border-white/10 shadow-2xl"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              aria-label="Next image"
            >
              <ChevronRight size={32} />
            </button>
          </div>

          {/* Main Image Container */}
          <div
            className="relative w-full h-[70vh] md:h-[80vh] flex items-center justify-center z-[105] pointer-events-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full max-w-6xl animate-in zoom-in-95 duration-500 transition-all">
              <Image
                src={`${imagesPath}${images[activeIndex].src}`}
                alt={images[activeIndex].alt}
                fill
                className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                priority
              />
            </div>
          </div>

          {/* Caption / Bottom UI */}
          <div className="mt-8 text-center max-w-2xl z-[110] relative">
            <p className="text-[#FF6B6B] font-black tracking-widest uppercase text-xs">
              Product Image {activeIndex + 1} of {images.length}
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes zoom-in-95 {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-in {
          animation-fill-mode: forwards;
        }
        .fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .zoom-in-95 {
          animation: zoom-in-95 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}
