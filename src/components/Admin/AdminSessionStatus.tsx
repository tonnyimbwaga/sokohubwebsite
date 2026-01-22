"use client";

import React from "react";
import { useAdminSessionTimeout } from "@/hooks/useAdminSessionTimeout";

interface AdminSessionStatusProps {
  className?: string;
}

export default function AdminSessionStatus({
  className = "",
}: AdminSessionStatusProps) {
  const { isAuthenticated } = useAdminSessionTimeout();

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50/80 border border-slate-200/50 ${className}`}
    >
      <div
        className={`w-2 h-2 rounded-full shadow-sm ${
          isAuthenticated ? "bg-emerald-500" : "bg-slate-400"
        }`}
        title={isAuthenticated ? "Signed In" : "Signed Out"}
      />
      <span className="text-xs font-medium text-slate-700">
        {isAuthenticated ? "Online" : "Offline"}
      </span>
    </div>
  );
}
