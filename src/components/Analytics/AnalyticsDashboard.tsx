"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface AnalyticsData {
  sessions?: number;
  totalUsers?: number;
  screenPageViews?: number;
  bounceRate?: number;
  averageSessionDuration?: number;
  addToCarts?: number;
  purchaseRevenue?: number;
  purchases?: number;
}

interface AnalyticsDashboardProps {
  className?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  className = "",
}) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch real analytics data from our API
        const response = await fetch(
          "/api/analytics?type=overview&startDate=7daysAgo&endDate=today",
        );
        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }
        const result = await response.json();

        if (result.success && result.data) {
          // Handle both mock data format and real GA4 format
          if (result.data.rows) {
            // GA4 format
            const metrics = result.data.rows.reduce(
              (acc: AnalyticsData, row: any) => {
                const metricValues = row.metricValues || [];
                return {
                  sessions:
                    (acc.sessions || 0) +
                    (parseInt(metricValues[0]?.value) || 0),
                  totalUsers:
                    (acc.totalUsers || 0) +
                    (parseInt(metricValues[1]?.value) || 0),
                  screenPageViews:
                    (acc.screenPageViews || 0) +
                    (parseInt(metricValues[2]?.value) || 0),
                  bounceRate: parseFloat(metricValues[3]?.value) || 0,
                  averageSessionDuration:
                    parseFloat(metricValues[4]?.value) || 0,
                };
              },
              {},
            );
            setData(metrics);
          } else {
            // Direct data format
            setData(result.data);
          }
        } else {
          // If no data, show message about analytics setup
          setError(
            "Analytics data not available. Ensure Google Analytics is properly configured.",
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="text-center">
          <div className="text-gray-500 mb-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <p className="font-medium text-gray-900">Analytics Overview</p>
          <p className="text-sm text-gray-500 mt-1">
            {error.includes("Analytics data not available")
              ? "Google Analytics is being configured. Data will appear once tracking is active."
              : error}
          </p>
          <div className="mt-4 text-xs text-gray-400">
            Client-side tracking is active and collecting data.
          </div>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatPercentage = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  const metrics = [
    {
      label: "Total Users",
      value: data?.totalUsers ? formatNumber(data.totalUsers) : "0",
      icon: "👥",
      color: "text-blue-600",
    },
    {
      label: "Sessions",
      value: data?.sessions ? formatNumber(data.sessions) : "0",
      icon: "📊",
      color: "text-green-600",
    },
    {
      label: "Page Views",
      value: data?.screenPageViews ? formatNumber(data.screenPageViews) : "0",
      icon: "👁️",
      color: "text-purple-600",
    },
    {
      label: "Bounce Rate",
      value: data?.bounceRate ? formatPercentage(data.bounceRate) : "0%",
      icon: "⚡",
      color: "text-orange-600",
    },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Analytics Overview (Last 7 Days)
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 rounded-lg p-4 text-center"
          >
            <div className="text-2xl mb-2">{metric.icon}</div>
            <div className={`text-2xl font-bold ${metric.color} mb-1`}>
              {metric.value}
            </div>
            <div className="text-sm text-gray-600">{metric.label}</div>
          </motion.div>
        ))}
      </div>

      {data?.averageSessionDuration && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Average Session Duration:{" "}
          {formatDuration(data.averageSessionDuration)}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400 text-center">
        Data refreshes every hour • Real-time tracking active
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
