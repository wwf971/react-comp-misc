import React from 'react';

const EditIconNotepad = React.memo(({ width = 24, height = 24 })=>{
	return (
		<svg 
			width={width} 
			height={height} 
			viewBox="0 0 129.22 129.22"
			xmlns="http://www.w3.org/2000/svg"
			style={{ cursor: 'pointer' }}
		>
			<g id="layer_2" data-name="layer 2">
				<g id="layer_1" data-name="layer 1">
					<path 
						d="M104.59,129.11H14a14,14,0,0,1-14-14V24.82a14,14,0,0,1,14-14H75.29l-11,11H22.34A11.34,11.34,0,0,0,11,33.15v73.62a11.34,11.34,0,0,0,11.34,11.34H96.26a11.33,11.33,0,0,0,11.33-11.34V64.47l11-11v61.64A14,14,0,0,1,104.59,129.11Z"
						fill="currentColor"
					/>
					<polygon 
						points="94.79 15.65 36.83 75.56 32.43 96.69 53.74 92.05 113.09 33.91 94.79 15.65"
						fill="currentColor"
					/>
					<path 
						d="M98,12.35l18.57,18.7,10.94-10.92a5.67,5.67,0,0,0,0-8.07L116.83,1.62a5.66,5.66,0,0,0-8,0Z"
						fill="currentColor"
					/>
				</g>
			</g>
		</svg>
	)
}, (prevProps, nextProps)=>{
	return prevProps.width === nextProps.width && prevProps.height === nextProps.height;
})

export default EditIconNotepad;
