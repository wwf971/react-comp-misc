import React from 'react';

function SearchIcon({ width = 24, height = 24 }){
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
			className="lucide lucide-search"
		>
			<circle cx="11" cy="11" r="8"></circle>
			<path d="m21 21-4.3-4.3"></path>
		</svg>
	)
}

export default SearchIcon;

