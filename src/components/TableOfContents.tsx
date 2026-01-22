"use client";

import { useState, useEffect, useRef } from "react";
import { TocItem } from "@/lib/tocUtils";

const TableOfContents = ({ tocItems }: { tocItems: TocItem[] }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const headingElementsRef = useRef<{
    [key: string]: IntersectionObserverEntry;
  }>({});

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          headingElementsRef.current[entry.target.id] = entry;
        });

        const visibleHeadings: IntersectionObserverEntry[] = [];
        Object.keys(headingElementsRef.current).forEach((key) => {
          const entry = headingElementsRef.current[key];
          if (entry && entry.isIntersecting) {
            visibleHeadings.push(entry);
          }
        });

        if (visibleHeadings.length === 1 && visibleHeadings[0]) {
          setActiveId(visibleHeadings[0].target.id);
        } else if (visibleHeadings.length > 1) {
          const sortedVisible = visibleHeadings.sort(
            (a, b) =>
              (a.target as HTMLElement).offsetTop -
              (b.target as HTMLElement).offsetTop,
          );
          if (sortedVisible[0]) {
            setActiveId(sortedVisible[0].target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );

    const headingElements = Array.from(
      document.querySelectorAll("article h2[id], article h3[id]"),
    );
    headingElements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
      headingElementsRef.current = {};
    };
  }, [tocItems]);

  if (!tocItems?.length) {
    return (
      <aside className="sticky top-24 p-4 bg-gray-50 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">Table of Contents</h3>
        <p className="text-sm text-gray-500">No sections found.</p>
      </aside>
    );
  }

  const renderTocList = (items: TocItem[], isNested = false) => (
    <ul className={isNested ? "ml-4 space-y-1" : "space-y-2 text-sm"}>
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className={`block hover:text-primary transition-colors duration-150 
                        ${
                          item.id === activeId
                            ? "text-primary font-semibold"
                            : item.level === 3
                            ? "text-gray-600"
                            : "text-gray-800 font-medium"
                        }`}
          >
            {item.text}
          </a>
          {item.children &&
            item.children.length > 0 &&
            renderTocList(item.children, true)}
        </li>
      ))}
    </ul>
  );

  return (
    <aside className="sticky top-24 p-4 bg-gray-50 rounded-lg shadow max-h-[calc(100vh-10rem)] overflow-y-auto">
      <h3 className="text-lg font-semibold mb-3">Table of Contents</h3>
      {renderTocList(tocItems)}
    </aside>
  );
};

export default TableOfContents;
