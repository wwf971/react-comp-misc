import React from 'react';

const ExternalLinkIcon = React.memo(({ width = 24, height = 24 }) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={width}
			height={height}
			viewBox="0 0 138.73 135.91"
			fill="currentColor"
		>
			<path d="M104.59,135.91H14a14,14,0,0,1-14-14V31.62a14,14,0,0,1,14-14H75.29l-10.7,13.8H25.53A11.53,11.53,0,0,0,14,43v70.62a8.33,8.33,0,0,0,8.34,8.34H93.05a11.53,11.53,0,0,0,11.54-11.54V71.28l14-11v61.63A14,14,0,0,1,104.59,135.91Z" />
			<polygon points="39.19 87.86 111.77 13.8 78.64 13.8 90.03 0 138.59 0.53 138.73 45.29 123.92 57.26 123.92 25.01 49.73 98.63 39.19 99.6 39.19 87.86" />
		</svg>
	)
}, (prevProps, nextProps) => {
	return prevProps.width === nextProps.width && prevProps.height === nextProps.height;
})

export default ExternalLinkIcon;
