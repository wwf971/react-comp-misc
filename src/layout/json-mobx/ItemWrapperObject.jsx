import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useDerivedPathRef } from './pathRef';
import JsonKeyValueComp from './JsonKeyValueComp';
import { useJsonContext } from './JsonContext';
import { getJsonObjectSelectionItemId } from './jsonSelectionOperationStore';
import { useJsonItemInteractionHandlers } from './useJsonItemInteractionHandlers';

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
  renderNestedJsonValue,
  getValueComp,
  parentSelectionItemId,
  itemPreviousPath,
  itemNextPath
}) => {
  const keyPathRef = useDerivedPathRef(pathPrefixRef, itemKey);
  const keyPath = keyPathRef.current;
  const getPath = useCallback(() => keyPathRef.current, [keyPathRef]);
  const value = data[itemKey];
  const isPrimitive = value === null || value === undefined || typeof value !== 'object';
  const {
    dragOperationStore,
    queryParentInfo,
    requestJsonContextMenu,
    selectionOperationStore,
  } = useJsonContext();
  const selectionItemId = getJsonObjectSelectionItemId(keyPath);
  const itemSelectionState = selectionOperationStore?.getItemSelectionState(selectionItemId);
  const isDragMoveEnabled = Boolean(dragOperationStore);
  const itemDragState = isDragMoveEnabled ? dragOperationStore?.getItemDragState(selectionItemId) : null;
  const containerChildKind = value && typeof value === 'object'
    ? (Array.isArray(value) ? 'array' : 'object')
    : null;
  const itemMeta = {
    itemId: selectionItemId,
    itemParentId: parentSelectionItemId,
    path: keyPath,
    itemKind: 'objectEntry',
    itemKey,
    label: itemKey,
    value,
    containerKind: 'object',
    containerPath: pathPrefixRef?.current || '',
    itemPreviousPath,
    itemNextPath,
    containerChildKind,
    containerPathForInside: containerChildKind ? keyPath : null,
  };

  React.useEffect(() => {
    selectionOperationStore?.registerItem(itemMeta);
    if (isDragMoveEnabled) {
      dragOperationStore.registerItem(itemMeta);
    }
  }, [dragOperationStore, isDragMoveEnabled, itemMeta, selectionOperationStore]);

  const {
    handleContextMenuCapture,
    handlePointerDownCapture,
    handleSelectionClickCapture,
    handleSelectionMouseDownCapture,
  } = useJsonItemInteractionHandlers({
    selectionItemId,
    itemMeta,
    itemSelectionState,
    isDragMoveEnabled,
    dragOperationStore,
    selectionOperationStore,
    requestJsonContextMenu,
    queryParentInfo,
    onChange,
  });

  const selectionClassName = [
    'json-object-item',
    'json-selection-item',
    itemSelectionState?.isSelected ? 'is-json-selected' : '',
    itemSelectionState?.isSelectionAncestor ? 'is-json-selection-ancestor' : '',
    itemDragState?.isDragged ? 'is-json-dragged' : '',
    itemDragState?.isDragHovered ? 'is-json-drag-hovered' : '',
    itemDragState?.isInsertBefore ? 'is-json-insert-before' : '',
    itemDragState?.isInsertAfter ? 'is-json-insert-after' : '',
    itemDragState?.isInsertInside ? 'is-json-insert-inside' : '',
    itemDragState?.isDropAllowed === false ? 'is-json-drop-blocked' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={selectionClassName}
      onPointerDownCapture={handlePointerDownCapture}
      onMouseDownCapture={handleSelectionMouseDownCapture}
      onClickCapture={handleSelectionClickCapture}
      onContextMenuCapture={handleContextMenuCapture}
      data-json-selection-item-id={selectionItemId}
    >
      {itemDragState?.isInsertBefore ? <div className="json-drop-line json-drop-line-before" /> : null}
      {itemDragState?.isInsertAfter ? <div className="json-drop-line json-drop-line-after" /> : null}
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
        {renderNestedJsonValue({
          data: value,
          isEditable,
          isKeyEditable,
          isValueEditable,
          onChange,
          indent,
          pathPrefix: '',
          pathPrefixRef: keyPathRef,
          depth: depth + 1,
          getValueComp,
          parentSelectionItemId: selectionItemId,
        })}
      </JsonKeyValueComp>
      {!isLastItem && isPrimitive && <span className="json-comma">,</span>}
    </div>
  );
});

ItemWrapperObject.displayName = 'ItemWrapperObject';

export default ItemWrapperObject;
