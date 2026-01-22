import { siteConfig } from "@/config/site";
import { Metadata } from "next";

export function constructMetadata({
    title,
    description = siteConfig.description,
    image = siteConfig.ogImage,
    noIndex = false,
}: {
    title: string;
    description?: string;
    image?: string;
    noIndex?: boolean;
}): Metadata {
    return {
        title: siteConfig.seo.titleTemplate.replace("%s", title),
        description,
        openGraph: {
            title,
            description,
            images: [
                {
                    url: image,
                },
            ],
            siteName: siteConfig.name,
            locale: siteConfig.seo.locale,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [image],
            creator: siteConfig.seo.twitterHandle,
        },
        icons: "/favicon.ico",
        metadataBase: new URL(siteConfig.url),
        ...(noIndex && {
            robots: {
                index: false,
                follow: false,
            },
        }),
    };
}
