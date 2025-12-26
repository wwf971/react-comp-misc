import React from 'react';

const FileIconDefault = React.memo(({ width = 24, height = 24, ...props })=>{
	return (
		<svg 
			width={width} 
			height={height} 
			viewBox="0 0 64 64" 
			fill="none" 
			xmlns="http://www.w3.org/2000/svg"
			style={{ cursor: 'pointer' }}
		>
			{/* File body */}
			<path d="M12 8 L12 56 L52 56 L52 20 L40 8 Z" 
				fill="#f8f9fa" 
				stroke="#6c757d" 
				strokeWidth="2" 
				strokeLinejoin="round"/>
			
			{/* Folded corner */}
			<path d="M40 8 L40 20 L52 20" 
				fill="none" 
				stroke="#6c757d" 
				strokeWidth="2" 
				strokeLinejoin="round"/>
			
			{/* File lines */}
			<line x1="18" y1="28" x2="46" y2="28" 
				stroke="#adb5bd" 
				strokeWidth="1.5" 
				strokeLinecap="round"/>
			<line x1="18" y1="34" x2="42" y2="34" 
				stroke="#adb5bd" 
				strokeWidth="1.5" 
				strokeLinecap="round"/>
			<line x1="18" y1="40" x2="46" y2="40" 
				stroke="#adb5bd" 
				strokeWidth="1.5" 
				strokeLinecap="round"/>
			<line x1="18" y1="46" x2="38" y2="46" 
				stroke="#adb5bd" 
				strokeWidth="1.5" 
				strokeLinecap="round"/>
		</svg>
	)
}, (prevProps, nextProps)=>{
	return prevProps.width === nextProps.width && prevProps.height === nextProps.height;
})

export default FileIconDefault;

