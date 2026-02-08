import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useDerivedPathRef } from './pathRef';
import JsonKeyValueComp from './JsonKeyValueComp';

/**
 * ObjectItemWrapper - Isolated observer for each object key-value pair
 * This prevents sibling entries from re-rendering when one entry changes
 */
const ItemWrapperObject = observer(({
  data,
  itemKey,
  pathPrefixRef,
  isEditable,
  isKeyEditable,
  isValueEditable,
  onChange,
  indent,
  depth,
  isLastItem,
  JsonCompMobx
}) => {
  const keyPathRef = useDerivedPathRef(pathPrefixRef, itemKey);
  const keyPath = keyPathRef.current;
  const getPath = useCallback(() => keyPathRef.current, [keyPathRef]);
  const value = data[itemKey];
  const isPrimitive = value === null || value === undefined || typeof value !== 'object';

  return (
    <div className="json-object-item">
      <JsonKeyValueComp
        data={data}
        itemKey={itemKey}
        path={keyPath}
        getPath={getPath}
        isEditable={isEditable}
        isKeyEditable={isKeyEditable}
        isValueEditable={isValueEditable}
        onChange={onChange}
        depth={depth}
      >
        <JsonCompMobx
          data={value}
          isEditable={isEditable}
          isKeyEditable={isKeyEditable}
          isValueEditable={isValueEditable}
          onChange={onChange}
          indent={indent}
          pathPrefix=""
          pathPrefixRef={keyPathRef}
          depth={depth + 1}
        />
      </JsonKeyValueComp>
      {!isLastItem && isPrimitive && <span className="json-comma">,</span>}
    </div>
  );
});

ItemWrapperObject.displayName = 'ItemWrapperObject';

export default ItemWrapperObject;
