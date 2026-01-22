"use client";

import React, { FC } from "react";
import { sanitizeHTML } from "@/utils/sanitizeHTML";

interface SimpleRichTextRendererProps {
  html: string;
  className?: string;
}

const SimpleRichTextRenderer: FC<SimpleRichTextRendererProps> = ({
  html,
  className,
}) => {
  return (
    <div style={{ position: "relative" }}>
      <div
        className={`simple-rich-text-renderer prose max-w-none ${
          className ?? ""
        }`}
        style={{ fontFamily: "Karla, sans-serif" }}
        dangerouslySetInnerHTML={{ __html: sanitizeHTML(html) }}
      />
      <style jsx>{`
        .simple-rich-text-renderer h2 {
          font-size: 1.15rem;
          font-weight: 600;
          margin: 0.75rem 0 0.4rem;
        }
        .simple-rich-text-renderer h3 {
          font-size: 1.05rem;
          font-weight: 600;
          margin: 0.6rem 0 0.3rem;
        }
        .simple-rich-text-renderer h4 {
          font-size: 0.95rem;
          font-weight: 600;
          margin: 0.5rem 0 0.2rem;
        }
        .simple-rich-text-renderer ul {
          list-style: disc;
          margin-left: 1.5rem;
        }
        .simple-rich-text-renderer ol {
          list-style: decimal;
          margin-left: 1.5rem;
        }
        .simple-rich-text-renderer b,
        .simple-rich-text-renderer strong {
          font-weight: bold;
        }
        .simple-rich-text-renderer p {
          margin: 0.5em 0;
        }
      `}</style>
    </div>
  );
};

export default SimpleRichTextRenderer;

// Style block for guaranteed WYSIWYG rendering
// Copy the same heading/list/paragraph CSS as the editor
