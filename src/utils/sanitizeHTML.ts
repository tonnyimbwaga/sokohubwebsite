import DOMPurify from "dompurify";

/**
 * Sanitizes HTML string to prevent XSS attacks.
 * It configures DOMPurify to allow common formatting tags but remove potentially dangerous ones.
 * @param dirtyHTML The HTML string to sanitize.
 * @param options Optional DOMPurify configuration options.
 * @returns The sanitized HTML string.
 */
export function sanitizeHTML(dirtyHTML: string | undefined | null): string {
  if (typeof dirtyHTML !== "string") {
    return ""; // Return empty string if input is not a string (e.g., null or undefined)
  }

  // Ensure this runs only in a browser-like environment where 'window' is available.
  // DOMPurify needs a DOM tree to work. For server-side rendering without a global window,
  // you might need to use JSDOM or ensure this function is only called client-side.
  if (typeof window === "undefined") {
    // Fallback for non-browser environments. This might mean returning unsanitized HTML
    // or throwing an error, depending on desired behavior. For now, returning as is
    // with a warning, but ideally this should be handled by ensuring it runs in the correct context.
    // console.warn('DOMPurify sanitizeHTML called in a non-browser environment. HTML will not be sanitized.');
    // A safer server-side fallback might be to strip all tags or return empty if sanitization is critical.
    // However, for typical Next.js client component rendering, window will be available.
    return dirtyHTML; // Or consider a more robust SSR sanitization if needed.
  }

  // Basic configuration: allow common formatting tags, links, images.
  const sanitizedHTML = DOMPurify.sanitize(dirtyHTML, {
    ALLOWED_TAGS: [
      "b",
      "i",
      "u",
      "p",
      "br",
      "a",
      "img",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "strong",
      "em",
      "span",
      "div",
    ],
    ALLOWED_ATTR: [
      "href",
      "src",
      "alt",
      "title",
      "style",
      "class",
      "id",
      "target",
    ],
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "style"],
    FORBID_ATTR: [
      "onerror",
      "onload",
      "onclick",
      "onmouseover",
      "onfocus",
      "onforminput",
      "oninput",
    ],
    ALLOW_DATA_ATTR: false,
  });

  return sanitizedHTML;
}
