import React from 'react';

const ForwardIcon = React.memo(({ width = 24, height = 24 })=>{
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
	)
}, (prevProps, nextProps)=>{
	return prevProps.width === nextProps.width && prevProps.height === nextProps.height;
})

export default ForwardIcon;

