import { NextRequest, NextResponse } from "next/server";
import { runReportRest } from "@/lib/analytics/googleDataApi";

function isGaConfigured() {
  return !!(
    process.env.GA_SERVICE_ACCOUNT_KEY_BASE64 && process.env.GA4_PROPERTY_ID
  );
}

async function runReport(requestBody: Record<string, unknown>) {
  try {
    const propertyId = process.env.GA4_PROPERTY_ID!;
    return await runReportRest(propertyId, requestBody);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(
      "GA API: Report request failed (non-critical):",
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

interface ReportRow {
  dimensionValues: { value: string; oneValue: "value" }[];
  metricValues: { value: string; oneValue: "value" }[];
}

// Helper to format the report response
function formatReport(response: any): Record<string, string>[] {
  if (!response || !response.rows) {
    return [];
  }

  const rows = response.rows as ReportRow[];
  const dimensionHeaders =
    response.dimensionHeaders?.map((h: any) => h.name) || [];
  const metricHeaders = response.metricHeaders?.map((h: any) => h.name) || [];

  return rows.map((row) => {
    const rowData: Record<string, string> = {};
    row.dimensionValues?.forEach((dim, i) => {
      rowData[dimensionHeaders[i]] = dim.value;
    });
    row.metricValues?.forEach((met, i) => {
      rowData[metricHeaders[i]] = met.value;
    });
    return rowData;
  });
}

async function getOverviewReport(startDate: string, endDate: string) {
  const response = await runReport({
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: "sessions" },
      { name: "totalUsers" },
      { name: "newUsers" },
      { name: "screenPageViews" },
      { name: "bounceRate" },
      { name: "averageSessionDuration" },
      { name: "engagementRate" },
    ],
  });
  return formatReport(response);
}

async function getEcommerceReport(startDate: string, endDate: string) {
  const response = await runReport({
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: "itemsViewed" },
      { name: "itemsAddedToCart" },
      { name: "itemPurchaseQuantity" },
      { name: "purchaseRevenue" },
    ],
  });
  return formatReport(response);
}

async function getPopularProductsReport(startDate: string, endDate: string) {
  const response = await runReport({
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "itemName" }],
    metrics: [
      { name: "itemsViewed" },
      { name: "itemsAddedToCart" },
      { name: "itemPurchaseQuantity" },
    ],
    orderBys: [{ metric: { metricName: "itemsViewed" }, desc: true }],
    limit: 10,
  });
  return formatReport(response);
}

async function getSearchTermsReport(startDate: string, endDate: string) {
  const response = await runReport({
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "searchTerm" }],
    metrics: [{ name: "eventCount" }],
    orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
    limit: 20,
  });
  return formatReport(response);
}

async function getTopPagesReport(startDate: string, endDate: string) {
  const response = await runReport({
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
    metrics: [
      { name: "screenPageViews" },
      { name: "sessions" },
      { name: "averageSessionDuration" },
    ],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: 10,
  });
  return formatReport(response);
}

async function getDailyAnalyticsReport(startDate: string, endDate: string) {
  const response = await runReport({
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "date" }],
    metrics: [
      { name: "totalUsers" },
      { name: "newUsers" },
      { name: "sessions" },
      { name: "screenPageViews" },
      { name: "averageSessionDuration" },
      { name: "bounceRate" },
    ],
    orderBys: [{ dimension: { dimensionName: "date" }, desc: true }],
    limit: 30,
  });
  return formatReport(response);
}

export async function GET(request: NextRequest) {
  if (!isGaConfigured()) {
    return NextResponse.json(
      { error: "Analytics service is not configured on the server." },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const reportType = searchParams.get("type");
  const startDate = searchParams.get("startDate") || "7daysAgo";
  const endDate = searchParams.get("endDate") || "today";

  try {
    let data;
    switch (reportType) {
      case "overview":
        data = await getOverviewReport(startDate, endDate);
        break;
      case "daily":
        data = await getDailyAnalyticsReport(startDate, endDate);
        break;
      case "ecommerce":
        data = await getEcommerceReport(startDate, endDate);
        break;
      case "popular-products":
        data = await getPopularProductsReport(startDate, endDate);
        break;
      case "search-terms":
        data = await getSearchTermsReport(startDate, endDate);
        break;
      case "top-pages":
        data = await getTopPagesReport(startDate, endDate);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid report type" },
          { status: 400 },
        );
    }
    return NextResponse.json({ success: true, data, reportType });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("GA4 API Error:", error.details || error.message);
    return NextResponse.json(
      {
        error: "Failed to fetch analytics data from GA4.",
        details: error.details || error.message,
      },
      { status: 500 },
    );
  }
}

// POST endpoint for custom event tracking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventName, parameters } = body;

    // Log the event (in production, you might want to store this)
    // eslint-disable-next-line no-console
    console.log("Custom event tracked:", { eventName, parameters });

    return NextResponse.json({ success: true, message: "Event logged" });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Event tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 },
    );
  }
}
