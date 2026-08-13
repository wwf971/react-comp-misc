import React from 'react'

const SpinningCircle = React.memo(({ width = 16, height = 16, color = '#666' }) => {
  return (
    <span
      style={{
        display: 'inline-flex',
        width,
        height,
        // the rotation must stay on this HTML wrapper, together with will-change.
        // never move the animation onto the svg element: browsers run svg transform
        // animations on the main thread only (will-change does not help there), so
        // the spinner would freeze whenever synchronous work blocks the main thread,
        // e.g. a heavy tab panel mounting behind this spinner
        animation: 'spinning-circle-rotate 1s linear infinite',
        willChange: 'transform'
      }}
    >
      <style>
        {`
          @keyframes spinning-circle-rotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
      <svg
        width={width}
        height={height}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="3"
          fill="none"
          strokeDasharray="50 15"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
})

SpinningCircle.displayName = 'SpinningCircle'

export default SpinningCircle
