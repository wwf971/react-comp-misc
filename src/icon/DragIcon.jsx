import React from 'react';

/**
 * DragIcon - Drag handle icon (grip lines)
 */
const DragIcon = ({ 
  size = 16, 
  color = 'currentColor',
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
      className={`icon drag-icon ${className}`}
      {...props}
    >
      <circle cx="5" cy="4" r="1" fill={color} />
      <circle cx="11" cy="4" r="1" fill={color} />
      <circle cx="5" cy="8" r="1" fill={color} />
      <circle cx="11" cy="8" r="1" fill={color} />
      <circle cx="5" cy="12" r="1" fill={color} />
      <circle cx="11" cy="12" r="1" fill={color} />
    </svg>
  );
};

export default DragIcon;
