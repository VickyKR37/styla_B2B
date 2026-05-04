import React from 'react';

type LoadingSpinnerProps = {
  size?: number;
  className?: string;
  fullPage?: boolean;
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 64,
  className = '',
  fullPage = false,
}) => {
  const spinner = (
    <div
      className={`animate-spin rounded-full border-t-4 border-b-4 border-blue-500 ${className}`}
      style={{ width: size, height: size }}
    />
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
        {spinner}
        <p className="ml-4 text-lg text-gray-700">Loading...</p>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
