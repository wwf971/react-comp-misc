import React from 'react';

function ExpandIconHorizontal({ width = 24, height = 24 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="9.5,18 3.5,12 9.5,6"></polyline>
      <polyline points="14.5,6 20.5,12 14.5,18"></polyline>
    </svg>
  );
}

function ExpandIconVertical({ width = 24, height = 24 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="18,9.5 12,3.5 6,9.5"></polyline>
      <polyline points="6,14.5 12,20.5 18,14.5"></polyline>
    </svg>
  );
}

const ExpandIcon = ExpandIconHorizontal;

export { ExpandIconHorizontal, ExpandIconVertical, ExpandIcon };
export default ExpandIconHorizontal;
