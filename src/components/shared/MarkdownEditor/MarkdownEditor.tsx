"use client";

import React, { FC, useState } from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const MarkdownEditor: FC<MarkdownEditorProps> = ({
  initialValue = "",
  onChange,
  className,
}) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    onChange?.(e.target.value);
  };

  return (
    <div
      className={`markdown-editor grid grid-cols-2 gap-4 ${className ?? ""}`}
    >
      <textarea
        className="p-2 border rounded focus:outline-none focus:ring"
        value={value}
        onChange={handleChange}
        placeholder="Enter markdown..."
      />
      <div className="prose p-2 border rounded overflow-auto">
        <ReactMarkdown>{value}</ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownEditor;
