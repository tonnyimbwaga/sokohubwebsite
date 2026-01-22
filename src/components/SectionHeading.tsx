import React from "react";

interface SectionHeadingProps {
  title: string | React.ReactNode;
  description?: string;
  className?: string;
}

const SectionHeading = ({
  title,
  description,
  className = "",
}: SectionHeadingProps) => {
  return (
    <div className={`text-center ${className}`}>
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg leading-8 text-gray-600">{description}</p>
      )}
    </div>
  );
};

export default SectionHeading;
