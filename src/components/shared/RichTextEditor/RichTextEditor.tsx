"use client";

import { FC, useEffect, useCallback, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import History from "@tiptap/extension-history";
import Link from "@tiptap/extension-link";
import Strike from "@tiptap/extension-strike";
import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";
import Blockquote from "@tiptap/extension-blockquote";
import OrderedList from "@tiptap/extension-ordered-list";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Image from "@tiptap/extension-image";
import { v4 as uuidv4 } from "uuid";

interface RichTextEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  className?: string;
}

const RichTextEditor: FC<RichTextEditorProps> = ({
  initialContent = "",
  onChange,
  className,
}) => {
  const supabase = createClient();
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: true,
        },
        history: false, // We'll use our own history extension
      }),
      Typography,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      History.configure({
        depth: 100,
        newGroupDelay: 500,
      }),
      Placeholder.configure({
        placeholder: "Start writing your blog post...",
      }),
      Link.configure({
        openOnClick: false, // Recommended for better UX in an editor
        autolink: true,
        linkOnPaste: true,
      }),
      Strike,
      Code,
      CodeBlock,
      Blockquote,
      OrderedList,
      HorizontalRule,
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none min-h-[200px] p-4 border rounded-lg",
      },
      handleDOMEvents: {
        keydown: (view, event) => {
          // Prevent cursor jump on Enter key
          if (event.key === "Enter") {
            const { state } = view;
            const { selection } = state;
            const { $from } = selection;

            // Only handle if we're at the end of a block
            if ($from.pos === $from.end()) {
              if (state.schema.nodes.paragraph) {
                view.dispatch(
                  state.tr.insert(
                    $from.pos,
                    state.schema.nodes.paragraph.create(),
                  ),
                );
              }
              return true;
            }
          }
          return false;
        },
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  const toggleHeading = (level: 2 | 3 | 4) => {
    editor?.chain().focus().toggleHeading({ level }).run();
  };

  const addImage = useCallback(
    async (file: File) => {
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(`content/${fileName}`, file);

        if (uploadError) throw uploadError;

        const imageUrl = `/api/images/content/${fileName}`;

        editor?.chain().focus().setImage({ src: imageUrl }).run();
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    },
    [editor, supabase],
  );

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return (
      <div className="p-4 border rounded-lg min-h-[200px]">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="rich-text-editor border border-gray-300 rounded-lg">
      <div className="toolbar border-b p-2 mb-0 bg-gray-50 rounded-t-lg flex flex-wrap items-center gap-x-2 gap-y-1">
        {/* Heading Group */}
        <div className="flex gap-1 items-center border-r border-gray-300 pr-2">
          <button
            onClick={() => toggleHeading(2)}
            className={`px-2 py-1 rounded hover:bg-gray-200 font-semibold ${
              editor.isActive("heading", { level: 2 }) ? "bg-gray-200" : ""
            }`}
            type="button"
            title="Heading 2"
          >
            H2
          </button>
          <button
            onClick={() => toggleHeading(3)}
            className={`px-2 py-1 rounded hover:bg-gray-200 font-semibold ${
              editor.isActive("heading", { level: 3 }) ? "bg-gray-200" : ""
            }`}
            type="button"
            title="Heading 3"
          >
            H3
          </button>
          <button
            onClick={() => toggleHeading(4)}
            className={`px-2 py-1 rounded hover:bg-gray-200 font-semibold ${
              editor.isActive("heading", { level: 4 }) ? "bg-gray-200" : ""
            }`}
            type="button"
            title="Heading 4"
          >
            H4
          </button>
        </div>

        {/* Text Alignment */}
        <div className="flex gap-1 items-center border-r border-gray-300 pr-2">
          <button
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive({ textAlign: "left" }) ? "bg-gray-200" : ""
            }`}
            type="button"
            title="Align Left"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M3 5h18v2H3V5zm0 4h12v2H3V9zm0 4h18v2H3v-2zm0 4h12v2H3v-2z" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive({ textAlign: "center" }) ? "bg-gray-200" : ""
            }`}
            type="button"
            title="Align Center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M3 5h18v2H3V5zm3 4h12v2H6V9zm-3 4h18v2H3v-2zm3 4h12v2H6v-2z" />
            </svg>
          </button>
        </div>

        {/* Style Group */}
        <div className="flex gap-1 items-center border-r border-gray-300 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive("bold") ? "bg-gray-200" : ""
            }`}
            type="button"
            title="Bold"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="currentColor"
            >
              <path d="M8 11h4.5a2.5 2.5 0 1 0 0-5H8v5zm10 4.5a4.5 4.5 0 0 1-4.5 4.5H6V4h6.5a4.5 4.5 0 0 1 3.256 7.606A4.498 4.498 0 0 1 18 15.5zM8 13v5h5.5a2.5 2.5 0 1 0 0-5H8z" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive("italic") ? "bg-gray-200" : ""
            }`}
            type="button"
            title="Italic"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="currentColor"
            >
              <path d="M15 20H7v-2h2.927l2.116-12H9V4h8v2h-2.927l-2.116 12H15z" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive("strike") ? "bg-gray-200" : ""
            }`}
            type="button"
            title="Strikethrough"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM9 12.5h6V14H9v-1.5zm-.25-2.5c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h6.5c.41 0 .75.34.75.75s-.34.75-.75.75H8.75z"
                transform="scale(1.2) translate(-2 -2)"
              />
              <path d="M3 11h18v2H3z" />
            </svg>
          </button>
        </div>

        {/* Link Group */}
        <div className="flex gap-1 items-center border-r border-gray-300 pr-2">
          <button
            onClick={setLink}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive("link") ? "bg-gray-200" : ""
            }`}
            type="button"
            title="Set Link"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17 7h-2v2h2v10H7V9h2V7H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM12 6c.83 0 1.5.67 1.5 1.5S12.83 9 12 9s-1.5-.67-1.5-1.5S11.17 6 12 6zm0-2c-1.93 0-3.5 1.57-3.5 3.5S10.07 11 12 11s3.5-1.57 3.5-3.5S13.93 4 12 4zm5-1h-2v2h2v2h2V7h2V5h-2V3h-2V5z" />
              <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={!editor.isActive("link")}
            className={`p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent`}
            type="button"
            title="Unset Link"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17 7h-2v2h2v10H7V9h2V7H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM12 6c.83 0 1.5.67 1.5 1.5S12.83 9 12 9s-1.5-.67-1.5-1.5S11.17 6 12 6zm0-2c-1.93 0-3.5 1.57-3.5 3.5S10.07 11 12 11s3.5-1.57 3.5-3.5S13.93 4 12 4zm5-1h-2v2h2v2h2V7h2V5h-2V3h-2V5z" />
              <path d="M12.67 18.53c.38.38.99.38 1.37 0l4.05-4.05c.38-.38.38-.99 0-1.37l-4.05-4.05a.966.966 0 00-1.37 0L8.62 13.12a.966.966 0 000 1.37l4.05 4.04zm-1.06-9.9L15.5 4.75l-4.04 4.04-3.89-3.89-1.06 1.06 3.89 3.89-4.04 4.04 1.06 1.06 4.04-4.04 3.89 3.89 1.06-1.06-3.89-3.89 4.04-4.04z" />
            </svg>
          </button>
        </div>

        {/* List Group */}
        <div className="flex gap-1 items-center border-r border-gray-300 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive("bulletList") ? "bg-gray-200" : ""
            }`}
            type="button"
            title="Bullet List"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="currentColor"
            >
              <path d="M8 4h13v2H8V4zm3 4h12v2H6V9zm-3 4h18v2H3v-2zm3 4h12v2H6v-2z" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive("orderedList") ? "bg-gray-200" : ""
            }`}
            type="button"
            title="Ordered List"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M7 5c0-.55-.45-1-1-1s-1 .45-1 1v2c0 .55.45 1 1 1s1-.45 1-1V5zm-1 6c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1s1-.45 1-1v-1c0-.55-.45-1-1-1zm1 5c0-.55-.45-1-1-1s-1 .45-1 1v2c0 .55.45 1 1 1s1-.45 1-1v-2zm2-11h14v2H8V5zm0 6h14v2H8v-2zm0 6h14v2H8v-2z" />
            </svg>
          </button>
        </div>

        {/* Block Element Group */}
        <div className="flex gap-1 items-center">
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive("blockquote") ? "bg-gray-200" : ""
            }`}
            type="button"
            title="Blockquote"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive("code") ? "bg-gray-200" : ""
            }`}
            type="button"
            title="Inline Code"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive("codeBlock") ? "bg-gray-200" : ""
            }`}
            type="button"
            title="Code Block"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4zM3 3h18v2H3V3zm0 16h18v2H3v-2z"
                transform="scale(1.2) translate(-2 -2)"
              />
              <path d="M4 5v14h16V5H4zm14 12H6V7h12v10zM8 9h8v2H8V9zm0 4h8v2H8v-2z" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className={`p-2 rounded hover:bg-gray-200`}
            type="button"
            title="Horizontal Rule"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M3 11h18v2H3z" />
            </svg>
          </button>
        </div>
      </div>

      <EditorContent editor={editor} className={className} />

      <div className="text-xs text-gray-500 mt-2 px-2">
        Tip: Use the toolbar for formatting. Paste bullet lists and headings for
        best results. For markdown paste support, please contact support for a
        custom extension.
      </div>
      <style jsx global>{`
        .ProseMirror {
          > * + * {
            margin-top: 0.75em;
          }

          ul,
          ol {
            padding: 0 1rem;
          }

          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
            line-height: 1.1;
            margin-top: 1.5em;
            margin-bottom: 0.75em;
          }

          p {
            margin: 0.5em 0;
          }

          ul {
            list-style: disc;
            margin-left: 1.5rem;
          }

          ol {
            list-style: decimal;
            margin-left: 1.5rem;
          }

          code {
            background-color: rgba(#616161, 0.1);
            border-radius: 0.25em;
            padding: 0.25em;
          }

          img {
            max-width: 100%;
            height: auto;
          }

          blockquote {
            padding-left: 1rem;
            border-left: 2px solid rgba(#0d0d0d, 0.1);
          }

          hr {
            border: none;
            border-top: 2px solid rgba(#0d0d0d, 0.1);
            margin: 2rem 0;
          }
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
