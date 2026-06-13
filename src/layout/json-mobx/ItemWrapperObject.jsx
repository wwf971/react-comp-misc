import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useDerivedPathRef } from './pathRef';
import JsonKeyValueComp from './JsonKeyValueComp';
import { useJsonContext } from './JsonContext';
import { getJsonObjectSelectionItemId } from './jsonSelectionOperationStore';
import { getIsJsonDropAllowedByDefault, getJsonDropInfoFromEvent } from './jsonDragMove';
import { getJsonContextMenuTargetMeta } from './jsonContextMenu';

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
  };

  React.useEffect(() => {
    selectionOperationStore?.registerItem(itemMeta);
    if (isDragMoveEnabled) {
      dragOperationStore.registerItem(itemMeta);
    }
  }, [dragOperationStore, isDragMoveEnabled, itemMeta, selectionOperationStore]);

  const handleSelectionMouseDownCapture = (event) => {
    // Plain left click should leave selection mode immediately; shift-click is the only selection gesture.
    if (!event.shiftKey && event.button === 0) {
      selectionOperationStore?.clearSelection();
      return;
    }
    if (!event.shiftKey || event.button !== 0) return;
    if (event.target.closest('.json-selection-item') !== event.currentTarget) return;
    if (!itemSelectionState?.isSelected) {
      event.preventDefault();
    }
    event.stopPropagation();
  };

  const handleSelectionClickCapture = (event) => {
    if (!event.shiftKey || event.button !== 0) return;
    if (event.target.closest('.json-selection-item') !== event.currentTarget) return;
    event.preventDefault();
    event.stopPropagation();
    selectionOperationStore?.selectNextFromItem(selectionItemId);
  };

  const handleContextMenuCapture = (event) => {
    if (event.target.closest('.json-selection-item') !== event.currentTarget) return;
    event.preventDefault();
    event.stopPropagation();
    const itemMetaTarget = getJsonContextMenuTargetMeta({
      itemIdClicked: selectionItemId,
      itemMetaClicked: itemMeta,
      selectionOperationStore,
    });
    requestJsonContextMenu?.({
      itemMeta: itemMetaTarget,
      position: { x: event.clientX, y: event.clientY },
      queryParentInfo,
    });
  };

  const handleDragStart = (event) => {
    if (!isDragMoveEnabled) return;
    const isDragSelectedItem = selectionOperationStore?.selectedItemId === selectionItemId;
    if (!event.shiftKey || !isDragSelectedItem) {
      event.preventDefault();
      return;
    }
    event.stopPropagation();
    dragOperationStore?.startDrag(selectionItemId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', selectionItemId);
  };

  const handleDragOver = (event) => {
    if (!isDragMoveEnabled || !dragOperationStore?.isDragging) return;
    const containerChildKind = value && typeof value === 'object'
      ? (Array.isArray(value) ? 'array' : 'object')
      : null;
    event.preventDefault();
    event.stopPropagation();
    const dropInfo = getJsonDropInfoFromEvent({
      event,
      itemMeta,
      itemPreviousMeta: itemPreviousPath ? { path: itemPreviousPath } : null,
      itemNextMeta: itemNextPath ? { path: itemNextPath } : null,
      containerChildKind,
      containerPath: containerChildKind ? keyPath : null,
    });
    const isDropAllowed = getIsJsonDropAllowedByDefault({
      dropInfo,
      dragOperationStore,
      selectionOperationStore,
    });
    dragOperationStore.previewDrop(dropInfo, isDropAllowed);
  };

  const handleDrop = async (event) => {
    if (!isDragMoveEnabled || !dragOperationStore?.isDragging) return;
    event.preventDefault();
    event.stopPropagation();
    const itemDraggedMeta = dragOperationStore.itemDraggedMeta;
    const dropInfoActive = dragOperationStore.dropInfoActive;
    const itemDragStateActive = dropInfoActive?.targetItemId
      ? dragOperationStore.getItemDragState(dropInfoActive.targetItemId)
      : null;
    if (itemDraggedMeta && dropInfoActive?.drop && itemDragStateActive?.isDropAllowed !== false && onChange) {
      const result = await onChange(itemDraggedMeta.path, {
        old: { type: itemDraggedMeta.itemKind },
        new: { type: itemDraggedMeta.itemKind },
        _action: 'moveJsonItem',
        moveRequest: {
          source: itemDraggedMeta,
          drop: dropInfoActive.drop,
        },
      });
      if (!result || result.code === 0) {
        selectionOperationStore?.clearSelection();
      }
    }
    dragOperationStore.clearAll();
  };

  const handleDragEnd = () => {
    if (!isDragMoveEnabled) return;
    dragOperationStore?.clearAll();
  };

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
      draggable={isDragMoveEnabled}
      onMouseDownCapture={handleSelectionMouseDownCapture}
      onClickCapture={handleSelectionClickCapture}
      onContextMenuCapture={handleContextMenuCapture}
      onDragStart={isDragMoveEnabled ? handleDragStart : undefined}
      onDragOver={isDragMoveEnabled ? handleDragOver : undefined}
      onDrop={isDragMoveEnabled ? handleDrop : undefined}
      onDragEnd={isDragMoveEnabled ? handleDragEnd : undefined}
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
