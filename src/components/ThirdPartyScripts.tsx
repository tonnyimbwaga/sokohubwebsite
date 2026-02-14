import Script from "next/script";

export default function ThirdPartyScripts() {
  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

  return (
    <>
      {adsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${adsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', '${adsId}');
              ${gaId ? `gtag('config', '${gaId}');` : ""}
            `}
          </Script>
        </>
      )}
      {/* Fallback for GA if Ads ID is not present but GA is */}
      {!adsId && gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      )}
    </>
  );
}
