import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import JsonListItemComp from './JsonListItemComp';
import PseudoListItem from './PseudoListItem';
import { getStableKey } from './keysManage';

/**
 * ItemWrapperArray - Isolated observer for each array item
 * This prevents sibling items from re-rendering when one item changes
 */
const ItemWrapperArray = observer(({ 
  data,
  index,
  itemData,
  pathPrefixRef,
  isEditable,
  isKeyEditable,
  isValueEditable,
  onChange,
  indent,
  depth,
  JsonCompMobx
}) => {
  // Use itemData directly instead of data[index] to avoid MobX tracking
  const item = itemData !== undefined ? itemData : data[index];
  const getItemPath = useCallback(() => {
    const prefix = pathPrefixRef?.current || '';
    return prefix ? `${prefix}..${index}` : `..${index}`;
  }, [index, pathPrefixRef]);
  const isLastItem = index === data.length - 1;
  const isPrimitive = item === null || item === undefined || typeof item !== 'object';
  const isPseudo = item && typeof item === 'object' && item.isPseudo;
  
  // Use stable key - for objects use WeakMap, for primitives use value+index
  const stableKey = getStableKey(item, index);

  if (isPseudo) {
    return (
      <div key={stableKey} className="json-array-item">
        <PseudoListItem
          getPath={getItemPath}
          parentData={data}
          index={index}
          onChange={onChange}
          onCancel={() => {
            // Remove pseudo item by mutating array
            data.splice(index, 1);
          }}
          depth={depth}
        />
      </div>
    );
  }

  return (
    <div key={stableKey} className="json-array-item">
      <JsonListItemComp
        parentData={data}
        index={index}
        itemData={item}
        getPath={getItemPath}
        isEditable={isEditable && isValueEditable}
        onChange={onChange}
        depth={depth}
      >
        <JsonCompMobx
          data={item}
          isEditable={isEditable}
          isKeyEditable={isKeyEditable}
          isValueEditable={isValueEditable}
          onChange={onChange}
          indent={indent}
          pathPrefix={getItemPath()}
          depth={depth + 1}
          isArrayItem={true}
        />
      </JsonListItemComp>
      {!isLastItem && isPrimitive && <span className="json-comma">,</span>}
    </div>
  );
});

ItemWrapperArray.displayName = 'ItemWrapperArray';

export default ItemWrapperArray;
