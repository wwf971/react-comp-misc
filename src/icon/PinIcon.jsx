import React from 'react';

/**
 * PinIconEnabled - filled pushpin / thumbtack, tip bottom-left, head top-right.
 */
const PinIconEnabled = ({
  width = 16,
  height = 16,
  color = 'currentColor',
  strokeWidth = 10,
  className = '',
  style = {},
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 118.95 136.39"
      fill={color}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon pin-icon-enabled ${className}`}
      style={style}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M14.76,60.13S22.06,53.86,44,38.26C54,31.14,62.17,25,67.16,20.93c-.41-6,1.58-15.19,5-18.53l44.45,40c-2.33,3.08-6.36,6-15.57,7.06L70.59,109.91,43,85.29Z" />
      <path d="M1.35,135.28l41.51-50.1" fill="none" />
    </svg>
  );
};

/**
 * PinIcon - outline pushpin / thumbtack, tip bottom-left, head top-right.
 * Pass isEnabled={true} to render the filled PinIconEnabled variant.
 */
const PinIcon = ({
  width = 16,
  height = 16,
  color = 'currentColor',
  strokeWidth = 10,
  isEnabled = false,
  className = '',
  style = {},
  ...props
}) => {
  if (isEnabled) {
    return (
      <PinIconEnabled
        width={width}
        height={height}
        color={color}
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
      viewBox="0 0 118.95 136.39"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon pin-icon ${className}`}
      style={style}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M14.76,60.13S22.06,53.86,44,38.26C54,31.14,62.17,25,67.16,20.93c-.41-6,1.58-15.19,5-18.53l44.45,40c-2.33,3.08-6.36,6-15.57,7.06L70.59,109.91,43,85.29Z" />
      <path d="M1.35,135.28l41.51-50.1" />
    </svg>
  );
};

export default PinIcon;
export {
  PinIcon,
  PinIconEnabled,
  PinIcon as ThumbstackIcon,
  PinIconEnabled as ThumbstackIconEnabled,
};
