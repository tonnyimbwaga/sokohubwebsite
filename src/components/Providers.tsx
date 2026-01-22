"use client";

import { CartProvider } from "@/hooks/useCart";
import QueryProvider from "@/providers/QueryProvider";
import { useEffect, useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only render children after hydration
  if (!isClient) {
    return null;
  }

  return (
    <QueryProvider>
      <CartProvider>{children}</CartProvider>
    </QueryProvider>
  );
}
