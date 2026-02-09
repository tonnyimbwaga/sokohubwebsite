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
    { label: "Brown", value: "#A52A2A" },
    { label: "Gold", value: "#FFD700" },
    { label: "Silver", value: "#C0C0C0" },
    { label: "Maroon", value: "#800000" },
    { label: "Olive", value: "#808000" },
    { label: "Teal", value: "#008080" },
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
        if (initialColors && JSON.stringify(initialColors) !== JSON.stringify(colors)) {
            setColors(initialColors);
        }
    }, [initialColors]);

    const updateParent = (updatedColors: Color[]) => {
        setColors(updatedColors);
        if (onChange) {
            onChange(updatedColors);
        }
    };

    const addColor = () => {
        const label = newColorLabel.trim();
        const value = newColorValue || "#000000";

        if (!label && !newColorValue) return;

        const newColorObj: Color = {
            label: label || "Custom Color",
            value: value,
            price: price || 0,
            available: true, // Always true by default
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

    // Removed updateColorField generic - kept direct updates for clarity
    const updatePrice = (index: number, newPrice: number) => {
        const updatedColors = colors.map((color, i) =>
            i === index ? { ...color, price: newPrice } : color,
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
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">Add New Color</h3>
                </div>

                <div className="p-5 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left: Palette */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Quick Palette
                            </label>
                            <div className="grid grid-cols-6 gap-2">
                                {PRESET_COLORS.map((preset) => (
                                    <button
                                        key={preset.value}
                                        type="button"
                                        onClick={() => handlePresetClick(preset)}
                                        className={`group relative w-8 h-8 rounded-full border shadow-sm transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 ${newColorValue === preset.value ? 'ring-2 ring-offset-1 ring-indigo-500 scale-110 z-10' : 'border-gray-200'
                                            }`}
                                        style={{ backgroundColor: preset.value }}
                                        title={preset.label}
                                    >
                                        {/* Tooltip on hover */}
                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-[10px] font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                            {preset.label}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-4 flex items-center gap-3 pt-4 border-t border-gray-100">
                                <label className="text-sm font-medium text-gray-700">Custom:</label>
                                <div className="relative group">
                                    <input
                                        type="color"
                                        value={newColorValue || "#000000"}
                                        onChange={(e) => setNewColorValue(e.target.value)}
                                        className="h-9 w-14 p-0 border-0 rounded cursor-pointer shadow-sm"
                                    />
                                </div>
                                <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                                    {newColorValue || "Hex Code"}
                                </span>
                            </div>
                        </div>

                        {/* Right: Inputs */}
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Label Name
                                </label>
                                <input
                                    type="text"
                                    value={newColorLabel}
                                    onChange={(e) => setNewColorLabel(e.target.value)}
                                    placeholder="e.g. Midnight Blue"
                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
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
                                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-full font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                                        min={0}
                                    />
                                </div>
                            )}

                            <div className="mt-auto pt-2">
                                <button
                                    onClick={addColor}
                                    type="button"
                                    disabled={!newColorValue && !newColorLabel}
                                    className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                    </svg>
                                    Add Color Variant
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* List of Added Colors */}
            {colors.length > 0 && (
                <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Active Variants ({colors.length})
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {colors.map((color, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm flex items-center gap-3 group hover:border-indigo-300 transition-colors"
                            >
                                <div
                                    className="w-9 h-9 rounded-full border border-gray-200 shadow-inner flex-shrink-0"
                                    style={{ backgroundColor: color.value }}
                                    title={color.value}
                                />

                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-gray-900 truncate text-sm">
                                        {color.label}
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                        <span className="font-mono bg-gray-100 px-1.5 rounded">{color.value}</span>
                                        {color.price > 0 && (
                                            <span className="bg-green-100 text-green-800 px-1.5 rounded font-bold">
                                                +{color.price}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {useColorPricing && (
                                    <input
                                        type="number"
                                        value={color.price}
                                        onChange={(e) => updatePrice(index, Number(e.target.value))}
                                        className="w-20 text-right text-xs border border-gray-200 rounded p-1 focus:ring-1 focus:ring-indigo-500"
                                        placeholder="Price"
                                    />
                                )}

                                <button
                                    onClick={() => removeColor(index)}
                                    className="text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                                    type="button"
                                    title="Remove variant"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {colors.length === 0 && (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500 text-sm">No color variants added.</p>
                </div>
            )}
        </div>
    );
};

export default ProductColorConfig;
