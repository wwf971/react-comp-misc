import React from 'react';

function CollapseIconHorizontal({ width = 24, height = 24 }) {
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
      <polyline points="4,6 10,12 4,18"></polyline>
      <polyline points="20,18 14,12 20,6"></polyline>
    </svg>
  );
}

function CollapseIconVertical({ width = 24, height = 24 }) {
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
      <polyline points="6,4 12,10 18,4"></polyline>
      <polyline points="18,20 12,14 6,20"></polyline>
    </svg>
  );
}

export { CollapseIconHorizontal, CollapseIconVertical };
export default CollapseIconHorizontal;
