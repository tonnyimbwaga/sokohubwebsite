import React, { FC, useState, useEffect } from "react";

export interface Color {
    value: string;
    label: string;
    price: number;
    available: boolean;
}

interface ProductColorConfigProps {
    initialColors?: Color[];
    onChange?: (colors: Color[]) => void;
    useColorPricing?: boolean;
}

const ProductColorConfig: FC<ProductColorConfigProps> = ({
    initialColors = [],
    onChange,
    useColorPricing = false,
}) => {
    const [colors, setColors] = useState<Color[]>(initialColors);
    const [newColorLabel, setNewColorLabel] = useState("");
    const [newColorValue, setNewColorValue] = useState("");
    const [price, setPrice] = useState<number>(0);

    useEffect(() => {
        onChange?.(colors);
    }, [colors, onChange]);

    const addColor = () => {
        if (!newColorLabel.trim()) return;

        const newColorObj: Color = {
            label: newColorLabel,
            value: newColorValue, // Don't fallback to label, keep it empty if not provided
            price: price || 0,
            available: true,
        };

        setColors([...colors, newColorObj]);
        setNewColorLabel("");
        setNewColorValue("");
        setPrice(0);
        onChange?.([...colors, newColorObj]);
    };

    const removeColor = (index: number) => {
        const updatedColors = colors.filter((_, i) => i !== index);
        setColors(updatedColors);
        onChange?.(updatedColors);
    };

    const updateColorField = (
        index: number,
        field: keyof Color,
        newValue: string | number | boolean,
    ) => {
        const updatedColors = colors.map((color, i) =>
            i === index ? { ...color, [field]: newValue } : color,
        );
        setColors(updatedColors);
        onChange?.(updatedColors);
    };

    return (
        <div className="space-y-6">
            {/* Add Color Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <div className="flex-1">
                    <input
                        type="text"
                        value={newColorLabel}
                        onChange={(e) => setNewColorLabel(e.target.value)}
                        placeholder="Color Name (e.g. Blue, White, Crimson)"
                        className="rounded-lg border p-3 text-base w-full"
                    />
                </div>
                {useColorPricing && (
                    <div className="w-full sm:w-40">
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            placeholder="Extra Price (optional)"
                            className="rounded-lg border p-3 text-base font-mono text-right w-full"
                            min={0}
                        />
                    </div>
                )}
                <button
                    onClick={addColor}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold shadow-sm hover:bg-indigo-700 transition whitespace-nowrap w-full sm:w-auto"
                    type="button"
                >
                    Add Option
                </button>
            </div>

            {/* Grid Layout for added colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {colors.map((color, index) => (
                    <div
                        key={index}
                        className="rounded-xl border shadow-sm bg-white p-4 flex flex-col gap-3 hover:border-indigo-200 transition-colors"
                    >
                        <div className="flex gap-4 items-start">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={color.label}
                                    onChange={(e) =>
                                        updateColorField(index, "label", e.target.value)
                                    }
                                    placeholder="Color Label"
                                    className="font-bold text-gray-900 border-none p-0 focus:ring-0 w-full text-lg mb-1"
                                />
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={color.value}
                                        onChange={(e) =>
                                            updateColorField(index, "value", e.target.value)
                                        }
                                        className="text-xs text-gray-400 border border-gray-100 rounded px-1.5 py-0.5 focus:ring-0 w-32"
                                        placeholder="Hex/CSS (optional)"
                                    />
                                    {color.value && (
                                        <div
                                            className="w-4 h-4 rounded-full border border-gray-200"
                                            style={{ backgroundColor: color.value }}
                                        />
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => removeColor(index)}
                                className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                                type="button"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex justify-between items-center mt-1 border-t pt-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={color.available}
                                    onChange={(e) => updateColorField(index, "available", e.target.checked)}
                                    id={`color-available-${index}`}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor={`color-available-${index}`} className="text-sm font-medium text-gray-700">
                                    In Stock
                                </label>
                            </div>
                            {useColorPricing && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Price:</span>
                                    <input
                                        type="number"
                                        value={color.price}
                                        onChange={(e) => updateColorField(index, "price", Number(e.target.value))}
                                        className="w-24 rounded border p-1 text-sm text-right font-mono"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductColorConfig;
