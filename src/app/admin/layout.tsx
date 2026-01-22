"use client";

import React from "react";
import AdminSidebar from "@/components/Admin/AdminSidebar";
import { Toaster } from "react-hot-toast";
import { useAdminSessionTimeout } from "@/hooks/useAdminSessionTimeout";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Initialize admin session timeout (3 hours - simple and efficient)
  useAdminSessionTimeout();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        {/* Mobile sidebar backdrop */}
        <div
          className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity lg:hidden ${sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          onClick={closeSidebar}
        />

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white/80 backdrop-blur-xl border-r border-slate-200/50 shadow-2xl transition-all duration-500 ease-out lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <AdminSidebar onNavigate={closeSidebar} />
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile header */}
          <header className="flex h-16 items-center justify-between border-b border-slate-200/50 bg-white/80 backdrop-blur-sm px-6 shadow-sm lg:hidden">
            <button
              type="button"
              className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100/80 hover:text-slate-800 transition-all duration-200"
              onClick={toggleSidebar}
            >
              <span className="sr-only">Open sidebar</span>
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-slate-900">
              Admin Panel
            </h1>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "12px",
            background: "rgba(15, 23, 42, 0.95)",
            color: "#fff",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(148, 163, 184, 0.1)",
          },
        }}
      />
    </>
  );
}
