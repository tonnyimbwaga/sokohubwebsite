"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TrendCardProps {
  title: string;
  data: any[];
  dataKey: string;
  color: string;
  icon: any;
  loading: boolean;
}

export const TrendCard = ({
  title,
  data,
  dataKey,
  color,
  icon: Icon,
  loading,
}: TrendCardProps) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-200/30 hover:shadow-xl transition-all duration-300">
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div
            className={`rounded-2xl p-3 shadow-sm ${
              color === "blue"
                ? "bg-blue-100/80"
                : color === "green"
                ? "bg-green-100/80"
                : color === "purple"
                ? "bg-purple-100/80"
                : color === "orange"
                ? "bg-orange-100/80"
                : "bg-slate-100/80"
            }`}
          >
            <Icon
              className={`h-5 w-5 ${
                color === "blue"
                  ? "text-blue-600"
                  : color === "green"
                  ? "text-green-600"
                  : color === "purple"
                  ? "text-purple-600"
                  : color === "orange"
                  ? "text-orange-600"
                  : "text-slate-600"
              }`}
            />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse text-slate-400 text-sm">
            Loading chart...
          </div>
        </div>
      ) : data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data}>
            <defs>
              <linearGradient
                id={`gradient-${dataKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={
                    color === "blue"
                      ? "#3b82f6"
                      : color === "green"
                      ? "#10b981"
                      : color === "purple"
                      ? "#8b5cf6"
                      : color === "orange"
                      ? "#f59e0b"
                      : "#64748b"
                  }
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={
                    color === "blue"
                      ? "#3b82f6"
                      : color === "green"
                      ? "#10b981"
                      : color === "purple"
                      ? "#8b5cf6"
                      : color === "orange"
                      ? "#f59e0b"
                      : "#64748b"
                  }
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="formattedDate"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#64748b" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#64748b" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                borderRadius: "12px",
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                backdropFilter: "blur(12px)",
              }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={
                color === "blue"
                  ? "#3b82f6"
                  : color === "green"
                  ? "#10b981"
                  : color === "purple"
                  ? "#8b5cf6"
                  : color === "orange"
                  ? "#f59e0b"
                  : "#64748b"
              }
              strokeWidth={3}
              fill={`url(#gradient-${dataKey})`}
              dot={{
                fill:
                  color === "blue"
                    ? "#3b82f6"
                    : color === "green"
                    ? "#10b981"
                    : color === "purple"
                    ? "#8b5cf6"
                    : color === "orange"
                    ? "#f59e0b"
                    : "#64748b",
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                r: 6,
                stroke:
                  color === "blue"
                    ? "#3b82f6"
                    : color === "green"
                    ? "#10b981"
                    : color === "purple"
                    ? "#8b5cf6"
                    : color === "orange"
                    ? "#f59e0b"
                    : "#64748b",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
          No data available
        </div>
      )}
    </div>
  </div>
);
