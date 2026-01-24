"use client";

import React from "react";
import {
  FiShoppingCart,
  FiDollarSign,
  FiPackage,
  FiGrid,
  FiActivity,
  FiSettings,
} from "react-icons/fi";
import Link from "next/link";

// Define the shape of the stats object
interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  total_products: number;
  total_categories: number;
  total_customers: number;
  sales_over_time: { period: string; total_sales: number }[];
  recent_orders: {
    id: string;
    total: number;
    status: string;
    created_at: string;
  }[];
}

// Simple metric card for store stats
const MetricCard = ({
  icon: Icon,
  title,
  value,
  formatter = (val: any) => {
    if (val === null || val === undefined || val === "") return "0";
    if (typeof val === "number" && !isNaN(val)) return val.toLocaleString();
    return String(val);
  },
  gradient = "from-blue-600 to-blue-700",
  iconColor = "text-white",
  iconBg = "bg-white/20",
}: any) => (
  <div
    className={`relative overflow-hidden rounded-[32px] bg-gradient-to-br ${gradient} p-8 shadow-2xl shadow-slate-200/50 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] group`}
  >
    <div className="absolute -right-4 -top-4 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className={`rounded-2xl ${iconBg} p-3.5 shadow-lg backdrop-blur-md`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-white/70 uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-black text-white mt-1.5 tracking-tight">
          {formatter(value ?? 0)}
        </p>
      </div>
    </div>
  </div>
);

interface AdminDashboardProps {
  initialStats: DashboardStats;
}

export default function AdminDashboard({ initialStats }: AdminDashboardProps) {
  const safeNumber = (value: any): number => {
    if (typeof value === "number" && !isNaN(value)) return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const formatCurrency = (amount: number | string) => {
    const num = safeNumber(amount);
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-10">
      {/* Key Metrics Grid */}
      <section>
        <div className="flex items-center gap-2 mb-6 px-1">
          <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Global Insights</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <MetricCard
            icon={FiDollarSign}
            title="Total Revenue"
            value={initialStats.total_revenue}
            formatter={formatCurrency}
            gradient="from-indigo-600 to-indigo-700"
            iconColor="text-white"
            iconBg="bg-white/20"
          />

          <MetricCard
            icon={FiShoppingCart}
            title="Total Orders"
            value={initialStats.total_orders}
            gradient="from-violet-600 to-violet-700"
            iconColor="text-white"
            iconBg="bg-white/20"
          />

          <MetricCard
            icon={FiPackage}
            title="Active Products"
            value={initialStats.total_products}
            gradient="from-purple-600 to-purple-700"
            iconColor="text-white"
            iconBg="bg-white/20"
          />

          <MetricCard
            icon={FiGrid}
            title="Categories"
            value={initialStats.total_categories}
            gradient="from-amber-500 to-orange-600"
            iconColor="text-white"
            iconBg="bg-white/20"
          />
        </div>
      </section>

      {/* Recent Activity */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white/40 backdrop-blur-xl rounded-[40px] shadow-2xl shadow-slate-200/50 border border-white/60 overflow-hidden">
          <div className="p-10 flex items-center justify-between border-b border-white/40 bg-white/20">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-indigo-600 p-3 shadow-lg shadow-indigo-200">
                <FiShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Recent Orders</h3>
                <p className="text-xs font-semibold text-slate-400">Latest transactions</p>
              </div>
            </div>
            <Link
              href="/admin/orders"
              className="px-6 py-2.5 rounded-2xl bg-white text-sm font-bold text-indigo-600 shadow-sm border border-indigo-50 hover:bg-indigo-50 transition-all"
            >
              View All
            </Link>
          </div>
          <div className="p-8">
            <div className="space-y-4">
              {initialStats.recent_orders.length > 0 ? (
                initialStats.recent_orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="group flex items-center justify-between p-5 rounded-3xl bg-white/30 hover:bg-white border border-transparent hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300"
                  >
                    <div className="flex items-center gap-5">
                      <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                        <FiShoppingCart className="h-6 w-6 text-slate-400 group-hover:text-indigo-600" />
                      </div>
                      <div>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                        >
                          #{order.id.substring(0, 8).toUpperCase()}
                        </Link>
                        <p className="text-xs font-semibold text-slate-500">
                          {new Date(order.created_at).toLocaleDateString("en-KE", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5">
                      <p className="text-lg font-black text-slate-900 leading-none">
                        {formatCurrency(order.total)}
                      </p>
                      <span
                        className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm
                        ${order.status === "pending" ? "bg-amber-100 text-amber-700" : ""}
                        ${order.status === "processing" ? "bg-indigo-100 text-indigo-700" : ""}
                        ${order.status === "completed" ? "bg-purple-100 text-purple-700" : ""}
                        ${order.status === "cancelled" ? "bg-rose-100 text-rose-700" : ""}
                      `}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <FiShoppingCart className="h-12 w-12 mb-4 opacity-10" />
                  <p className="font-bold">No recent orders found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & Store Health */}
        <div className="flex flex-col gap-10">
          <div className="bg-slate-900 rounded-[40px] p-10 shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white mb-8">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-4">
                <Link
                  href="/admin/products"
                  className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:translate-x-2"
                >
                  <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                    <FiPackage className="h-5 w-5 text-indigo-400" />
                  </div>
                  <span className="text-sm font-bold text-white">Add New Product</span>
                </Link>
                <Link
                  href="/admin/categories"
                  className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:translate-x-2"
                >
                  <div className="h-10 w-10 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                    <FiGrid className="h-5 w-5 text-amber-400" />
                  </div>
                  <span className="text-sm font-bold text-white">Manage Categories</span>
                </Link>
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:translate-x-2"
                >
                  <div className="h-10 w-10 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                    <FiSettings className="h-5 w-5 text-purple-400" />
                  </div>
                  <span className="text-sm font-bold text-white">Configuration</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-[40px] p-10 shadow-2xl shadow-indigo-600/30 text-white flex flex-col items-center justify-center text-center gap-4">
            <div className="h-16 w-16 rounded-3xl bg-white/20 flex items-center justify-center mb-2 animate-bounce">
              <FiActivity className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold">Store is Live</h3>
            <p className="text-white/80 text-sm font-medium">System performance is optimal. Happy selling!</p>
            <Link
              href="/"
              target="_blank"
              className="mt-4 px-8 py-3 rounded-2xl bg-white text-indigo-600 font-bold text-sm shadow-xl shadow-indigo-700/20 hover:scale-105 transition-transform"
            >
              Preview Store
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
