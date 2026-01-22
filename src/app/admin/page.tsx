import { createClient } from "@/lib/supabase/server";
import AdminDashboard from "@/components/Admin/AdminDashboard";
import { Metadata } from "next";
import { FiActivity } from "react-icons/fi";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export const revalidate = 60; // Cache dashboard data for 1 minute

// Define the interface for our dashboard stats
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

export default async function AdminPage() {
  const supabase = await createClient();

  // Initialize with default values
  let dashboardData: DashboardStats = {
    total_revenue: 0,
    total_orders: 0,
    total_products: 0,
    total_categories: 0,
    total_customers: 0,
    sales_over_time: [],
    recent_orders: [],
  };

  try {
    // Fetch real data from database using direct queries
    const [
      { count: totalProducts },
      { count: totalOrders },
      { count: totalCategories },
      { data: recentOrders },
      { data: completedOrders },
    ] = await Promise.all([
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("status", "active"),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("categories").select("*", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select("id, total, status, created_at")
        .order("created_at", { ascending: false })
        .limit(10) as any,
      supabase.from("orders").select("total").eq("status", "completed") as any,
    ]);

    // Calculate total revenue from completed orders
    const totalRevenue =
      completedOrders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

    // Build dashboard data from real database results
    dashboardData = {
      total_revenue: totalRevenue,
      total_orders: totalOrders || 0,
      total_products: totalProducts || 0,
      total_categories: totalCategories || 0,
      total_customers: 0, // We don't have a customers table, so keeping as 0
      sales_over_time: [], // Can be implemented later with proper date grouping
      recent_orders:
        recentOrders?.map((order) => ({
          id: order.id,
          total: order.total || 0,
          status: order.status || "pending",
          created_at: order.created_at,
        })) || [],
    };

    console.log("📊 Dashboard Data Loaded:", {
      products: totalProducts,
      orders: totalOrders,
      categories: totalCategories,
      revenue: totalRevenue,
    });
  } catch (dbError) {
    console.error("Database connection error:", dbError);
    // Keep default values if database fails
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 px-1">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
            Store <span className="text-indigo-600">Overview</span>
          </h1>
          <p className="mt-4 text-lg font-medium text-slate-500 max-w-lg">
            Monitor your business performance and manage your operations from one central dashboard.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-white shadow-lg shadow-slate-200/50 border border-slate-100 flex items-center justify-center">
            <FiActivity className="h-6 w-6 text-indigo-600" />
          </div>
          <p className="text-sm font-bold text-slate-900">Live Status</p>
        </div>
      </div>

      <AdminDashboard initialStats={dashboardData} />
    </div>
  );
}
