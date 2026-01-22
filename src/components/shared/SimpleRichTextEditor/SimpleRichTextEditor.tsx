"use client";

import React, { FC, useRef, useEffect, useCallback } from "react";

interface SimpleRichTextEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  className?: string;
  placeholder?: string;
}

const SimpleRichTextEditor: FC<SimpleRichTextEditorProps> = ({
  initialContent = "",
  onChange,
  className,
  placeholder = "Enter product description...",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize content when component mounts or initialContent changes
  useEffect(() => {
    if (editorRef.current && initialContent !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = initialContent || "<p><br></p>";
    }
  }, [initialContent]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange?.(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const executeCommand = (command: string, value: string | boolean = false) => {
    // Focus the editor first
    editorRef.current?.focus();

    // Execute the command
    document.execCommand(command, false, value as string);

    // Trigger the input event to update the form
    handleInput();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Enter key for proper paragraph creation
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      // Insert a new paragraph
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        // Create new paragraph element
        const p = document.createElement("p");
        p.innerHTML = "<br>";

        // Insert the paragraph
        range.deleteContents();
        range.insertNode(p);

        // Move cursor to the new paragraph
        range.setStart(p, 0);
        range.setEnd(p, 0);
        selection.removeAllRanges();
        selection.addRange(range);

        handleInput();
      }
      return;
    }

    // Handle Shift+Enter for line breaks
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      document.execCommand("insertHTML", false, "<br>");
      handleInput();
      return;
    }

    // Handle common keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b":
          e.preventDefault();
          executeCommand("bold");
          break;
        case "i":
          e.preventDefault();
          executeCommand("italic");
          break;
        case "u":
          e.preventDefault();
          executeCommand("underline");
          break;
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();

    // Get plain text from clipboard
    const text = e.clipboardData.getData("text/plain");

    // Insert as HTML, converting line breaks to paragraphs
    const htmlText = text
      .split("\n\n")
      .map((paragraph) =>
        paragraph.trim() ? `<p>${paragraph.replace(/\n/g, "<br>")}</p>` : "",
      )
      .filter(Boolean)
      .join("");

    document.execCommand("insertHTML", false, htmlText || text);
    handleInput();
  };

  return (
    <div
      className={`rich-text-editor border rounded-lg bg-white ${
        className ?? ""
      }`}
    >
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-3 flex flex-wrap gap-1 bg-gray-50 rounded-t-lg">
        <button
          type="button"
          onClick={() => executeCommand("bold")}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-white hover:shadow-sm font-bold transition-colors"
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => executeCommand("italic")}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-white hover:shadow-sm italic transition-colors"
          title="Italic (Ctrl+I)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => executeCommand("underline")}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-white hover:shadow-sm underline transition-colors"
          title="Underline (Ctrl+U)"
        >
          U
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <button
          type="button"
          onClick={() => executeCommand("insertUnorderedList")}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-white hover:shadow-sm transition-colors"
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => executeCommand("insertOrderedList")}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-white hover:shadow-sm transition-colors"
          title="Numbered List"
        >
          1. List
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <select
          onChange={(e) => {
            if (e.target.value) {
              executeCommand("formatBlock", e.target.value);
              e.target.value = "";
            }
          }}
          className="text-sm border border-gray-300 rounded px-2 py-1.5 hover:bg-white hover:shadow-sm transition-colors"
          defaultValue=""
        >
          <option value="">Format</option>
          <option value="p">Normal</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
        </select>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <button
          type="button"
          onClick={() => executeCommand("justifyLeft")}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-white hover:shadow-sm transition-colors"
          title="Align Left"
        >
          ⬅
        </button>
        <button
          type="button"
          onClick={() => executeCommand("justifyCenter")}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-white hover:shadow-sm transition-colors"
          title="Align Center"
        >
          ⬌
        </button>
        <button
          type="button"
          onClick={() => executeCommand("justifyRight")}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-white hover:shadow-sm transition-colors"
          title="Align Right"
        >
          ➡
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        className="min-h-[200px] p-4 focus:outline-none"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        style={{
          fontFamily: "Karla, sans-serif",
          lineHeight: "1.6",
        }}
      />

      <style jsx>{`
        .rich-text-editor [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          position: absolute;
        }

        .rich-text-editor p {
          margin: 0.75rem 0;
          line-height: 1.6;
          min-height: 1.2em;
        }

        .rich-text-editor p:first-child {
          margin-top: 0;
        }

        .rich-text-editor p:last-child {
          margin-bottom: 0;
        }

        .rich-text-editor h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1.5rem 0 0.75rem;
          line-height: 1.3;
        }

        .rich-text-editor h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1.25rem 0 0.5rem;
          line-height: 1.3;
        }

        .rich-text-editor h4 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem;
          line-height: 1.3;
        }

        .rich-text-editor ul,
        .rich-text-editor ol {
          margin: 0.75rem 0;
          padding-left: 2rem;
        }

        .rich-text-editor ul {
          list-style-type: disc;
        }

        .rich-text-editor ol {
          list-style-type: decimal;
        }

        .rich-text-editor li {
          margin: 0.25rem 0;
          line-height: 1.6;
          padding-left: 0.25rem;
        }

        .rich-text-editor strong,
        .rich-text-editor b {
          font-weight: 600;
        }

        .rich-text-editor em,
        .rich-text-editor i {
          font-style: italic;
        }

        .rich-text-editor u {
          text-decoration: underline;
        }

        .rich-text-editor [contenteditable] {
          outline: none;
        }

        .rich-text-editor [contenteditable]:focus {
          outline: none;
        }

        .rich-text-editor br {
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
};

export default SimpleRichTextEditor;
