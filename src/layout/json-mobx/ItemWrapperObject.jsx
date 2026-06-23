import React from 'react';
import { observer } from 'mobx-react-lite';
import { useDerivedPathRef } from './pathRef';
import JsonKeyValueComp from './JsonKeyValueComp';
import { useJsonContext } from './JsonContext';
import { getJsonObjectSelectionItemId } from './jsonSelectionOperationStore';
import {
  useJsonItemInteraction,
  useJsonSelectionRenderRevision,
} from './useJsonItemInteraction';

const ItemWrapperObject = observer(({ data }) => {
  const {
    container,
    itemKey,
    pathRef,
    parentItemId,
    itemPathPrevious,
    itemPathNext,
    isLastItem,
  } = data;
  const { config, store, emitEvent, pathQueryParentInfo, requestJsonContextMenu, renderNestedJson } = useJsonContext();
  const { selection, drag } = store;
  const keyPathRef = useDerivedPathRef(pathRef, itemKey);
  const keyPath = keyPathRef.current;
  const value = container[itemKey];
  const isPrimitive = value === null || value === undefined || typeof value !== 'object';
  const selectionItemId = getJsonObjectSelectionItemId(keyPath);
  const revisionSelectionRender = useJsonSelectionRenderRevision(selection);
  const itemSelectionState = selection?.getItemSelectionState(selectionItemId);
  const isDragMoveEnabled = config.isDragMoveEnabled;
  const itemDragState = isDragMoveEnabled ? drag?.getItemDragState(selectionItemId) : null;
  const containerChildKind = value && typeof value === 'object'
    ? (Array.isArray(value) ? 'array' : 'object')
    : null;
  const itemMeta = {
    itemId: selectionItemId,
    itemParentId: parentItemId,
    path: keyPath,
    itemKind: 'objectEntry',
    itemKey,
    label: itemKey,
    value,
    containerKind: 'object',
    containerPath: pathRef?.current || '',
    itemPreviousPath: itemPathPrevious,
    itemNextPath: itemPathNext,
    containerChildKind,
    containerPathForInside: containerChildKind ? keyPath : null,
  };

  React.useEffect(() => {
    selection?.registerItem(itemMeta);
    if (isDragMoveEnabled) {
      drag.registerItem(itemMeta);
    }
  }, [drag, isDragMoveEnabled, itemMeta, selection]);

  const {
    handleContextMenuCapture,
    handlePointerDownCapture,
    handleSelectionClickCapture,
    handleSelectionMouseDownCapture,
  } = useJsonItemInteraction({
    selectionItemId,
    itemMeta,
    itemSelectionState,
    isDragMoveEnabled,
    drag,
    selection,
    requestJsonContextMenu,
    pathQueryParentInfo,
    emitEvent,
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
      data-json-selection-render-revision={revisionSelectionRender}
    >
      {itemDragState?.isInsertBefore ? <div className="json-drop-line json-drop-line-before" /> : null}
      {itemDragState?.isInsertAfter ? <div className="json-drop-line json-drop-line-after" /> : null}
      <JsonKeyValueComp
        data={{
          container,
          itemKey,
          path: keyPath,
        }}
      >
        {renderNestedJson(value, {
          pathRef: keyPathRef,
          parentItemId: selectionItemId,
          isItemInArray: false,
        })}
      </JsonKeyValueComp>
      {!isLastItem && isPrimitive && <span className="json-comma">,</span>}
    </div>
  );
});

ItemWrapperObject.displayName = 'ItemWrapperObject';

export default ItemWrapperObject;
