"use client";

import { useEffect } from "react";
import { siteConfig } from "@/config/site";

export default function ThemeColorClient() {
    useEffect(() => {
        // Inject CSS variables for primary and secondary colors
        const root = document.documentElement;
        root.style.setProperty("--primary-color", siteConfig.theme.primaryColor);
        root.style.setProperty("--secondary-color", siteConfig.theme.secondaryColor);
    }, []);

    return null;
}
