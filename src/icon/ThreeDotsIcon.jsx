import React from 'react';

/**
 * ThreeDotsIcon - vertical three-dot menu / more icon (half of DragIcon grip).
 */
const ThreeDotsIcon = ({
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
      className={`icon three-dots-icon ${className}`}
      {...props}
    >
      <circle cx="8" cy="4" r="1" fill={color} />
      <circle cx="8" cy="8" r="1" fill={color} />
      <circle cx="8" cy="12" r="1" fill={color} />
    </svg>
  );
};

export default ThreeDotsIcon;
