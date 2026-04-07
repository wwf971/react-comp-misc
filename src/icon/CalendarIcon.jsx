import React from 'react';

const CalendarIcon = React.memo(({ width = 18, height = 18, color = 'currentColor' }) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={width}
			height={height}
			viewBox="0 0 24 24"
			fill="none"
			stroke={color}
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect x="3" y="4.5" width="18" height="16" rx="2" ry="2" />
			<line x1="16" y1="2.8" x2="16" y2="6.2" />
			<line x1="8" y1="2.8" x2="8" y2="6.2" />
			<line x1="3" y1="9" x2="21" y2="9" />
		</svg>
	);
}, (prevProps, nextProps) => {
	return prevProps.width === nextProps.width
		&& prevProps.height === nextProps.height
		&& prevProps.color === nextProps.color;
});

export default CalendarIcon;

