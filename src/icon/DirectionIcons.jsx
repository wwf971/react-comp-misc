import React from 'react';

const ForwardIcon = React.memo(({ width = 24, height = 24 }) => {
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
    >
      <polyline points="9,18 15,12 9,6"></polyline>
    </svg>
  );
}, (prevProps, nextProps) => {
  return prevProps.width === nextProps.width && prevProps.height === nextProps.height;
});

const DownIcon = React.memo(({ width = 24, height = 24 }) => {
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
    >
      <polyline points="6,9 12,15 18,9"></polyline>
    </svg>
  );
}, (prevProps, nextProps) => {
  return prevProps.width === nextProps.width && prevProps.height === nextProps.height;
});

const BackIcon = React.memo(({ width = 24, height = 24 }) => {
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
    >
      <polyline points="15,18 9,12 15,6"></polyline>
    </svg>
  );
}, (prevProps, nextProps) => {
  return prevProps.width === nextProps.width && prevProps.height === nextProps.height;
});

const UpIcon = React.memo(({ width = 24, height = 24 }) => {
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
    >
      <polyline points="18,15 12,9 6,15"></polyline>
    </svg>
  );
}, (prevProps, nextProps) => {
  return prevProps.width === nextProps.width && prevProps.height === nextProps.height;
});

const RightIcon = ForwardIcon;
const LeftIcon = BackIcon;

export { ForwardIcon, DownIcon, BackIcon, UpIcon, RightIcon, LeftIcon };
export default DownIcon;

