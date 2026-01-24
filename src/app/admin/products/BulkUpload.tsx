"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

interface BulkUploadProps {
    onSuccess: () => void;
}

export default function BulkUpload({ onSuccess }: BulkUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [jsonInput, setJsonInput] = useState("");

    const handleUpload = async () => {
        if (!jsonInput.trim()) {
            toast.error("Please paste your product JSON data");
            return;
        }

        try {
            setIsUploading(true);
            const data = JSON.parse(jsonInput);

            const response = await fetch("/api/products/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ products: Array.isArray(data) ? data : [data] }),
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.error);

            toast.success(`Successfully uploaded ${result.count} products`);
            setJsonInput("");
            onSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error("Upload failed: " + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Bulk Upload Products</h3>
            <p className="text-sm text-slate-500">
                Paste an array of product objects in JSON format.
            </p>
            <textarea
                className="w-full h-64 p-4 rounded-2xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder='[
  {
    "name": "Toy Car",
    "price": 500,
    "stock": 10,
    "category_id": "uuid-here",
    "images": ["url1", "url2"]
  }
]'
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
            />
            <div className="flex justify-end gap-3">
                <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="px-6 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 transition-all shadow-lg"
                >
                    {isUploading ? "Uploading..." : "Start Bulk Upload"}
                </button>
            </div>
        </div>
    );
}
