import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import InfoIcon from './InfoIcon';

/**
 * InfoIcon with custom tooltip on hover
 * 
 * @param {Object} props
 * @param {string} props.tooltipText - The text to display in the tooltip
 * @param {number} props.width - Icon width (default: 14)
 * @param {number} props.height - Icon height (default: 14)
 * @param {string} props.color - Icon color (default: '#999')
 */
const InfoIconWithTooltip = ({ 
  tooltipText, 
  width = 14, 
  height = 14, 
  color = '#999'
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const iconRef = useRef(null);

  const handleMouseEnter = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX - 60
      });
    }
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <>
      <span 
        ref={iconRef}
        style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          cursor: 'help',
          color: color
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <InfoIcon width={width} height={height} />
      </span>
      {showTooltip && createPortal(
        <div 
          style={{
            position: 'absolute',
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            width: '180px',
            padding: '8px 10px',
            background: '#333',
            color: '#fff',
            borderRadius: '4px',
            fontSize: '11px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            zIndex: 10000,
            pointerEvents: 'none',
            lineHeight: '1.4'
          }}
        >
          {tooltipText}
        </div>,
        document.body
      )}
    </>
  );
};

export default InfoIconWithTooltip;
