import { createClient } from "@/lib/supabase/server";
import HeroSlider from "./HeroSlider/HeroSlider";

// This is now a Server Component
export default async function HeroSliderClient() {
  const supabase = await createClient();

  const { data: slides, error } = await supabase
    .from("hero_slides")
    .select(
      "id, title, subtitle, image_url, link_url, button_text, display_order, active",
    )
    .eq("active", true)
    .order("display_order", { ascending: true });

  if (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to fetch hero slides:", error);
    // Render a fallback or null if fetching fails
    return null;
  }

  return <HeroSlider slides={slides || []} />;
}
