import { siteConfig } from "@/config/site";

export const AppConfig = {
  site_name: siteConfig.name,
  title: siteConfig.seo.defaultTitle,
  description: siteConfig.description,
  locale: siteConfig.localization.locale,
};
