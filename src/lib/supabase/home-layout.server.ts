import { createClient } from "./server";
import { unstable_cache } from "next/cache";

export const getHomeLayout = unstable_cache(
    async () => {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("home_layout")
            .select("*")
            .eq("active", true)
            .order("display_order", { ascending: true });

        if (error) {
            console.error("Error fetching home layout:", error);
            return [];
        }

        return data;
    },
    ["home-layout"],
    {
        revalidate: 3600,
        tags: ["home-layout"],
    }
);

export const getHeroSlides = unstable_cache(
    async () => {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("hero_slides")
            .select("*")
            .eq("active", true)
            .order("display_order", { ascending: true });

        if (error) {
            console.error("Error fetching hero slides:", error);
            return [];
        }

        return data;
    },
    ["hero-slides"],
    {
        revalidate: 3600,
        tags: ["hero-slides"],
    }
);
