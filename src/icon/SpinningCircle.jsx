import React from 'react'

const SpinningCircle = React.memo(({ width = 16, height = 16, color = '#666' }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        animation: 'spin 1s linear infinite'
      }}
    >
      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
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
  )
})

SpinningCircle.displayName = 'SpinningCircle'

export default SpinningCircle

