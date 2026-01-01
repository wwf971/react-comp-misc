import React from 'react';
import { useJsonContext } from './JsonContext';
import { getAvailableConversions } from './typeConvert';
import './JsonComp.css';

/**
 * EmptyDict - Display empty dict {}
 * Can be converted to other types via right-click
 */
const EmptyDict = ({ path }) => {
  const { showConversionMenu, queryParentInfo } = useJsonContext();
  
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (showConversionMenu) {
      // Check if this is a direct array item (not a dict entry inside an array)
      const pathParts = path.split('..');
      const isArrayItem = pathParts.length > 1 && !pathParts[pathParts.length - 1].includes('.');
      // Check if this is root (empty path or just "")
      const isRoot = !path || path === '';
      
      // Get parent info for position
      const parentInfo = queryParentInfo ? queryParentInfo(path) : { isSingleEntryInParent: false };
      
      // Get conversion options - string and null conversions disabled if root
      const conversions = getAvailableConversions({}, 'object').map(conv => {
        if ((conv.targetType === 'string' || conv.targetType === 'null') && isRoot) {
          return { ...conv, canConvert: false }; // Grey out string/null conversion for root
        }
        return conv;
      });
      
      showConversionMenu({
        position: { x: e.clientX, y: e.clientY },
        menuType: isArrayItem ? 'arrayItem' : 'emptyDict',
        path: path,
        value: {},
        currentValue: {},
        currentType: 'object',
        availableConversions: conversions,
        isSingleEntryInParent: parentInfo.isSingleEntryInParent,
        isFirstInParent: parentInfo.isFirstInParent,
        isLastInParent: parentInfo.isLastInParent
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

