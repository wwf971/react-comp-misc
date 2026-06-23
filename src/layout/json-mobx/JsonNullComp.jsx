import React from 'react';
import { observer } from 'mobx-react-lite';
import { useJsonContext } from './JsonContext';
import { getAvailableConversions } from './typeConvert.js';
import './JsonComp.css';

/**
 * JsonNullComp - MobX-based null value component
 */
const JsonNullComp = observer(({ data }) => {
  const { path } = data;
  const { store, pathQueryParentInfo } = useJsonContext();
  const { openMenu } = store;

  const handleContextMenu = (e) => {
    if (!path) return;
    
    e.preventDefault();
    e.stopPropagation();

    const pathParts = path.split('..');
    const isArrayItem = pathParts.length > 1 && !pathParts[pathParts.length - 1].includes('.');
    const parentInfo = pathQueryParentInfo ? pathQueryParentInfo(path) : { isSingleEntryInParent: false };
    
    openMenu({
      position: { x: e.clientX, y: e.clientY },
      currentValue: null,
      currentType: 'null',
      path,
      menuType: isArrayItem ? 'arrayItem' : 'value',
      value: null,
      itemKey: undefined,
      availableConversions: getAvailableConversions(null, 'null', { includeArray: true, includeObject: true }),
      isSingleEntryInParent: parentInfo.isSingleEntryInParent,
      isFirstInParent: parentInfo.isFirstInParent,
      isLastInParent: parentInfo.isLastInParent
    });
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
