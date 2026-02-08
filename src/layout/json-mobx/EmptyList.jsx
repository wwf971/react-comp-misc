import React from 'react';
import { useJsonContext } from './JsonContext';
import './JsonComp.css';

/**
 * EmptyList - Placeholder for empty arrays
 */
const EmptyList = ({ path }) => {
  const { showConversionMenu } = useJsonContext();

  const handleContextMenu = (e) => {
    if (!path) return;
    
    e.preventDefault();
    e.stopPropagation();

    if (showConversionMenu) {
      showConversionMenu({
        position: { x: e.clientX, y: e.clientY },
        menuType: 'emptyList',
        path: path
      });
    }
  };

  return (
    <span 
      className="json-value json-empty-array"
      onContextMenu={handleContextMenu}
    >
      {'[ ]'}
    </span>
  );
};

export default EmptyList;
