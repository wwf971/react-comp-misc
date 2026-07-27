import React from 'react';

function FavoriteIconEnabled({
  width = 16,
  height = 16,
  className = '',
  title = '',
  ...props
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title || undefined}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="m12 2.8 2.77 5.61 6.19.9-4.48 4.37 1.06 6.17L12 16.94l-5.54 2.91 1.06-6.17-4.48-4.37 6.19-.9L12 2.8Z"
        fill="#f6c945"
        stroke="#f6c945"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FavoriteIcon({
  width = 16,
  height = 16,
  isEnabled = false,
  className = '',
  title = '',
  ...props
}) {
  if (isEnabled) {
    return (
      <FavoriteIconEnabled
        width={width}
        height={height}
        className={className}
        title={title}
        {...props}
      />
    );
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title || undefined}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="m12 2.8 2.77 5.61 6.19.9-4.48 4.37 1.06 6.17L12 16.94l-5.54 2.91 1.06-6.17-4.48-4.37 6.19-.9L12 2.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export { FavoriteIcon, FavoriteIconEnabled };
export default FavoriteIcon;
