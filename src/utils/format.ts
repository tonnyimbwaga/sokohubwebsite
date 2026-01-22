import { siteConfig } from "@/config/site";

/**
 * Formats a number as a currency string based on site configuration.
 * @param price - The amount to format.
 * @returns A formatted currency string (e.g., "Ksh 1,000").
 */
export function formatPrice(price: number): string {
  const { currency, locale } = siteConfig.localization;

  return `${currency} ${price.toLocaleString(locale)}`;
}

/**
 * Formats a date based on site configuration.
 */
export function formatDate(date: string | Date): string {
  const { locale } = siteConfig.localization;
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
