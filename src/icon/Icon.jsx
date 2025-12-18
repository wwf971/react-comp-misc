import React from 'react';
import './Icon.css';
import CrossIcon from './CrossIcon';
import AddIcon from './AddIcon';
import SpinningCircle from './SpinningCircle';
import FolderIcon from './FolderIcon';

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
				stroke-width="2" 
				stroke-linejoin="round"/>
			
			{/* Folded corner */}
			<path d="M40 8 L40 20 L52 20" 
				fill="none" 
				stroke="#6c757d" 
				stroke-width="2" 
				stroke-linejoin="round"/>
			
			{/* File lines */}
			<line x1="18" y1="28" x2="46" y2="28" 
				stroke="#adb5bd" 
				stroke-width="1.5" 
				stroke-linecap="round"/>
			<line x1="18" y1="34" x2="42" y2="34" 
				stroke="#adb5bd" 
				stroke-width="1.5" 
				stroke-linecap="round"/>
			<line x1="18" y1="40" x2="46" y2="40" 
				stroke="#adb5bd" 
				stroke-width="1.5" 
				stroke-linecap="round"/>
			<line x1="18" y1="46" x2="38" y2="46" 
				stroke="#adb5bd" 
				stroke-width="1.5" 
				stroke-linecap="round"/>
		</svg>
	)
}, (prevProps, nextProps)=>{
	return prevProps.width === nextProps.width && prevProps.height === nextProps.height;
})

const DeleteIcon = React.memo(({ width = 24, height = 24 })=>{
	return (
		<svg 
			width={width} 
			height={height} 
			viewBox="0 0 24 24" 
			fill="none" 
			xmlns="http://www.w3.org/2000/svg"
			style={{ cursor: 'pointer' }}
		>
			<path 
				d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" 
				fill="currentColor"
			/>
		</svg>
	)
}, (prevProps, nextProps)=>{
	return prevProps.width === nextProps.width && prevProps.height === nextProps.height;
})


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

function ClearIcon({ width = 24, height = 24 }){ // clock-wise arrow
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
			<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
			<path d="M3 3v5h5"></path>
		</svg>
	)
}

const InfoIcon = React.memo(({ width = 24, height = 24 })=>{
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
			<circle cx="12" cy="12" r="10"></circle>
			<line x1="12" y1="16" x2="12" y2="12"></line>
			<line x1="12" y1="8" x2="12.01" y2="8"></line>
		</svg>
	)
}, (prevProps, nextProps)=>{
	return prevProps.width === nextProps.width && prevProps.height === nextProps.height;
})

const SuccessIcon = React.memo(({ width = 24, height = 24 })=>{
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
			<polyline points="20,6 9,17 4,12"></polyline>
		</svg>
	)
}, (prevProps, nextProps)=>{
	return prevProps.width === nextProps.width && prevProps.height === nextProps.height;
})

const ErrorIcon = React.memo(({ width = 24, height = 24 })=>{
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
			<line x1="18" y1="6" x2="6" y2="18"></line>
			<line x1="6" y1="6" x2="18" y2="18"></line>
		</svg>
	)
}, (prevProps, nextProps)=>{
	return prevProps.width === nextProps.width && prevProps.height === nextProps.height;
})

const UploadIcon = React.memo(({ width = 24, height = 24 })=>{
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
			<polyline points="16,16 12,12 8,16"></polyline>
			<line x1="12" y1="12" x2="12" y2="21"></line>
			<path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
		</svg>
	)
}, (prevProps, nextProps)=>{
	return prevProps.width === nextProps.width && prevProps.height === nextProps.height;
})

const BackIcon = React.memo(({ width = 24, height = 24 })=>{
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
			<polyline points="15,18 9,12 15,6"></polyline>
		</svg>
	)
}, (prevProps, nextProps)=>{
	return prevProps.width === nextProps.width && prevProps.height === nextProps.height;
})

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

const EyeIcon = React.memo(({ width = 24, height = 24 })=>{
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
			<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
			<circle cx="12" cy="12" r="3"></circle>
		</svg>
	)
}, (prevProps, nextProps)=>{
	return prevProps.width === nextProps.width && prevProps.height === nextProps.height;
})

const EyeOffIcon = React.memo(({ width = 24, height = 24 })=>{
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
			<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
			<line x1="1" y1="1" x2="23" y2="23"></line>
		</svg>
	)
}, (prevProps, nextProps)=>{
	return prevProps.width === nextProps.width && prevProps.height === nextProps.height;
})

export {
	FileIconDefault,
	DeleteIcon,
	SearchIcon,
	ClearIcon,
	InfoIcon,
	SuccessIcon,
	ErrorIcon,
	UploadIcon,
	BackIcon,
	ForwardIcon,
	EyeIcon,
	EyeOffIcon,
	CrossIcon,
	AddIcon,
	SpinningCircle,
	FolderIcon
}