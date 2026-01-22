import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

export const getHomeLayout = unstable_cache(
    async () => {
        // Use a direct client without cookies for cached data
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
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
        // Use a direct client without cookies for cached data
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
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
