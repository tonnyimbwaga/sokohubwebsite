import { notFound } from "next/navigation";
import React from "react";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

const validPages = ["faq", "faqs", "safety", "careers", "privacy", "terms"];

export default async function Page({ params }: Props) {
  const { slug } = await params;

  if (!validPages.includes(slug)) {
    notFound();
  }

  const title = slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-white">
      <h1 className="text-4xl font-bold mb-4">{title}</h1>
      <p className="text-lg text-gray-700">
        This is the {title} page. Content will be available soon.
      </p>
    </div>
  );
}
