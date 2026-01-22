export interface TocItem {
  id: string;
  level: number;
  text: string;
  children?: TocItem[];
}

// Basic slugify function (can be improved)
const slugify = (text: string): string => {
  return (
    text
      .toString()
      .toLowerCase()
      .trim()
      // Replace spaces with -
      .replace(/\s+/g, "-")
      // Replace & with 'and'
      .replace(/&/g, "-and-")
      // Remove all non-word chars
      .replace(/[^\w\-]+/g, "")
      // Replace multiple - with single -
      .replace(/\-\-+/g, "-")
  );
};

export const generateTocItems = (htmlContent: string): TocItem[] => {
  const tocItems: TocItem[] = [];
  if (!htmlContent) return tocItems;

  // Regex to find h2 and h3 tags and their content
  // ID can be in single or double quotes. ID content shouldn't include quotes, spaces or >.
  const headingRegex =
    /<h([2-3])(?:\s+id=(?:["'])([^"'\s>]+)(?:["']))?.*?>(.*?)<\/h[2-3]>/gi;
  let match;

  while ((match = headingRegex.exec(htmlContent)) !== null) {
    const levelString = match[1];
    const existingId = match[2]; // Group 2 captures the ID value
    const rawTextContent = match[3]; // Group 3 captures the inner HTML

    // Ensure levelString and rawTextContent are strings before proceeding
    if (typeof levelString !== "string" || typeof rawTextContent !== "string") {
      // This case should ideally not be hit if the regex is correct and matches
      continue;
    }

    const level = parseInt(levelString, 10);
    const textContent = rawTextContent.replace(/<[^>]+>/g, "").trim();

    // If textContent is empty after stripping tags, skip this heading
    if (!textContent) {
      continue;
    }

    // Use existingId if present, otherwise slugify the textContent.
    // textContent is guaranteed to be a non-empty string here.
    const id = existingId || slugify(textContent);

    const item: TocItem = { id, level, text: textContent };
    tocItems.push(item);
  }

  // Basic nesting (assumes h3 always follows an h2 for nesting)
  // A more robust solution would build a proper tree.
  const nestedTocItems: TocItem[] = [];
  let lastH2: TocItem | null = null;

  for (const item of tocItems) {
    if (item.level === 2) {
      lastH2 = { ...item, children: [] };
      nestedTocItems.push(lastH2);
    } else if (item.level === 3 && lastH2) {
      // We initialize lastH2.children as [] when lastH2 is created,
      // so we can assert it's non-null here.
      lastH2.children!.push(item);
    } else if (item.level === 3 && !lastH2) {
      nestedTocItems.push(item);
    }
  }

  return nestedTocItems.length > 0 ? nestedTocItems : tocItems;
};
