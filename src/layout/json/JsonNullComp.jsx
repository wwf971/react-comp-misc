import React from 'react';
import { useJsonContext } from './JsonContext';
import { getAvailableConversions } from './typeConvert';
import './JsonComp.css';

/**
 * JsonNullComp - Display null values
 * Can be converted to other types via right-click
 */
const JsonNullComp = ({ path }) => {
  const { showConversionMenu, queryParentInfo } = useJsonContext();
  
  // Render tracking
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Render] JsonNullComp: ${path}`);
  }
  
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (showConversionMenu) {
      // Check if this is a direct array item (not a dict entry inside an array)
      const pathParts = path.split('..');
      const isArrayItem = pathParts.length > 1 && !pathParts[pathParts.length - 1].includes('.');
      
      const parentInfo = queryParentInfo ? queryParentInfo(path) : { isSingleEntryInParent: false };
      
      showConversionMenu({
        position: { x: e.clientX, y: e.clientY },
        currentValue: null,
        currentType: 'null',
        path,
        menuType: isArrayItem ? 'arrayItem' : 'value',
        value: null,
        availableConversions: getAvailableConversions(null, 'null'),
        isSingleEntryInParent: parentInfo.isSingleEntryInParent,
        isFirstInParent: parentInfo.isFirstInParent,
        isLastInParent: parentInfo.isLastInParent
      });
    }
  };
  
  return (
    <span 
      className="json-value json-null"
      onContextMenu={handleContextMenu}
    >
      null
    </span>
  );
};

export default JsonNullComp;

