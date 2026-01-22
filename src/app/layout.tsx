import { Suspense } from "react";
import Header from "@/components/Header/Header";
import Footer from "@/shared/Footer/Footer";
import Providers from "@/components/Providers";
import LayoutWrapper from "@/components/LayoutWrapper";
import Loading from "@/components/Loading/Loading";
import Script from "next/script";
import RootLayoutClient from "@/components/RootLayoutClient";
import ThemeColorClient from "@/components/ThemeColorClient";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import "@/styles/global.css";

import { siteConfig } from "@/config/site";

export const metadata = {
  title: siteConfig.seo.titleTemplate.replace("%s", siteConfig.name),
  description: siteConfig.seo.defaultDescription,
  openGraph: {
    type: "website",
    locale: siteConfig.seo.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.defaultDescription,
    creator: siteConfig.seo.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preload self-hosted Karla fonts for optimal performance */}
        <link
          rel="preload"
          as="font"
          href="/fonts/karla-latin-400-normal.woff2"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          href="/fonts/karla-latin-700-normal.woff2"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Load self-hosted Karla font CSS */}
        <style
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
            @font-face {
              font-family: 'Karla';
              font-style: normal;
              font-weight: 400;
              font-display: swap;
              src: url('/fonts/karla-latin-400-normal.woff2') format('woff2'),
                   url('/fonts/karla-latin-400-normal.woff') format('woff');
              unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }
            @font-face {
              font-family: 'Karla';
              font-style: normal;
              font-weight: 700;
              font-display: swap;
              src: url('/fonts/karla-latin-700-normal.woff2') format('woff2'),
                   url('/fonts/karla-latin-700-normal.woff') format('woff');
              unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }
          `,
          }}
        />
        <link
          rel="preconnect"
          href="https://tafojbtftmihrheeyoky.supabase.co"
          crossOrigin="anonymous"
        />
        {/* Preload critical font example (edit href as needed) */}
        {/* <link rel="preload" as="font" href="/fonts/your-font.woff2" type="font/woff2" crossOrigin="anonymous" /> */}
        {/* Google Site Verification Meta Tag */}
        {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && (
          <meta
            name="google-site-verification"
            content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION}
            key="google-site-verification"
          />
        )}

        {/* Duplicate GA script removed - now loaded via ThirdPartyScripts for better performance */}

        {siteConfig.seo.metaPixelId && (
          <>
            <Script id="meta-pixel-base" strategy="lazyOnload">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${siteConfig.seo.metaPixelId}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${siteConfig.seo.metaPixelId}&ev=PageView&noscript=1`}
              />
            </noscript>
          </>
        )}
      </head>
      <body suppressHydrationWarning>
        <ThemeColorClient />
        <Providers>
          <LayoutWrapper>
            <Header />
            <Suspense fallback={<Loading />}>
              <main>{children}</main>
            </Suspense>
            <Footer />
          </LayoutWrapper>
          <RootLayoutClient />
          <WhatsAppWidget />
        </Providers>
      </body>
    </html>
  );
}
