import { importPKCS8, SignJWT } from "jose";

type JWTCachedToken = {
  token: string;
  expiresAt: number;
};

let cachedToken: JWTCachedToken | null = null;

/**
 * Get a JWT access token for Google Analytics API using service account credentials
 */
async function getAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    // 1 minute buffer
    return cachedToken.token;
  }

  // Try both environment variable formats for backward compatibility
  const serviceAccountKeyBase64 = process.env.GA_SERVICE_ACCOUNT_KEY_BASE64;
  const serviceAccountKeyJson = process.env.GA_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKeyBase64 && !serviceAccountKeyJson) {
    throw new Error(
      "GA_SERVICE_ACCOUNT_KEY or GA_SERVICE_ACCOUNT_KEY_BASE64 environment variable not set",
    );
  }

  try {
    let serviceAccountKeyString: string;

    if (serviceAccountKeyJson) {
      // Use the JSON format directly
      serviceAccountKeyString = serviceAccountKeyJson;
    } else if (serviceAccountKeyBase64) {
      // Decode the base64 format
      serviceAccountKeyString = Buffer.from(
        serviceAccountKeyBase64,
        "base64",
      ).toString("utf8");
    } else {
      throw new Error("No valid service account key found");
    }

    const credentials = JSON.parse(serviceAccountKeyString);

    const now = Math.floor(Date.now() / 1000);
    const expiry = now + 3600; // 1 hour

    // Create JWT payload
    const payload = {
      iss: credentials.client_email,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: "https://oauth2.googleapis.com/token",
      exp: expiry,
      iat: now,
    };

    // Import the private key
    const privateKey = await importPKCS8(credentials.private_key, "RS256");

    // Create and sign the JWT
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: "RS256", typ: "JWT" })
      .sign(privateKey);

    // Exchange JWT for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(
        `Failed to get access token: ${tokenResponse.status} ${errorText}`,
      );
    }

    const tokenData = await tokenResponse.json();

    // Cache the token
    cachedToken = {
      token: tokenData.access_token,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
    };

    return tokenData.access_token;
  } catch (error) {
    console.error("Error getting Google Analytics access token:", error);
    throw error;
  }
}

/**
 * Run a Google Analytics report using the REST API
 */
export async function runReportRest(
  propertyId: string,
  requestBody: Record<string, unknown>,
): Promise<any> {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GA API request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error running Google Analytics report:", error);
    throw error;
  }
}
