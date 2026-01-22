"use client";

import { usePathname, useRouter } from "next/navigation"; // Import useRouter
import Link from "next/link";
import {
  FiHome,
  FiPackage,
  FiShoppingCart,
  FiFileText,
  FiGrid,
  FiSettings,
  FiLogOut,
  FiImage,
  FiStar,
  FiTrendingUp,
  FiPercent,
} from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";

import { useNewOrderCount } from "@/hooks/useNewOrderCount";
import AdminSessionStatus from "./AdminSessionStatus";
import { siteConfig } from "@/config/site";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  showBadge?: boolean;
}

interface AdminSidebarProps {
  onNavigate?: () => void;
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: FiHome },
  { name: "Products", href: "/admin/products", icon: FiPackage },
  { name: "Featured Products", href: "/admin/featured", icon: FiStar },
  { name: "Trending Products", href: "/admin/trending", icon: FiTrendingUp },
  { name: "Best Deals", href: "/admin/deals", icon: FiPercent },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: FiShoppingCart,
    showBadge: true, // Mark this nav item to show badge
  },
  { name: "Blog Posts", href: "/admin/blog", icon: FiFileText },
  { name: "Categories", href: "/admin/categories", icon: FiGrid },
  { name: "Hero Slides", href: "/admin/hero-slides", icon: FiImage },
  { name: "Settings", href: "/admin/settings", icon: FiSettings },
];

export default function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter(); // Initialize useRouter

  // Use Supabase Auth Helpers client for consistent cookie management
  const supabaseClient = createClient();
  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    router.push("/login?message=signed_out_successfully");
  };

  const { newOrderCount, resetNewOrderCount } = useNewOrderCount();
  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex h-full flex-col bg-white/40 backdrop-blur-xl border-r border-slate-200/50">
      {/* Brand Header */}
      <div className="p-8">
        <div className="flex items-center gap-3 px-2">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200/50">
            <FiPackage className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {siteConfig.shortName} <span className="text-indigo-600">Admin</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Control Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-2 overflow-y-auto scrollbar-none">
        <p className="px-4 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Menu</p>
        <nav className="space-y-1.5">
          {navigation.map((item) => {
            const active = isActive(item.href);
            const showBadge = item.showBadge && newOrderCount > 0;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${active
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : "text-slate-600 hover:bg-white/60 hover:text-indigo-600 hover:translate-x-1"
                  }`}
                onClick={() => {
                  if (onNavigate) onNavigate();
                  if (showBadge) resetNewOrderCount();
                }}
              >
                <div className={`p-1 rounded-lg transition-colors ${active ? "text-white" : "text-slate-400 group-hover:text-indigo-600"}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="flex-1">{item.name}</span>
                {showBadge && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-bounce">
                    {newOrderCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Profile Section */}
      <div className="p-6 mt-auto">
        <div className="rounded-3xl bg-slate-900/5 p-2 border border-white/40 shadow-inner">
          <div className="p-4 mb-2">
            <AdminSessionStatus />
          </div>
          <button
            onClick={() => {
              handleSignOut();
              onNavigate?.();
            }}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-white/80 py-3 text-sm font-bold text-red-500 shadow-sm border border-red-100 hover:bg-red-500 hover:text-white transition-all duration-300"
          >
            <FiLogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Sign Out
          </button>
        </div>
        <div className="mt-6 text-center">
          <p className="text-[10px] font-medium text-slate-400">© 2026 {siteConfig.name}</p>
        </div>
      </div>
    </div>
  );
}
