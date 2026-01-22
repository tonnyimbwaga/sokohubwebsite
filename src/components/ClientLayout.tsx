"use client";

import React from "react";

import { CartProvider } from "@/hooks/useCart";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartProvider>{children}</CartProvider>;
}
