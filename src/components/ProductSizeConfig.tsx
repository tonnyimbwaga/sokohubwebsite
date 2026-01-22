import React, { FC, useState, useEffect } from "react";

// Define and export SizeType
export type SizeType = "bicycle" | "skates" | "general";

// Define and export Size interface
export interface Size {
  value: string;
  label: string;
  type: SizeType;
  price: number;
  available: boolean;
}

interface ProductSizeConfigProps {
  initialSizes?: Size[];
  onChange?: (sizes: Size[]) => void;
  useSizePricing?: boolean;
}

const DEFAULT_SIZES = {
  bicycle: [
    { label: "12 inch", value: '12"' },
    { label: "14 inch", value: '14"' },
    { label: "16 inch", value: '16"' },
    { label: "18 inch", value: '18"' },
    { label: "20 inch", value: '20"' },
    { label: "24 inch", value: '24"' },
    { label: "26 inch", value: '26"' },
  ],
  skates: [
    { label: "EU 28–31", value: "28–31" },
    { label: "EU 32–35", value: "32–35" },
    { label: "EU 36–39", value: "36–39" },
    { label: "EU 40–43", value: "40–43" },
    { label: "EU 43–45", value: "43–45" },
    { label: "EU 45–48", value: "45–48" },
  ],
  general: [
    { label: "XS", value: "XS" },
    { label: "S", value: "S" },
    { label: "M", value: "M" },
    { label: "L", value: "L" },
    { label: "XL", value: "XL" },
  ],
};

const ProductSizeConfig: FC<ProductSizeConfigProps> = ({
  initialSizes = [],
  onChange,
  useSizePricing = true,
}) => {
  const [sizes, setSizes] = useState<Size[]>(initialSizes);
  const [sizeType, setSizeType] = useState<SizeType>("general");
  const [newSize, setNewSize] = useState("");
  const [price, setPrice] = useState<number>(0);

  useEffect(() => {
    onChange?.(sizes);
  }, [sizes, onChange]);

  const addSize = () => {
    if (!newSize.trim() || !price || price <= 0) return;
    const newSizeObj: Size = {
      value: newSize,
      label: newSize,
      type: sizeType,
      price,
      available: true,
    };
    setSizes([...sizes, newSizeObj]);
    setNewSize("");
    setPrice(0);
    onChange?.([...sizes, newSizeObj]);
  };

  const removeSize = (index: number) => {
    const updatedSizes = sizes.filter((_, i) => i !== index);
    setSizes(updatedSizes);
    onChange?.(updatedSizes);
  };

  const addDefaultSizes = () => {
    const defaultSizesList = DEFAULT_SIZES[sizeType].map(
      (size: { label: string; value: string }) => ({
        value: size.value,
        label: size.label,
        type: sizeType,
        price: 0,
        available: true,
      }),
    );
    setSizes(defaultSizesList);
    onChange?.(defaultSizesList);
  };

  const updateSizeField = (
    index: number,
    field: keyof Size,
    newValue: string | number | boolean,
  ) => {
    const updatedSizes = sizes.map((size, i) =>
      i === index ? { ...size, [field]: newValue } : size,
    );
    setSizes(updatedSizes);
    onChange?.(updatedSizes);
  };

  return (
    <div className="space-y-6">
      {!useSizePricing && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            <strong>Note:</strong> Size-based pricing is disabled. Sizes added
            here will not have individual prices. Enable size-based pricing in
            the Pricing & Stock section to set individual prices for each size.
          </p>
        </div>
      )}

      {/* Size Type Selector & Add Defaults */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <select
          value={sizeType}
          onChange={(e) => setSizeType(e.target.value as SizeType)}
          className="rounded-lg border p-3 text-base w-full sm:w-auto"
        >
          <option value="general">General Sizes</option>
          <option value="bicycle">Bicycle Sizes</option>
          <option value="skates">Skates Sizes</option>
        </select>
        <button
          onClick={addDefaultSizes}
          className="bg-primary text-white px-6 py-3 rounded-lg font-semibold shadow-sm hover:bg-primary-dark transition whitespace-nowrap w-full sm:w-auto"
          type="button"
        >
          Add Default Sizes
        </button>
      </div>

      {/* Add Size Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <input
          type="text"
          value={newSize}
          onChange={(e) => setNewSize(e.target.value)}
          placeholder="Enter size value"
          className="rounded-lg border p-3 text-base w-full sm:w-auto"
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          placeholder="Price (required)"
          className="rounded-lg border p-3 text-base font-mono text-right w-full sm:w-auto"
          min={0}
          required
          style={{ minWidth: "150px", maxWidth: "100%" }}
        />
        <button
          onClick={addSize}
          className="bg-primary text-white px-6 py-3 rounded-lg font-semibold shadow-sm hover:bg-primary-dark transition whitespace-nowrap w-full sm:w-auto"
          type="button"
        >
          Add Size
        </button>
      </div>

      {/* Card Layout */}
      <div className="space-y-4">
        {sizes.map((size, index) => (
          <div
            key={index}
            className="rounded-lg border shadow-sm bg-white p-4 flex flex-col gap-3"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Label
                </label>
                <input
                  type="text"
                  value={size.label}
                  onChange={(e) =>
                    updateSizeField(index, "label", e.target.value)
                  }
                  placeholder="e.g. EU 28–31"
                  className="rounded border p-2 text-base w-full"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Value/Code
                </label>
                <input
                  type="text"
                  value={size.value}
                  onChange={(e) =>
                    updateSizeField(index, "value", e.target.value)
                  }
                  placeholder="e.g. 28–31"
                  className="rounded border p-2 text-base w-full"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Price (Ksh)
                </label>
                <input
                  type="number"
                  value={size.price}
                  onChange={(e) =>
                    updateSizeField(index, "price", Number(e.target.value))
                  }
                  placeholder="Price"
                  className={`rounded border p-2 text-lg font-mono w-full ${
                    !useSizePricing ? "bg-gray-100 text-gray-500" : ""
                  }`}
                  min={0}
                  required
                  disabled={!useSizePricing}
                  style={{ textAlign: "right" }}
                />
                {!useSizePricing && (
                  <p className="text-xs text-gray-500 mt-1">
                    Disabled - use main product price
                  </p>
                )}
              </div>
              <div className="flex gap-2 items-center pt-5 sm:pt-0">
                <button
                  onClick={() =>
                    updateSizeField(index, "available", !size.available)
                  }
                  className={`px-3 py-2 rounded ${
                    size.available
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                  type="button"
                  title={
                    size.available ? "Mark as unavailable" : "Mark as available"
                  }
                >
                  {size.available ? "Available" : "Unavailable"}
                </button>
                <button
                  onClick={() => removeSize(index)}
                  className="text-red-500 hover:text-red-700 p-2 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
                  type="button"
                  aria-label="Remove size"
                  title="Remove size"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductSizeConfig;
