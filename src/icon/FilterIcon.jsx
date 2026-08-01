import React from 'react';

function FilterIconEnabled({
  width = 16,
  height = 16,
  color = 'currentColor',
  fillColor = 'currentColor',
  strokeWidth = 2,
  className = '',
  style = {},
  ...props
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon filter-icon-enabled ${className}`}
      style={style}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M3 4h18l-7 9v6l-4 2v-8L3 4Z" fill={fillColor} />
    </svg>
  );
}

function FilterIcon({
  width = 16,
  height = 16,
  color = 'currentColor',
  fillColor = 'currentColor',
  strokeWidth = 2,
  isEnabled = false,
  className = '',
  style = {},
  ...props
}) {
  if (isEnabled) {
    return (
      <FilterIconEnabled
        width={width}
        height={height}
        color={color}
        fillColor={fillColor}
        strokeWidth={strokeWidth}
        className={className}
        style={style}
        {...props}
      />
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon filter-icon ${className}`}
      style={style}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M3 4h18l-7 9v6l-4 2v-8L3 4Z" />
    </svg>
  );
}

export { FilterIcon, FilterIconEnabled };
export default FilterIcon;
