import { Suspense } from "react";
import Header from "@/components/Header/Header";
import Footer from "@/shared/Footer/Footer";
import Providers from "@/components/Providers";
import LayoutWrapper from "@/components/LayoutWrapper";
import Loading from "@/components/Loading/Loading";
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
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: "/",
  },
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
