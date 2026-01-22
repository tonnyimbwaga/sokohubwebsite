import React from "react";

export interface Size {
  value: string;
  label: string;
  price: number;
  inStock?: boolean;
}

interface SizeButtonProps {
  size: Size;
  selected: boolean;
  onSelect: (size: Size) => void;
  disabled?: boolean;
}

const SizeButton: React.FC<SizeButtonProps> = ({
  size,
  selected,
  onSelect,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(size)}
      disabled={disabled || size.inStock === false}
      className={`
        px-4 py-2 rounded-lg border-2 transition-all duration-200
        ${selected
          ? "border-primary bg-primary text-white"
          : "border-gray-200 hover:border-primary"
        }
        ${disabled || size.inStock === false
          ? "opacity-50 cursor-not-allowed bg-gray-100"
          : "cursor-pointer"
        }
      `}
    >
      <div className="flex flex-col items-center">
        <span className="font-medium">{size.label}</span>
        <span className="text-sm">
          {size.inStock === false
            ? "Out of Stock"
            : `KES ${size.price.toLocaleString()}`}
        </span>
      </div>
    </button>
  );
};

export default SizeButton;
