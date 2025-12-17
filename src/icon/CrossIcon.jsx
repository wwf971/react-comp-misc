import React from 'react';

/**
 * CrossIcon - Close/Delete icon (X mark)
 */
const CrossIcon = ({ 
  size = 16, 
  color = 'currentColor',
  strokeWidth = 2,
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
      className={`icon cross-icon ${className}`}
      {...props}
    >
      <line
        x1="4"
        y1="4"
        x2="12"
        y2="12"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="4"
        x2="4"
        y2="12"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
};

export default CrossIcon;

