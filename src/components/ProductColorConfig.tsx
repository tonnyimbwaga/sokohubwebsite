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

const PRESET_COLORS = [
    { label: "White", value: "#FFFFFF" },
    { label: "Black", value: "#000000" },
    { label: "Red", value: "#FF0000" },
    { label: "Blue", value: "#0000FF" },
    { label: "Green", value: "#008000" },
    { label: "Yellow", value: "#FFFF00" },
    { label: "Orange", value: "#FFA500" },
    { label: "Purple", value: "#800080" },
    { label: "Pink", value: "#FFC0CB" },
    { label: "Navy", value: "#000080" },
    { label: "Gray", value: "#808080" },
    { label: "Beige", value: "#F5F5DC" },
];

const ProductColorConfig: FC<ProductColorConfigProps> = ({
    initialColors = [],
    onChange,
    useColorPricing = false,
}) => {
    const [colors, setColors] = useState<Color[]>(initialColors);
    const [newColorLabel, setNewColorLabel] = useState("");
    const [newColorValue, setNewColorValue] = useState(""); // Stores hex
    const [price, setPrice] = useState<number>(0);

    // Sync with initialColors if they change (e.g. from parent re-fetch)
    useEffect(() => {
        if (initialColors) {
            setColors(initialColors);
        }
    }, [initialColors]);

    const updateParent = (updatedColors: Color[]) => {
        setColors(updatedColors);
        onChange?.(updatedColors);
    };

    const addColor = () => {
        if (!newColorLabel.trim() && !newColorValue) return;

        // If no value picked but label exists, try to find a match or default to black? 
        // Or just let it be empty value? User wants visual picker, so value should be present.
        // For custom colors without hex, we might generate a random one or rely on label? 
        // No, best to require value for a "visual" picker flow, or default to #000000.
        const colorValue = newColorValue || "#000000";

        const newColorObj: Color = {
            label: newColorLabel || "Custom Color",
            value: colorValue,
            price: price || 0,
            available: true,
        };

        const updatedColors = [...colors, newColorObj];
        updateParent(updatedColors);

        // Reset form
        setNewColorLabel("");
        setNewColorValue("");
        setPrice(0);
    };

    const removeColor = (index: number) => {
        const updatedColors = colors.filter((_, i) => i !== index);
        updateParent(updatedColors);
    };

    const updateColorField = (
        index: number,
        field: keyof Color,
        newValue: string | number | boolean,
    ) => {
        const updatedColors = colors.map((color, i) =>
            i === index ? { ...color, [field]: newValue } : color,
        );
        updateParent(updatedColors);
    };

    const handlePresetClick = (preset: { label: string; value: string }) => {
        setNewColorLabel(preset.label);
        setNewColorValue(preset.value);
    };

    return (
        <div className="space-y-6">
            {/* Add Color Controls */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Visual Color Picker */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pick a Color
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {PRESET_COLORS.map((preset) => (
                                <button
                                    key={preset.value}
                                    type="button"
                                    onClick={() => handlePresetClick(preset)}
                                    className={`w-8 h-8 rounded-full border shadow-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${newColorValue === preset.value ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'border-gray-200'
                                        }`}
                                    style={{ backgroundColor: preset.value }}
                                    title={preset.label}
                                />
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <input
                                    type="color"
                                    value={newColorValue || "#000000"}
                                    onChange={(e) => setNewColorValue(e.target.value)}
                                    className="h-10 w-20 p-0 border-0 rounded overflow-hidden cursor-pointer shadow-sm"
                                />
                                <div className="absolute inset-0 pointer-events-none border border-gray-200 rounded text-xs flex items-center justify-center bg-white/50 opacity-0 hover:opacity-100">
                                    Custom
                                </div>
                            </div>
                            <span className="text-sm text-gray-500 font-mono">
                                {newColorValue || "Select a color"}
                            </span>
                        </div>
                    </div>

                    {/* Details Input */}
                    <div className="flex flex-col gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Color Name
                            </label>
                            <input
                                type="text"
                                value={newColorLabel}
                                onChange={(e) => setNewColorLabel(e.target.value)}
                                placeholder="e.g. Midnight Blue"
                                className="rounded-lg border border-gray-300 p-2.5 text-sm w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {useColorPricing && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Extra Price (+KES)
                                </label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                    placeholder="0"
                                    className="rounded-lg border border-gray-300 p-2.5 text-sm font-mono w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    min={0}
                                />
                            </div>
                        )}

                        <div className="mt-auto pt-2">
                            <button
                                onClick={addColor}
                                type="button"
                                disabled={!newColorValue && !newColorLabel}
                                className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-semibold shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                </svg>
                                Add Color Variant
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* List of Added Colors */}
            {colors.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {colors.map((color, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm flex items-center gap-3 group hover:border-indigo-200 transition-colors"
                        >
                            <div
                                className="w-10 h-10 rounded-full border border-gray-200 shadow-inner flex-shrink-0"
                                style={{ backgroundColor: color.value }}
                            />

                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 truncate">
                                    {color.label}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                    <span className="font-mono">{color.value}</span>
                                    {color.price > 0 && (
                                        <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                            +{color.price}
                                        </span>
                                    )}
                                    {!color.available && (
                                        <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded text-[10px]">
                                            Out of Stock
                                        </span>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => removeColor(index)}
                                className="text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                                type="button"
                                title="Remove color"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {colors.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500 text-sm">No color variants added yet.</p>
                </div>
            )}
        </div>
    );
};

export default ProductColorConfig;
