import React from 'react';

/**
 * Text style icons for rich-text style toolbars: bold, italic, underline,
 * deleteline (strikethrough), text color, and background color.
 * TextColorIcon and BgColorIcon accept a colorBar prop that paints the bar
 * under the glyph with the currently selected color.
 */

export const BoldIcon = ({
  size = 16,
  color = 'currentColor',
  strokeWidth = 1.5,
  className = '',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`icon bold-icon ${className}`}
    {...props}
  >
    <path
      d="M5 2.5h3.75a2.5 2.5 0 0 1 0 5H5V2.5Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    <path
      d="M5 7.5h4.5a2.75 2.75 0 0 1 0 5.5H5V7.5Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  </svg>
);

export const ItalicIcon = ({
  size = 16,
  color = 'currentColor',
  strokeWidth = 1.5,
  className = '',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`icon italic-icon ${className}`}
    {...props}
  >
    <path d="M6.5 2.5H12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <path d="M4 13.5h5.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <path d="M9.25 2.5 6.75 13.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const UnderlineIcon = ({
  size = 16,
  color = 'currentColor',
  strokeWidth = 1.5,
  className = '',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`icon underline-icon ${className}`}
    {...props}
  >
    <path
      d="M4.5 2.5v4.75a3.5 3.5 0 0 0 7 0V2.5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <path d="M3.5 13.5h9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const DeletelineIcon = ({
  size = 16,
  color = 'currentColor',
  strokeWidth = 1.5,
  className = '',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`icon deleteline-icon ${className}`}
    {...props}
  >
    <path
      d="M11.2 4.4c-.55-1.15-1.75-1.9-3.2-1.9-1.85 0-3.15 1.1-3.15 2.55 0 .75.35 1.35 1.05 1.8"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <path
      d="M4.8 11.6c.55 1.15 1.75 1.9 3.2 1.9 1.85 0 3.15-1.1 3.15-2.55 0-.75-.35-1.35-1.05-1.8"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <path d="M2.5 8h11" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const TextColorIcon = ({
  size = 16,
  color = 'currentColor',
  strokeWidth = 1.5,
  colorBar = 'currentColor',
  className = '',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`icon text-color-icon ${className}`}
    {...props}
  >
    <path
      d="M4 10.5 8 2l4 8.5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M5.5 7.75h5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <rect x="3" y="12.5" width="10" height="2" rx="0.5" fill={colorBar} />
  </svg>
);

export const BgColorIcon = ({
  size = 16,
  color = 'currentColor',
  strokeWidth = 1.5,
  colorBar = 'currentColor',
  className = '',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`icon bg-color-icon ${className}`}
    {...props}
  >
    <path
      d="M9.75 2.25 12.5 5 7 10.5H4.25V7.75L9.75 2.25Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    <path d="M8.5 3.5 11.25 6.25" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <rect x="3" y="12.5" width="10" height="2" rx="0.5" fill={colorBar} />
  </svg>
);
