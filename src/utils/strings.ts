/**
 * Generates a URL-friendly slug from a string
 * @param text The text to convert into a slug
 * @returns A URL-friendly slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric chars with hyphens
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
    .slice(0, 50); // Limit length to 50 chars
}

/**
 * Generates a SEO-friendly title
 * @param title The base title
 * @param suffix Optional suffix to append (e.g., site name)
 * @returns A SEO-friendly title
 */
export function generateSeoTitle(title: string, suffix?: string): string {
  const cleanTitle = title.trim();
  return suffix ? `${cleanTitle} | ${suffix}` : cleanTitle;
}

/**
 * Generates a SEO-friendly description
 * @param text The base text to use for description
 * @param maxLength Maximum length for the description (default: 160)
 * @returns A SEO-friendly description
 */
export function generateSeoDescription(
  text: string,
  maxLength: number = 160,
): string {
  return text
    .trim()
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .slice(0, maxLength - 3) // Leave room for ellipsis
    .trim()
    .concat("...");
}
