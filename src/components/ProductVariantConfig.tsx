import React, { FC, useState, useEffect } from "react";

export interface Variant {
    value: string;
    label: string;
    price: number;
    available: boolean;
}

interface ProductVariantConfigProps {
    initialVariants?: Variant[];
    onChange?: (variants: Variant[]) => void;
    title?: string;
    placeholder?: string;
}

const ProductVariantConfig: FC<ProductVariantConfigProps> = ({
    initialVariants = [],
    onChange,
    title = "Product Variants",
    placeholder = "e.g. XL or White",
}) => {
    const [variants, setVariants] = useState<Variant[]>(initialVariants);
    const [newLabel, setNewLabel] = useState("");
    const [price, setPrice] = useState<number>(0);

    // Sync with initialVariants if they change
    useEffect(() => {
        if (initialVariants && JSON.stringify(initialVariants) !== JSON.stringify(variants)) {
            setVariants(initialVariants);
        }
    }, [initialVariants]);

    const updateParent = (updatedVariants: Variant[]) => {
        setVariants(updatedVariants);
        onChange?.(updatedVariants);
    };

    const addVariant = () => {
        if (!newLabel.trim()) return;

        const newVariant: Variant = {
            value: newLabel.trim(),
            label: newLabel.trim(),
            price: price || 0,
            available: true,
        };

        const updatedVariants = [...variants, newVariant];
        updateParent(updatedVariants);
        setNewLabel("");
        setPrice(0);
    };

    const removeVariant = (index: number) => {
        const updatedVariants = variants.filter((_, i) => i !== index);
        updateParent(updatedVariants);
    };

    const updateVariantField = (
        index: number,
        field: keyof Variant,
        newValue: string | number | boolean,
    ) => {
        const updatedVariants = variants.map((v, i) =>
            i === index ? { ...v, [field]: newValue } : v,
        );
        updateParent(updatedVariants);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Manage variants and custom pricing</span>
                </div>

                <div className="p-5 space-y-4">
                    {/* Add Variant Controls */}
                    <div className="flex flex-col sm:flex-row gap-3 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Variant Name (Label)</label>
                            <input
                                type="text"
                                value={newLabel}
                                onChange={(e) => setNewLabel(e.target.value)}
                                placeholder={placeholder}
                                className="rounded-lg border border-gray-300 p-2.5 text-sm w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div className="w-full sm:w-32">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Price (+KES)</label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                placeholder="0"
                                className="rounded-lg border border-gray-300 p-2.5 text-sm font-mono text-right w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                min={0}
                            />
                        </div>
                        <button
                            onClick={addVariant}
                            disabled={!newLabel.trim()}
                            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap w-full sm:w-auto flex items-center justify-center gap-2"
                            type="button"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Add Variant
                        </button>
                    </div>

                    {/* List of Variants */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        {variants.map((variant, index) => (
                            <div
                                key={index}
                                className="bg-gray-50 rounded-lg border border-gray-200 p-3 flex items-center gap-3 group hover:border-indigo-200 transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <input
                                        type="text"
                                        value={variant.label}
                                        onChange={(e) => updateVariantField(index, "label", e.target.value)}
                                        className="bg-transparent border-none p-0 font-medium text-gray-900 focus:ring-0 w-full text-sm"
                                    />
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-gray-400 font-mono">Price: KES</span>
                                        <input
                                            type="number"
                                            value={variant.price}
                                            onChange={(e) => updateVariantField(index, "price", Number(e.target.value))}
                                            className="bg-transparent border-none p-0 text-[10px] font-mono font-bold text-indigo-600 focus:ring-0 w-16"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => updateVariantField(index, "available", !variant.available)}
                                        className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${variant.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                            }`}
                                        type="button"
                                    >
                                        {variant.available ? "Available" : "Stock-out"}
                                    </button>
                                    <button
                                        onClick={() => removeVariant(index)}
                                        className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors"
                                        type="button"
                                        aria-label="Remove variant"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {variants.length === 0 && (
                        <div className="text-center py-6 bg-white rounded-lg border border-dashed border-gray-200">
                            <p className="text-xs text-gray-400">No variants added yet. Start by adding one above.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductVariantConfig;
