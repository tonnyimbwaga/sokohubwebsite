"use client";

import dynamic from "next/dynamic";
const HeroSlideManager = dynamic(
  () => import("@/components/Admin/HeroSlideManager"),
  { ssr: false },
);

export default function HeroSlidesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Manage Hero Slides</h1>
      <HeroSlideManager />
    </div>
  );
}
