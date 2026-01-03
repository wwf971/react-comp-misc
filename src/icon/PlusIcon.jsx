import React from 'react';

/**
 * PlusIcon - Plus/Add icon (+ mark)
 */
const PlusIcon = ({ 
  width = 16, 
  height = 16,
  color = 'currentColor',
  strokeWidth = 2,
  className = '',
  style = {},
  ...props 
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`icon plus-icon ${className}`}
      style={style}
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

export default PlusIcon;

