import type { FC, ReactNode } from "react";
import React from "react";

export interface FormItemProps {
  className?: string;
  label?: string;
  desc?: ReactNode | string;
  children?: React.ReactNode;
  error?: string;
}

const FormItem: FC<FormItemProps> = ({
  children,
  className = "",
  label,
  desc,
  error,
}) => {
  return (
    <div className={className}>
      {label && <div className="font-medium">{label}</div>}
      <div className="mt-1.5">{children}</div>
      {desc && <div className="mt-1.5 block text-neutral-500 ">{desc}</div>}
      {error && (
        <div className="mt-1.5 block text-sm text-red-500">{error}</div>
      )}
    </div>
  );
};

export default FormItem;
