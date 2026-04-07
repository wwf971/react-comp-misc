import React from 'react';

const CheckIcon = React.memo(({ width = 24, height = 24, circleColor = '#c8f2cc', checkColor = '#2e7d32' }) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={width}
			height={height}
			viewBox="0 0 24 24"
			role="img"
		>
			<circle cx="12" cy="12" r="11" fill={circleColor} />
			<path
				d="M7.8 12.2L10.6 15L16.4 9.2"
				fill="none"
				stroke={checkColor}
				strokeWidth="2.2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}, (prevProps, nextProps) => {
	return prevProps.width === nextProps.width
		&& prevProps.height === nextProps.height
		&& prevProps.circleColor === nextProps.circleColor
		&& prevProps.checkColor === nextProps.checkColor;
});

export default CheckIcon;

