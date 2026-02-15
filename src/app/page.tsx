import type { Metadata } from "next";
import { constructMetadata } from "@/utils/seo";
import HomeLayoutRenderer from "@/components/Home/HomeLayoutRenderer";

export const metadata: Metadata = constructMetadata({
  title: "Home",
  canonicalPath: "/",
});

export const revalidate = 86400; // Revalidate every 24 hours

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      {/* Main dynamic content area */}
      <HomeLayoutRenderer />
    </div>
  );
}
