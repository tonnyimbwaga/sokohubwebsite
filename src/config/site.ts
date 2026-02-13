export const siteConfig = {
    name: "Sokohub Kenya",
    shortName: "Sokohub",
    description: "Quality products and fast delivery serving Nairobi CBD and beyond.",
    url: "https://sokohubkenya.com",
    ogImage: "https://sokohubkenya.com/og.jpg",
    links: {},
    contact: {
        phone: "+254 707 874 828",
        whatsapp: "+254707874828",
        address: "Central Business District, Nairobi 00600, Kenya",
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
        defaultTitle: "Sokohub Kenya | Affordable Online Store in Nairobi Kenya",
        titleTemplate: "%s | Sokohub Kenya",
        defaultDescription: "Shop at Sokohub Kenya for quality products. Fast delivery and reliable customer service.",
        defaultKeywords: ["sokohub", "kenya", "nairobi", "online shopping", "ecommerce", "deals"],
        locale: "en_KE",
        googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
    },
    theme: {
        primaryColor: "#1E293B",
        secondaryColor: "#9333ea",
        fontFamily: "Inter, sans-serif",
    },
    categories: [
        { id: "cat_1", name: "Educational Toys", slug: "educational" },
        { id: "cat_2", name: "Outdoor Play", slug: "outdoor" },
        { id: "cat_3", name: "Arts & Crafts", slug: "creative" },
        { id: "cat_4", name: "Skates & Scooters", slug: "skates" },
        { id: "cat_5", name: "Games & Puzzles", slug: "games" },
        { id: "cat_6", name: "Others", slug: "other" },
    ]
};

export type SiteConfig = typeof siteConfig;
