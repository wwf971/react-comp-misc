import React from 'react';

/**
 * AddIcon - Plus/Add icon (+ mark)
 */
const AddIcon = ({ 
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
      className={`icon add-icon ${className}`}
      {...props}
    >
      <line
        x1="8"
        y1="4"
        x2="8"
        y2="12"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <line
        x1="4"
        y1="8"
        x2="12"
        y2="8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
};

export default AddIcon;

