import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useDerivedPathRef } from './pathRef';
import JsonKeyValueComp from './JsonKeyValueComp';
import { useJsonContext } from './JsonContext';
import { getJsonObjectSelectionItemId } from './jsonSelectionOperationStore';

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
  JsonCompMobx,
  getValueComp,
  parentSelectionItemId
}) => {
  const keyPathRef = useDerivedPathRef(pathPrefixRef, itemKey);
  const keyPath = keyPathRef.current;
  const getPath = useCallback(() => keyPathRef.current, [keyPathRef]);
  const value = data[itemKey];
  const isPrimitive = value === null || value === undefined || typeof value !== 'object';
  const { selectionOperationStore } = useJsonContext();
  const selectionItemId = getJsonObjectSelectionItemId(keyPath);
  const itemSelectionState = selectionOperationStore?.getItemSelectionState(selectionItemId);

  React.useEffect(() => {
    selectionOperationStore?.registerItem({
      itemId: selectionItemId,
      itemParentId: parentSelectionItemId,
      path: keyPath,
      itemKind: 'objectEntry',
      label: itemKey,
    });
  }, [itemKey, keyPath, parentSelectionItemId, selectionItemId, selectionOperationStore]);

  const handleSelectionMouseDownCapture = (event) => {
    if (!event.shiftKey || event.button !== 0) return;
    if (event.target.closest('.json-selection-item') !== event.currentTarget) return;
    event.preventDefault();
    event.stopPropagation();
    selectionOperationStore?.selectNextFromItem(selectionItemId);
  };

  const handleSelectionClickCapture = (event) => {
    if (!event.shiftKey || event.button !== 0) return;
    if (event.target.closest('.json-selection-item') !== event.currentTarget) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const selectionClassName = [
    'json-object-item',
    'json-selection-item',
    itemSelectionState?.isSelected ? 'is-json-selected' : '',
    itemSelectionState?.isSelectionAncestor ? 'is-json-selection-ancestor' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={selectionClassName}
      onMouseDownCapture={handleSelectionMouseDownCapture}
      onClickCapture={handleSelectionClickCapture}
    >
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
        getValueComp={getValueComp}
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
          getValueComp={getValueComp}
          parentSelectionItemId={selectionItemId}
        />
      </JsonKeyValueComp>
      {!isLastItem && isPrimitive && <span className="json-comma">,</span>}
    </div>
  );
});

ItemWrapperObject.displayName = 'ItemWrapperObject';

export default ItemWrapperObject;
