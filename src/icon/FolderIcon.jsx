import React from 'react'

const FolderIcon = React.memo(({ width = 24, height = 24, color = '#F7B64C' }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <g>
        <g>
          <path
            fill={color}
            d="M44.2,8.4V37c0,1.2-0.9,2.1-2.1,2.1H5.9c-1.2,0-2.1-0.9-2.1-2.1V4.1C3.8,2.9,4.7,2,5.9,2h8.7
              c0.8,0,1.4,0.4,1.8,1l1.9,3.2h23.8C43.3,6.3,44.2,7.2,44.2,8.4z"
          />
          <rect x="8.6" y="11.1" fill="#FFFFFF" width="30.8" height="23.2" />
          <g>
            <rect x="12.3" y="14.7" fill="#E8EAE9" width="23.4" height="2.6" />
          </g>
          <g>
            <rect x="12.3" y="20.4" fill="#E8EAE9" width="23.4" height="2.6" />
          </g>
          <g>
            <path
              fill="#FFD15C"
              d="M45.9,22.5h-4.1v-3.1c0-1.2-0.9-2.1-2.1-2.1H29.4c-0.7,0-1.4,0.4-1.8,1L25,22.5H2.1
                c-1.3,0-2.3,1.2-2.1,2.5l3.4,19.3c0.2,1,1.1,1.7,2.1,1.7h36.9c1,0,1.9-0.7,2.1-1.7L48,25C48.2,23.7,47.2,22.5,45.9,22.5z"
            />
          </g>
        </g>
      </g>
    </svg>
  )
})

FolderIcon.displayName = 'FolderIcon'

export default FolderIcon

