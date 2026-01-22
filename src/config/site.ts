export const siteConfig = {
    name: "Sokohub Kenya",
    shortName: "Sokohub",
    description: "The best online shopping experience in Nairobi CBD, Kenya. Quality products and fast delivery.",
    url: "https://sokohubkenya.com",
    ogImage: "https://sokohubkenya.com/og.jpg",
    links: {
        twitter: "https://twitter.com/sokohubkenya",
        facebook: "https://facebook.com/sokohubkenya",
        instagram: "https://instagram.com/sokohubkenya",
    },
    contact: {
        email: "info@sokohubkenya.com",
        alternativeEmail: "support@sokohubkenya.com",
        phone: "+254 707 874 828",
        whatsapp: "+254707874828",
        address: "Nairobi CBD, Kenya",
        businessHours: "Mon-Sat, 8 AM - 8 PM EAT",
    },
    localization: {
        currency: "Ksh.",
        currencyCode: "KES",
        locale: "en-KE",
        country: "Kenya",
        city: "Nairobi",
    },
    seo: {
        defaultTitle: "Sokohub Kenya | Best Online Store in Nairobi",
        titleTemplate: "%s | Sokohub Kenya",
        defaultDescription: "Shop at Sokohub Kenya in Nairobi CBD for the best deals on quality products. Fast delivery and great customer service.",
        defaultKeywords: ["sokohub", "kenya", "nairobi", "online shopping", "ecommerce", "deals"],
        twitterHandle: "@sokohubkenya",
        locale: "en_KE",
        googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
        metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
    },
    theme: {
        primaryColor: "#3b82f6",
        secondaryColor: "#fdc021",
        fontFamily: "Karla, sans-serif",
    },
    categories: [
        { id: "cat_1", name: "Electronics", slug: "electronics" },
        { id: "cat_2", name: "Fashion", slug: "fashion" },
        { id: "cat_3", name: "Home & Garden", slug: "home-kitchen" },
        { id: "cat_4", name: "Beauty & Health", slug: "beauty-health" },
        { id: "cat_5", name: "Toys & Kids", slug: "toys-kids" },
        { id: "cat_6", name: "Sports", slug: "sports" },
    ]
};

export type SiteConfig = typeof siteConfig;
