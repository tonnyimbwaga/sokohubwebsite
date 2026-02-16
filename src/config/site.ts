export const siteConfig = {
    name: "Sokohub Kenya",
    shortName: "Sokohub",
    description: "Quality products and fast delivery countrywide.",
    url: "https://sokohubkenya.com",
    ogImage: "https://sokohubkenya.com/og.jpg",
    links: {
        instagram: "https://instagram.com/sokohubkenya",
        tiktok: "https://tiktok.com/@sokohubkenya",
    },
    contact: {
        phone: "+254 707 874 828",
        whatsapp: "+254707874828",
        email: "info@sokohubkenya.com",
        alternativeEmail: "sales@sokohubkenya.com",
        address: "Agip House, Haile Selassie Ave, Nairobi",
        businessHours: "Mon-Sat, 8 AM - 8 PM EAT",
        googleMapsLink: "https://maps.app.goo.gl/qYm8N4nJ1X3z1Y6p7", // Example link, updated if you provide one
    },
    payment: {
        acceptedMethods: ["M-Pesa", "Visa", "Mastercard", "Cash on Delivery"],
        paybillNumber: "Please contact us for Paybill instructions",
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
        twitterHandle: "@sokohubkenya",
        creator: "@sokohubkenya", // Added creator field based on twitterHandle
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
