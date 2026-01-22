import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  locale: string = "en-GB",
  currency: string = "KES",
): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    amount,
  );
}
