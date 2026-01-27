import React from 'react';

/**
 * MinusIcon - Minus/Subtract icon (- mark)
 */
const MinusIcon = ({ 
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
      className={`icon minus-icon ${className}`}
      style={style}
      {...props}
    >
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

export default MinusIcon;
