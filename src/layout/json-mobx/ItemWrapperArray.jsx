import React, { useRef } from 'react';
import { observer } from 'mobx-react-lite';
import JsonListItemComp from './JsonListItemComp';
import PseudoListItem from './PseudoListItem';
import { getStableKey } from './keysManage';
import { useJsonContext } from './JsonContext';
import { getJsonArraySelectionItemId } from './jsonSelectionOperationStore';
import {
  useJsonItemInteraction,
  useJsonSelectionRenderRevision,
} from './useJsonItemInteraction';

const ItemWrapperArray = observer(({ data }) => {
  const {
    container,
    itemIndex,
    pathRef,
    parentItemId,
    itemPathPrevious,
    itemPathNext,
  } = data;
  const { config, store, emitEvent, pathQueryParentInfo, requestJsonContextMenu, renderNestedJson } = useJsonContext();
  const { selection, drag } = store;
  const itemIndexRef = useRef(itemIndex);
  itemIndexRef.current = itemIndex;
  const itemPathRef = useRef(null);
  if (!itemPathRef.current) {
    itemPathRef.current = {
      get current() {
        const prefix = pathRef?.current || '';
        return prefix ? `${prefix}..${itemIndexRef.current}` : `..${itemIndexRef.current}`;
      },
    };
  }
  const item = container[itemIndex];
  const itemPath = itemPathRef.current;
  const isLastItem = itemIndex === container.length - 1;
  const isPrimitive = item === null || item === undefined || typeof item !== 'object';
  const isPseudo = item && typeof item === 'object' && item.isPseudo;
  const stableKey = getStableKey(item, itemIndex);
  const selectionItemId = getJsonArraySelectionItemId(itemPath);
  const revisionSelectionRender = useJsonSelectionRenderRevision(selection);
  const itemSelectionState = !isPseudo
    ? selection?.getItemSelectionState(selectionItemId)
    : null;
  const isDragMoveEnabled = config.isDragMoveEnabled;
  const itemDragState = !isPseudo && isDragMoveEnabled
    ? drag?.getItemDragState(selectionItemId)
    : null;
  const containerChildKind = item && typeof item === 'object'
    ? (Array.isArray(item) ? 'array' : 'object')
    : null;
  const itemMeta = {
    itemId: selectionItemId,
    itemParentId: parentItemId,
    path: itemPath,
    itemKind: 'arrayItem',
    itemKey: itemIndex,
    label: `[${itemIndex}]`,
    value: item,
    containerKind: 'array',
    containerPath: pathRef?.current || '',
    itemPreviousPath: itemPathPrevious,
    itemNextPath: itemPathNext,
    containerChildKind,
    containerPathForInside: containerChildKind ? itemPath : null,
  };

  React.useEffect(() => {
    if (isPseudo) return;
    selection?.registerItem(itemMeta);
    if (isDragMoveEnabled) {
      drag.registerItem(itemMeta);
    }
  }, [drag, isDragMoveEnabled, isPseudo, itemMeta, selection]);

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

  if (isPseudo) {
    return (
      <div key={stableKey} className="json-array-item">
        <PseudoListItem
          data={{
            container,
            itemIndex,
            path: itemPath,
          }}
        />
      </div>
    );
  }

  const selectionClassName = [
    'json-array-item',
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
      key={stableKey}
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
      <JsonListItemComp
        data={{
          container,
          itemIndex,
          path: itemPath,
        }}
      >
        {renderNestedJson(item, {
          pathRef: itemPathRef,
          parentItemId: selectionItemId,
          isItemInArray: true,
        })}
      </JsonListItemComp>
      {!isLastItem && isPrimitive && <span className="json-comma">,</span>}
    </div>
  );
});

ItemWrapperArray.displayName = 'ItemWrapperArray';

export default ItemWrapperArray;
