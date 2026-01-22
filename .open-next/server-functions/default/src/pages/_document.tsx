import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Preconnect to critical domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preload Google Fonts stylesheet for Inter */}
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        {/* Preload Inter font from Google Fonts CDN */}
        <link rel="preload" as="font" href="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTcviYw.woff2" type="font/woff2" crossOrigin="anonymous" />
        
        {/* Preload critical fonts */}
        <link
          rel="preload"
          as="font"
          href="/fonts/your-main-font.woff2"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* Inline critical CSS */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Add your critical CSS here */
              :root { scroll-behavior: smooth; }
              body { margin: 0; }
              img { max-width: 100%; height: auto; }
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
