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

import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable}`}>
      <head>
        <link
          rel="preconnect"
          href="https://rmgtdipwxieqlqkxyohv.supabase.co"
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
