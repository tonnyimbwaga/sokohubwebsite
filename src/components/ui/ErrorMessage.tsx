import React from "react";

interface ErrorMessageProps {
  message?: string | null;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  className = "",
}) => {
  if (!message) return null;
  return (
    <div
      className={`mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700 ${className}`}
      role="alert"
    >
      {message}
    </div>
  );
};

export default ErrorMessage;
