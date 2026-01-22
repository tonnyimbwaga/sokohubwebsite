import React from "react";
import { useInView } from "react-intersection-observer";

interface LazyLoadSectionProps {
  children: React.ReactNode;
  minHeight?: string | number;
  className?: string;
  rootMargin?: string; // e.g., "200px 0px 200px 0px" or just "200px"
  triggerOnce?: boolean; // Added to props for flexibility, defaults to true
}

const LazyLoadSection: React.FC<LazyLoadSectionProps> = ({
  children,
  minHeight = "300px", // Default minHeight
  className = "",
  rootMargin = "0px", // Default rootMargin
  triggerOnce = true, // Default triggerOnce
}) => {
  const { ref, inView } = useInView({
    triggerOnce: triggerOnce,
    rootMargin: rootMargin,
  });

  if (inView) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      style={{
        minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight,
      }}
      className={className}
      aria-hidden="true" // Hide placeholder from screen readers as it's purely visual
    />
  );
};

export default LazyLoadSection;
