import React from 'react';
import { useJsonContext } from './JsonContext';
import './JsonComp.css';

/**
 * EmptyDict - Placeholder for empty objects
 */
const EmptyDict = ({ path }) => {
  const { showConversionMenu } = useJsonContext();

  const handleContextMenu = (e) => {
    if (!path) return;
    
    e.preventDefault();
    e.stopPropagation();

    if (showConversionMenu) {
      showConversionMenu({
        position: { x: e.clientX, y: e.clientY },
        menuType: 'emptyDict',
        path: path
      });
    }
  };

  return (
    <span 
      className="json-value json-empty-object"
      onContextMenu={handleContextMenu}
    >
      {'{ }'}
    </span>
  );
};

export default EmptyDict;
