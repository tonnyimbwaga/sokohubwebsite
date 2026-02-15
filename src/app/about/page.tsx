import { constructMetadata } from "@/utils/seo";
import AboutClient from "./AboutClient";

export const metadata = constructMetadata({
  title: "About Us",
  description: "Learn more about our mission, vision, and values.",
  canonicalPath: "/about",
});

export default function AboutPage() {
  return <AboutClient />;
}
