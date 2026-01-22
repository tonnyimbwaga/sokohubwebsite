"use client";

import { useState } from "react";

interface CategoryHeroProps {
  title: string;
  description: string;
  imageUrl: string;
}

export default function CategoryHero({
  title,
  description,
  imageUrl,
}: CategoryHeroProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="relative h-64 bg-cover bg-center"
      style={{ backgroundImage: `url(${imageUrl})` }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="container relative z-10 mx-auto flex h-full items-center px-4">
        <div className="text-white">
          <h1 className="mb-2 text-4xl font-bold">{title}</h1>
          <p className={`text-lg text-gray-200 ${!expanded ? "clamp" : ""}`}>
            {description}
          </p>
          {!expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="mt-2 text-primary underline"
            >
              View more
            </button>
          )}
          {expanded && (
            <button
              onClick={() => setExpanded(false)}
              className="mt-2 text-primary underline"
            >
              View less
            </button>
          )}
        </div>
      </div>
      <style jsx>{`
        .clamp {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @media (max-width: 640px) {
          .clamp {
            -webkit-line-clamp: 1;
          }
        }
        @media (min-width: 641px) {
          .clamp {
            -webkit-line-clamp: 2;
          }
        }
      `}</style>
    </div>
  );
}
