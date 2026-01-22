import { logAnalyticsConfig } from "@/lib/analytics/environment-check";
import { runReportRest } from "@/lib/analytics/googleDataApi";

// Safe GA server implementation that doesn't crash on API errors
export interface GAStats {
  todayUsers: number;
  weekUsers: number;
  todayAvgSessionDuration: number; // seconds
  weekAvgSessionDuration: number; // seconds
}

function isGaConfigured() {
  return !!(
    process.env.GA_SERVICE_ACCOUNT_KEY_BASE64 && process.env.GA4_PROPERTY_ID
  );
}

async function runReport(request: Record<string, unknown>) {
  try {
    const propertyId = process.env.GA4_PROPERTY_ID!;
    return await runReportRest(propertyId, request);
  } catch (error) {
    console.warn(
      "GA Stats: Report request failed (non-critical):",
      error instanceof Error ? error.message : "Unknown error",
    );
    // Return empty response structure that matches GA API format
    return {
      rows: [],
      dimensionHeaders: [],
      metricHeaders: [],
    };
  }
}

export async function fetchGAStats(): Promise<GAStats | null> {
  logAnalyticsConfig();

  if (!isGaConfigured()) {
    console.log("📊 GA Stats: not configured, skipping fetch.");
    return null;
  }

  try {
    const todayRequest = {
      dateRanges: [{ startDate: "today", endDate: "today" }],
      metrics: [{ name: "totalUsers" }, { name: "averageSessionDuration" }],
    };

    const weekRequest = {
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      metrics: [{ name: "totalUsers" }, { name: "averageSessionDuration" }],
    };

    const [todayResponse, weekResponse] = await Promise.all([
      runReport(todayRequest),
      runReport(weekRequest),
    ]);

    const todayUsers = parseInt(
      todayResponse?.rows?.[0]?.metricValues?.[0]?.value || "0",
      10,
    );
    const todayAvgSessionDuration = parseFloat(
      todayResponse?.rows?.[0]?.metricValues?.[1]?.value || "0",
    );
    const weekUsers = parseInt(
      weekResponse?.rows?.[0]?.metricValues?.[0]?.value || "0",
      10,
    );
    const weekAvgSessionDuration = parseFloat(
      weekResponse?.rows?.[0]?.metricValues?.[1]?.value || "0",
    );

    return {
      todayUsers,
      weekUsers,
      todayAvgSessionDuration,
      weekAvgSessionDuration,
    };
  } catch (error) {
    console.warn(
      "GA stats error (non-critical):",
      error instanceof Error ? error.message : "Unknown error",
    );
    return null;
  }
}
