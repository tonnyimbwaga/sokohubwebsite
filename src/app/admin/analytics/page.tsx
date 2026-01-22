"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { subDays, format } from "date-fns";
import {
  FiCalendar,
  FiUsers,
  FiEye,
  FiClock,
  FiMousePointer,
  FiTrendingUp,
  FiBox,
  FiSearch,
  FiFileText,
  FiTarget,
  FiActivity,
  FiBarChart,
} from "react-icons/fi";

// Function to fetch analytics data from our API
const fetchAnalyticsData = async (
  reportType: string,
  dateRange: DateRange | undefined,
) => {
  if (!dateRange?.from || !dateRange?.to) {
    // Return a promise that resolves to null or an empty structure
    // to prevent query from running with incomplete data.
    return Promise.resolve(null);
  }
  const from = format(dateRange.from, "yyyy-MM-dd");
  const to = format(dateRange.to, "yyyy-MM-dd");
  const response = await fetch(
    `/api/analytics?type=${reportType}&startDate=${from}&endDate=${to}`,
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to fetch ${reportType} data`);
  }
  const json = await response.json();
  return json.data;
};

// Safe number formatter
const safeNumber = (value: any): number => {
  if (typeof value === "number" && !isNaN(value)) return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// Modern metric card with gradient background
const MetricCard = ({
  icon: Icon,
  title,
  value,
  loading,
  formatter = (val: any) => {
    if (val === null || val === undefined || val === "") return "0";
    if (typeof val === "number" && !isNaN(val)) return val.toLocaleString();
    if (typeof val === "string") {
      const num = parseFloat(val);
      return isNaN(num) ? "0" : num.toLocaleString();
    }
    return String(val);
  },
  gradient = "from-blue-50 to-indigo-50",
  iconColor = "text-blue-600",
  iconBg = "bg-blue-100",
}: any) => (
  <div
    className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} border border-gray-200/20 shadow-sm hover:shadow-lg transition-all duration-300`}
  >
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`rounded-xl ${iconBg} p-2 sm:p-3`}>
          <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${iconColor}`} />
        </div>
        <div className="text-right">
          <p className="text-xs sm:text-sm font-medium text-gray-600">
            {title}
          </p>
        </div>
      </div>

      <div className="text-center">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 sm:h-10 bg-gray-200 rounded w-24 mx-auto"></div>
          </div>
        ) : (
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {formatter(value ?? 0)}
          </p>
        )}
      </div>
    </div>
    <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
      <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent rounded-full transform translate-x-16 -translate-y-16"></div>
    </div>
  </div>
);

// Modern data table card
const DataCard = ({
  title,
  data,
  columns,
  loading,
  icon: Icon,
  emptyMessage = "No data available",
  gradient = "bg-white",
}: any) => (
  <div
    className={`${gradient} rounded-xl shadow-sm border border-gray-200/20 hover:shadow-lg transition-all duration-300 overflow-hidden`}
  >
    <div className="p-4 sm:p-6 border-b border-gray-100/30">
      <div className="flex items-center space-x-2 sm:space-x-3">
        <div className="rounded-xl bg-purple-100 p-2 sm:p-3">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          {title}
        </h3>
      </div>
    </div>

    <div className="overflow-x-auto">
      {loading ? (
        <div className="p-4 sm:p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={`loading-row-${i}`} className="animate-pulse flex items-center space-x-4">
              <div className="h-4 bg-gray-200 rounded flex-1"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <table className="w-full">
          <thead className="bg-gray-50/50">
            <tr>
              {columns.map((col: any, index: number) => (
                <th
                  key={`header-${col.key || index}`}
                  className={`px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    col.align === "right" ? "text-right" : ""
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/50">
            {data.slice(0, 10).map((row: any, rowIndex: number) => (
              <tr
                key={`row-${rowIndex}-${row.pagePath || row.itemName || row.searchTerm || rowIndex}`}
                className="hover:bg-gray-50/30 transition-colors duration-200"
              >
                {columns.map((col: any, colIndex: number) => (
                  <td
                    key={`col-${colIndex}-${col.key}`}
                    className={`px-4 sm:px-6 py-3 sm:py-4 text-sm ${
                      col.align === "right" ? "text-right" : ""
                    } ${
                      colIndex === 0
                        ? "font-medium text-gray-900"
                        : "text-gray-600"
                    }`}
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : row[col.key] || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="p-8 text-center text-gray-400">
          <Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{emptyMessage}</p>
        </div>
      )}
    </div>
  </div>
);

const ErrorDisplay = ({ error }: { error: Error | null }) => {
  if (!error) return null;
  return (
    <div
      className="p-4 my-4 text-sm text-red-800 rounded-xl bg-red-50 border border-red-200/50"
      role="alert"
    >
      <div className="flex items-center space-x-2">
        <FiTarget className="h-4 w-4 text-red-600" />
        <span className="font-medium">Analytics Error:</span>
      </div>
      <p className="mt-1 ml-6">{error.message}</p>
    </div>
  );
};

// --- Main Page Component ---
export default function AnalyticsPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  const {
    data: overviewData,
    isLoading: isLoadingOverview,
    error: overviewError,
  } = useQuery({
    queryKey: ["analytics", "overview", date],
    queryFn: () => fetchAnalyticsData("overview", date),
    enabled: !!date?.from && !!date?.to,
  });

  const {
    data: popularProductsData,
    isLoading: isLoadingPopularProducts,
    error: popularProductsError,
  } = useQuery({
    queryKey: ["analytics", "popular-products", date],
    queryFn: () => fetchAnalyticsData("popular-products", date),
    enabled: !!date?.from && !!date?.to,
  });

  const {
    data: searchTermsData,
    isLoading: isLoadingSearchTerms,
    error: searchTermsError,
  } = useQuery({
    queryKey: ["analytics", "search-terms", date],
    queryFn: () => fetchAnalyticsData("search-terms", date),
    enabled: !!date?.from && !!date?.to,
  });

  const {
    data: topPagesData,
    isLoading: isLoadingTopPages,
    error: topPagesError,
  } = useQuery({
    queryKey: ["analytics", "top-pages", date],
    queryFn: () => fetchAnalyticsData("top-pages", date),
    enabled: !!date?.from && !!date?.to,
  });

  // Extract overview stats
  const overviewStats = overviewData?.[0] || {};

  // Format duration helper
  const formatDuration = (seconds: string | number) => {
    const secs = safeNumber(seconds);
    if (secs < 60) return `${Math.round(secs)}s`;
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.round(secs % 60);
    return `${mins}m ${remainingSecs}s`;
  };

  // Format percentage helper
  const formatPercentage = (value: any) => {
    const num = safeNumber(value) * 100;
    const rounded = Math.round(num * 10) / 10;
    return `${rounded}%`;
  };

  // Check for any errors
  const hasError =
    overviewError || popularProductsError || searchTermsError || topPagesError;

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-200/30 mb-4 sm:mb-8">
        <div className="px-4 sm:px-6 py-4 sm:py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Detailed Analytics
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Deep dive into your website performance and user behavior
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <FiCalendar className="h-5 w-5 text-gray-400" />
                <DateRangePicker date={date} onDateChange={setDate} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8 pb-6 sm:pb-8">
        <ErrorDisplay error={hasError as Error | null} />

        {/* Key Metrics Overview */}
        <section>
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Performance Overview
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Key metrics for the selected date range
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            <MetricCard
              icon={FiActivity}
              title="Sessions"
              value={overviewStats.sessions}
              loading={isLoadingOverview}
              gradient="from-blue-50 to-indigo-50"
              iconColor="text-blue-600"
              iconBg="bg-blue-100"
            />
            <MetricCard
              icon={FiUsers}
              title="Total Users"
              value={overviewStats.totalUsers}
              loading={isLoadingOverview}
              gradient="from-green-50 to-emerald-50"
              iconColor="text-green-600"
              iconBg="bg-green-100"
            />
            <MetricCard
              icon={FiEye}
              title="Page Views"
              value={overviewStats.screenPageViews}
              loading={isLoadingOverview}
              gradient="from-purple-50 to-violet-50"
              iconColor="text-purple-600"
              iconBg="bg-purple-100"
            />
            <MetricCard
              icon={FiMousePointer}
              title="Bounce Rate"
              value={overviewStats.bounceRate}
              formatter={formatPercentage}
              loading={isLoadingOverview}
              gradient="from-orange-50 to-amber-50"
              iconColor="text-orange-600"
              iconBg="bg-orange-100"
            />
            <MetricCard
              icon={FiClock}
              title="Avg. Session"
              value={overviewStats.averageSessionDuration}
              formatter={formatDuration}
              loading={isLoadingOverview}
              gradient="from-rose-50 to-pink-50"
              iconColor="text-rose-600"
              iconBg="bg-rose-100"
            />
          </div>
        </section>

        {/* Content Performance */}
        <section>
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Content Performance
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Most popular pages and content on your website
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
            <DataCard
              title="Top Pages by Views"
              data={topPagesData}
              loading={isLoadingTopPages}
              icon={FiFileText}
              emptyMessage="No page data available for this period"
              columns={[
                {
                  key: "pagePath",
                  header: "Page Path",
                  render: (value: string) => (
                    <div className="max-w-xs">
                      <div className="truncate font-medium text-gray-900">
                        {value}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "pageTitle",
                  header: "Title",
                  render: (value: string) => (
                    <div className="max-w-xs hidden sm:block">
                      <div className="truncate text-gray-600">
                        {value || "—"}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "screenPageViews",
                  header: "Views",
                  align: "right",
                  render: (value: any) => (
                    <span className="font-semibold text-gray-900">
                      {safeNumber(value).toLocaleString()}
                    </span>
                  ),
                },
              ]}
            />

            <DataCard
              title="Popular Products"
              data={popularProductsData}
              loading={isLoadingPopularProducts}
              icon={FiBox}
              emptyMessage="No product data available for this period"
              columns={[
                {
                  key: "itemName",
                  header: "Product Name",
                  render: (value: string) => (
                    <div className="max-w-xs">
                      <div className="truncate font-medium text-gray-900">
                        {value}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "itemsViewed",
                  header: "Views",
                  align: "right",
                  render: (value: any) => (
                    <span className="text-blue-600 font-medium">
                      {safeNumber(value).toLocaleString()}
                    </span>
                  ),
                },
                {
                  key: "itemsAddedToCart",
                  header: "Cart Adds",
                  align: "right",
                  render: (value: any) => (
                    <span className="text-green-600 font-medium">
                      {safeNumber(value).toLocaleString()}
                    </span>
                  ),
                },
                {
                  key: "itemPurchaseQuantity",
                  header: "Purchases",
                  align: "right",
                  render: (value: any) => (
                    <span className="text-purple-600 font-semibold">
                      {safeNumber(value).toLocaleString()}
                    </span>
                  ),
                },
              ]}
            />
          </div>
        </section>

        {/* User Behavior */}
        <section>
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              User Behavior
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Understanding how users interact with your website
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <DataCard
              title="Top Search Terms"
              data={searchTermsData}
              loading={isLoadingSearchTerms}
              icon={FiSearch}
              emptyMessage="No search data available for this period"
              columns={[
                {
                  key: "searchTerm",
                  header: "Search Term",
                  render: (value: string) => (
                    <div className="flex items-center space-x-2">
                      <FiSearch className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{value}</span>
                    </div>
                  ),
                },
                {
                  key: "eventCount",
                  header: "Searches",
                  align: "right",
                  render: (value: any) => (
                    <div className="flex items-center justify-end space-x-2">
                      <span className="font-semibold text-gray-900">
                        {safeNumber(value).toLocaleString()}
                      </span>
                      <FiTrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                  ),
                },
              ]}
            />

            {/* Analytics Summary Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-sm border border-gray-200/20 hover:shadow-lg transition-all duration-300">
              <div className="p-4 sm:p-6 border-b border-indigo-100/50">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="rounded-xl bg-indigo-100 p-2 sm:p-3">
                    <FiBarChart className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    Analytics Summary
                  </h3>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {isLoadingOverview
                        ? "..."
                        : safeNumber(overviewStats.totalUsers).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {isLoadingOverview
                        ? "..."
                        : safeNumber(overviewStats.sessions).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Sessions</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-indigo-100/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Date Range:</span>
                    <span className="font-medium text-gray-900">
                      {date?.from && date?.to
                        ? `${format(date.from, "MMM dd")} - ${format(
                            date.to,
                            "MMM dd",
                          )}`
                        : "Select dates"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600">
                      Avg. Session Duration:
                    </span>
                    <span className="font-medium text-gray-900">
                      {isLoadingOverview
                        ? "..."
                        : formatDuration(overviewStats.averageSessionDuration)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
