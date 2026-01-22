// Environment variables validation for analytics
export interface AnalyticsConfig {
  hasClientTracking: boolean;
  hasServerAPI: boolean;
  gaId: string | null;
  propertyId: string | null;
  errors: string[];
}

export function checkAnalyticsConfig(): AnalyticsConfig {
  const errors: string[] = [];

  // Check client-side GA ID
  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || null;
  const hasClientTracking = !!gaId;

  if (!hasClientTracking) {
    errors.push(
      "NEXT_PUBLIC_GOOGLE_ANALYTICS_ID is not set - client-side tracking disabled",
    );
  }

  // Check server-side API config
  const propertyId = process.env.GA4_PROPERTY_ID || null;
  const serviceAccountKey = process.env.GA_SERVICE_ACCOUNT_KEY_BASE64;

  let hasServerAPI = false;

  if (!propertyId) {
    errors.push("GA4_PROPERTY_ID is not set - server-side analytics disabled");
  }

  if (!serviceAccountKey) {
    errors.push(
      "GA_SERVICE_ACCOUNT_KEY_BASE64 is not set - server-side analytics disabled",
    );
  } else {
    try {
      // For base64 encoded keys, we need to decode first then parse
      const decodedKey = Buffer.from(serviceAccountKey, "base64").toString(
        "utf-8",
      );
      JSON.parse(decodedKey);
      hasServerAPI = !!propertyId;
    } catch (e) {
      errors.push(
        "GA_SERVICE_ACCOUNT_KEY_BASE64 is not valid base64-encoded JSON - server-side analytics disabled",
      );
    }
  }

  return {
    hasClientTracking,
    hasServerAPI,
    gaId,
    propertyId,
    errors,
  };
}

export function logAnalyticsConfig() {
  const config = checkAnalyticsConfig();

  console.log("🔍 Analytics Configuration Check:");
  console.log(
    `   Client Tracking: ${
      config.hasClientTracking ? "✅ Enabled" : "❌ Disabled"
    }`,
  );
  console.log(
    `   Server API: ${config.hasServerAPI ? "✅ Enabled" : "❌ Disabled"}`,
  );

  if (config.errors.length > 0) {
    console.log("   Issues:");
    config.errors.forEach((error) => console.log(`   - ${error}`));
  }

  if (config.hasClientTracking) {
    console.log(`   GA Measurement ID: ${config.gaId}`);
  }

  if (config.hasServerAPI) {
    console.log(`   GA4 Property ID: ${config.propertyId}`);
  }
}
