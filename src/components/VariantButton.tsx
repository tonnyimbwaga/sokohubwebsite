import React from "react";
import { motion } from "framer-motion";

export interface Variant {
    value: string;
    label: string;
    price: number;
    available?: boolean;
}

interface VariantButtonProps {
    variant: Variant;
    selected: boolean;
    onSelect: (variant: Variant) => void;
    disabled?: boolean;
}

const VariantButton: React.FC<VariantButtonProps> = ({
    variant,
    selected,
    onSelect,
    disabled = false,
}) => {
    const isAvailable = variant.available !== false;

    return (
        <motion.button
            type="button"
            whileHover={!disabled && isAvailable ? { y: -2, shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" } : {}}
            whileTap={!disabled && isAvailable ? { scale: 0.98 } : {}}
            onClick={() => onSelect(variant)}
            disabled={disabled || !isAvailable}
            className={`
        relative overflow-hidden group px-6 py-3 rounded-xl border-2 transition-all duration-300
        ${selected
                    ? "border-primary bg-primary text-white shadow-lg ring-2 ring-primary/20"
                    : "border-slate-100 bg-slate-50/50 text-slate-600 hover:border-slate-300 hover:bg-white"
                }
        ${(disabled || !isAvailable)
                    ? "opacity-50 cursor-not-allowed grayscale"
                    : "cursor-pointer"
                }
      `}
        >
            <div className="flex flex-col items-center justify-center gap-0.5">
                <span className={`font-bold transition-colors ${selected ? "text-white" : "text-slate-900"}`}>
                    {variant.label}
                </span>
                {!isAvailable && (
                    <span className="text-[10px] uppercase tracking-tighter font-black opacity-60">Out of Stock</span>
                )}
            </div>

            {/* Subtle selection indicator */}
            {selected && (
                <motion.div
                    layoutId="active-bg"
                    className="absolute inset-0 bg-primary -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
        </motion.button>
    );
};

export default VariantButton;
