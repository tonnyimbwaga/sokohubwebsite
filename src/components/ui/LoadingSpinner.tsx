import React from "react";

const LoadingSpinner: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <div className={`flex items-center justify-center ${className}`}>
    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
  </div>
);

export default LoadingSpinner;
