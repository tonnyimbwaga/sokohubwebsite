"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface StatusSelectProps {
  orderId: string;
  currentStatus: string;
  type: "status" | "paymentStatus";
  options: { value: string; label: string }[];
  className?: string;
}

export default function StatusSelect({
  orderId,
  currentStatus,
  type,
  options,
  className = "",
}: StatusSelectProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/${type}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setStatus(newStatus);
      router.refresh();
      toast.success(
        `Order ${
          type === "status" ? "status" : "payment status"
        } updated successfully`,
      );
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
      setStatus(currentStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <select
      value={status}
      onChange={(e) => handleStatusChange(e.target.value)}
      disabled={isUpdating}
      className={`px-3 py-1 border rounded-md bg-white text-sm ${className} ${
        isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
