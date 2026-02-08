import React from 'react';
import { observer } from 'mobx-react-lite';
import { useJsonContext } from './JsonContext';
import { getAvailableConversions } from './typeConvert';
import './JsonComp.css';

/**
 * JsonNullComp - MobX-based null value component
 * Note: null doesn't have parent data, so it can't use persistent render counts
 * We'll just show a static indicator
 */
const JsonNullComp = observer(({ path, getPath }) => {
  const { showConversionMenu, queryParentInfo, isDebug } = useJsonContext();

  const handleContextMenu = (e) => {
    const currentPath = getPath ? getPath() : path;
    if (!currentPath) return;
    
    e.preventDefault();
    e.stopPropagation();

    if (showConversionMenu) {
      const pathParts = currentPath.split('..');
      const isArrayItem = pathParts.length > 1 && !pathParts[pathParts.length - 1].includes('.');
      const parentInfo = queryParentInfo ? queryParentInfo(currentPath) : { isSingleEntryInParent: false };
      
        showConversionMenu({
          position: { x: e.clientX, y: e.clientY },
          currentValue: null,
          currentType: 'null',
          path: currentPath,
          menuType: isArrayItem ? 'arrayItem' : 'value',
          value: null,
          itemKey: undefined,
          availableConversions: getAvailableConversions(null, 'null', { includeArray: true, includeObject: true }),
          isSingleEntryInParent: parentInfo.isSingleEntryInParent,
          isFirstInParent: parentInfo.isFirstInParent,
          isLastInParent: parentInfo.isLastInParent
        });
    }
  };

  return (
    <span className="json-value-wrapper">
      <span 
        className="json-value json-null"
        onContextMenu={handleContextMenu}
      >
        null
      </span>
    </span>
  );
});

JsonNullComp.displayName = 'JsonNullComp';

export default JsonNullComp;
