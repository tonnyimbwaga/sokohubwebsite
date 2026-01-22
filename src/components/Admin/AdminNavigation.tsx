"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiBox,
  FiGrid,
  FiShoppingBag,
  FiSettings,
  FiTrendingUp,
  FiStar,
  FiPercent,
} from "react-icons/fi";

export default function AdminNavigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (!pathname) return false;
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: FiHome },
    { name: "Products", href: "/admin/products", icon: FiBox },
    { name: "Featured Products", href: "/admin/featured", icon: FiStar },
    { name: "Trending Products", href: "/admin/trending", icon: FiTrendingUp },
    { name: "Best Deals", href: "/admin/deals", icon: FiPercent },
    { name: "Categories", href: "/admin/categories", icon: FiGrid },
    { name: "Orders", href: "/admin/orders", icon: FiShoppingBag },
    { name: "Settings", href: "/admin/settings", icon: FiSettings },
  ];

  return (
    <nav className="mb-8 bg-white rounded-lg shadow p-4">
      <ul className="flex flex-wrap gap-2">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                isActive(item.href)
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
