import React from "react";
import HeroSlider from "@/components/HeroSlider/HeroSlider";
import CategoryCircles from "./CategoryCircles";
import CategoryScroll from "./CategoryScroll";
import GridBanners from "./GridBanners";
import { getHomeLayout, getHeroSlides } from "@/lib/supabase/home-layout.server";
import { serverCategoryQueries } from "@/lib/supabase/categories.server";
import SectionNewArrivals from "@/app/home/SectionNewArrivals";
import SectionBestDeals from "@/app/home/SectionBestDeals";
import HomepageCategorySections from "@/app/home/HomepageCategorySections";

export default async function HomeLayoutRenderer() {
    const layout = await getHomeLayout();
    let heroSlides = await getHeroSlides();
    const categories = await serverCategoryQueries.getCategorySummaries();

    if (!heroSlides || heroSlides.length === 0) {
        heroSlides = [
            {
                id: 1,
                title: "Welcome to Sokohub Kenya",
                subtitle: "The Best Deals in Nairobi CBD",
                image_url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop",
                link_url: "/products",
                button_text: "Shop Now",
                display_order: 1,
                active: true
            }
        ] as any;
    }

    if (!layout || layout.length === 0) {
        // Fallback if no layout is configured
        return (
            <div className="space-y-8">
                <HeroSlider slides={heroSlides as any} />
                <CategoryScroll categories={categories as any} />
                <CategoryCircles categories={categories as any} />
                <div className="px-4">
                    <SectionNewArrivals />
                    <SectionBestDeals />
                </div>
                <HomepageCategorySections />
            </div>
        );
    }

    return (
        <div className="space-y-0">
            {layout.map((section: any) => {
                switch (section.type) {
                    case "hero":
                        return (
                            <React.Fragment key={section.id}>
                                <HeroSlider slides={heroSlides as any} />
                                <CategoryScroll categories={categories as any} />
                            </React.Fragment>
                        );

                    case "category_circles":
                        return <CategoryCircles key={section.id} categories={categories as any} />;

                    case "grid_banners":
                        // Usually we'd fetch specific banners for this section, 
                        // but for now we'll pass generic content or handle via metadata
                        return <GridBanners key={section.id} banners={section.metadata?.banners || []} />;

                    case "product_slider":
                        if (section.metadata?.source === "new_arrivals") {
                            return (
                                <div key={section.id} className="px-4 py-8 md:py-16">
                                    <SectionNewArrivals />
                                </div>
                            );
                        }
                        if (section.metadata?.source === "best_deals") {
                            return (
                                <div key={section.id} className="px-4 py-8 md:py-16">
                                    <SectionBestDeals />
                                </div>
                            );
                        }
                        return null;

                    default:
                        return null;
                }
            })}

            {/* Dynamic Category Sections usually at the bottom */}
            <HomepageCategorySections />
        </div>
    );
}
