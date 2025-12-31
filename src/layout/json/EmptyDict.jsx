import React from 'react';
import { useJsonContext } from './JsonContext';
import './JsonComp.css';

/**
 * EmptyDict - Display empty dict {}
 * Can be converted to other types via right-click
 */
const EmptyDict = ({ path }) => {
  const { showConversionMenu } = useJsonContext();
  
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (showConversionMenu) {
      // Check if this is an array item by looking for ".." in path
      const isArrayItem = path.includes('..');
      
      showConversionMenu({
        position: { x: e.clientX, y: e.clientY },
        menuType: isArrayItem ? 'arrayItem' : 'emptyDict',
        path: path,
        value: {}
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

