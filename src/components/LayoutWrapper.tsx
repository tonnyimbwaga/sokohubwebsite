"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

interface LayoutWrapperProps {
  children: ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isHomePage, setIsHomePage] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsHomePage(pathname === "/");
  }, [pathname]);

  // During SSR and initial client render, return a basic layout
  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col bg-white">{children}</div>
    );
  }

  return (
    <div
      className={`flex min-h-screen flex-col ${
        isHomePage ? "bg-white" : "bg-gray-50"
      }`}
    >
      {children}
    </div>
  );
}
