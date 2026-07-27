import React from 'react';

const SortIconBidirection = React.memo(({ width = 16, height = 16 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 2.5v10.5" />
      <path d="m2.7 10.7 2.3 2.3 2.3-2.3" />
      <path d="M11 13.5V3" />
      <path d="m8.7 5.3 2.3-2.3 2.3 2.3" />
    </svg>
  );
}, (prevProps, nextProps) => {
  return prevProps.width === nextProps.width && prevProps.height === nextProps.height;
});

const SortIcon = SortIconBidirection;

export { SortIconBidirection, SortIcon };
export default SortIconBidirection;
