import React from 'react';

/**
 * CopyIcon - Copy to clipboard icon (front rectangle over back rectangle)
 */
const CopyIcon = ({
  size = 16,
  color = 'currentColor',
  strokeWidth = 1.5,
  className = '',
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`icon copy-icon ${className}`}
      {...props}
    >
      <rect
        x="6"
        y="6"
        width="8"
        height="8"
        rx="1.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path
        d="M4 10.5H3.5A1.5 1.5 0 0 1 2 9V3.5A1.5 1.5 0 0 1 3.5 2H9a1.5 1.5 0 0 1 1.5 1.5V4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CopyIcon;
