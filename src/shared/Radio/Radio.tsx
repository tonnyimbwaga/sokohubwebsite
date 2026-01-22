import type { FC, InputHTMLAttributes } from "react";
import React from "react";

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string | React.ReactNode;
  name: string;
  id?: string;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  defaultChecked?: boolean;
  checked?: boolean;
}

const Radio: FC<RadioProps> = ({
  label,
  name,
  id = name,
  className = "",
  containerClassName = "",
  labelClassName = "",
  defaultChecked,
  checked,
  onChange,
  ...rest
}) => {
  const {
    containerClassName: _containerClassName,
    labelClassName: _labelClassName,
    ...inputSpecificRest
  } = rest as any;

  return (
    <div className={`relative flex items-start ${containerClassName}`}>
      <div className="flex h-5 items-center">
        <input
          id={id}
          name={name}
          type="radio"
          className={`h-4 w-4 cursor-pointer border-neutral-300 text-primary focus:ring-primary ${className}`}
          defaultChecked={defaultChecked}
          checked={checked}
          onChange={onChange}
          {...inputSpecificRest}
        />
      </div>
      {label && (
        <label
          htmlFor={id}
          className={`ml-3 cursor-pointer text-sm ${labelClassName}`}
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default Radio;
